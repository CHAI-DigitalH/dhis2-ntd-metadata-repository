#!/usr/bin/env python3
"""
build_metadata_package.py — assemble the single, importable metadata/full_package.json
from DHIS2 dependency exports.

Two modes:

  (A) Offline merge — you ran "Metadata dependency export" in the Import/Export app
      for each dashboard (with "Skip sharing and access settings" ON) and saved the
      JSON files into a directory. This merges + dedupes + cleans them into one file:

        python3 tools/build_metadata_package.py --in-dir exports/ --out metadata/full_package.json

  (B) Live pull — fetch the dependency export for one or more dashboards straight from
      an instance via /api/dashboards/<id>/metadata.json, then merge:

        python3 tools/build_metadata_package.py \
            --base-url https://ref-instance.org --username admin --password ... \
            --dashboards abc123 def456 ... \
            --out metadata/full_package.json

The importer sorts object types by dependency internally, so the merged file can be
imported in one POST (see docs/setup.md). This script orders object types only for a
tidy, predictable file.
"""

import argparse
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json  # noqa: E402
from _ntd_common import (  # noqa: E402
    AUDIT_AND_SHARING_FIELDS,
    IMPORT_ORDER,
    add_auth_args,
    make_session,
)

# Envelope keys that are metadata about the export, not importable object collections.
NON_OBJECT_KEYS = {"system", "date"}

# Every DHIS2 instance already has "default" category metadata (fixed well-known UIDs).
# Shipping them invites collisions with the target's own defaults, so drop them from
# these object types when the object is the default (name or code == "default").
DEFAULT_BEARING_TYPES = {"categories", "categoryOptions", "categoryCombos", "categoryOptionCombos"}


def is_default_object(item):
    return (item.get("name") == "default") or (item.get("code") == "default")


def scrub_fields(node):
    if isinstance(node, dict):
        return {k: scrub_fields(v) for k, v in node.items() if k not in AUDIT_AND_SHARING_FIELDS}
    if isinstance(node, list):
        return [scrub_fields(v) for v in node]
    return node


def merge_export(dest, export, report):
    """Merge one dependency-export dict into dest, deduping objects by id per type."""
    for obj_type, items in export.items():
        if obj_type in NON_OBJECT_KEYS or not isinstance(items, list):
            continue
        bucket = dest.setdefault(obj_type, {})
        for item in items:
            if obj_type in DEFAULT_BEARING_TYPES and is_default_object(item):
                report["defaults_excluded"] += 1
                continue
            oid = item.get("id")
            key = oid or f"__noid_{len(bucket)}"
            if oid and oid in bucket:
                report["duplicates"] += 1
                continue
            bucket[key] = item


def load_offline(in_dir, report):
    files = sorted(glob.glob(os.path.join(in_dir, "*.json")))
    if not files:
        sys.exit(f"No .json files found in {in_dir}")
    dest = {}
    for path in files:
        with open(path, "r", encoding="utf-8") as fh:
            export = json.load(fh)
        merge_export(dest, export, report)
        report["files"].append(os.path.basename(path))
    return dest


def load_from_api(base_url, session, dashboard_ids, dataset_ids, report):
    """
    Period-preserving live export. The dashboard/dataset dependency-export endpoint
    correctly identifies WHICH objects belong in the package, but returns visualizations
    as shells (periods, legend blocks, and map internals are dropped). So we:
      1. dependency-export the dashboards + datasets to get the object SET;
      2. re-fetch every visualization via /api/metadata.json (which DOES preserve
         rawPeriods/relativePeriods) and replace the shells;
      3. pull the legendSets the chart legends reference, so legends survive import;
      4. drop maps + their dashboard items (maps do not import via the metadata API —
         recreate them in the Maps app after install; see docs/setup.md).
    """
    base = base_url.rstrip("/")
    dest = {}
    for did in dashboard_ids:
        resp = session.get(f"{base}/api/dashboards/{did}/metadata.json", timeout=120)
        resp.raise_for_status()
        merge_export(dest, resp.json(), report)
        report["files"].append(f"dashboard:{did}")
    for dsid in dataset_ids or []:
        resp = session.get(f"{base}/api/dataSets/{dsid}/metadata.json", timeout=120)
        resp.raise_for_status()
        merge_export(dest, resp.json(), report)
        report["files"].append(f"dataSet:{dsid}")

    # 2) re-fetch visualizations with periods preserved
    if dest.get("visualizations"):
        allviz = session.get(f"{base}/api/metadata.json?visualizations=true", timeout=300).json().get("visualizations", [])
        by_id = {v["id"]: v for v in allviz}
        refetched = 0
        for vid in list(dest["visualizations"].keys()):
            if vid in by_id:
                dest["visualizations"][vid] = by_id[vid]
                refetched += 1
        report["viz_refetched"] = refetched

    # 3) include legendSets referenced by chart legends
    ls_ids = set()
    for v in dest.get("visualizations", {}).values():
        s = (v.get("legend") or {}).get("set")
        if s and s.get("id"):
            ls_ids.add(s["id"])
    if ls_ids:
        allls = session.get(f"{base}/api/metadata.json?legendSets=true", timeout=120).json().get("legendSets", [])
        dest.setdefault("legendSets", {})
        for ls in allls:
            if ls["id"] in ls_ids:
                dest["legendSets"][ls["id"]] = ls

    # 4) drop maps + their dashboard items (maps can't import via the metadata API)
    map_ids = set(dest.get("maps", {}).keys())
    dest.pop("maps", None)
    report["maps_dropped"] = len(map_ids)
    for d in dest.get("dashboards", {}).values():
        if d.get("dashboardItems"):
            d["dashboardItems"] = [it for it in d["dashboardItems"] if not (it.get("map") and it["map"].get("id") in map_ids)]

    return dest


def finalize(dest):
    """Flatten the per-type dicts back to lists, scrub, and order by IMPORT_ORDER."""
    ordered = {}
    remaining = dict(dest)
    for obj_type in IMPORT_ORDER:
        if obj_type in remaining:
            ordered[obj_type] = scrub_fields(list(remaining.pop(obj_type).values()))
    # Anything not in the known order goes last, alphabetically, so nothing is dropped.
    for obj_type in sorted(remaining):
        ordered[obj_type] = scrub_fields(list(remaining[obj_type].values()))
    return ordered


def main():
    parser = argparse.ArgumentParser(description="Assemble the NTD metadata package from dependency exports")
    parser.add_argument("--in-dir", help="Directory of dependency-export JSON files (offline merge mode)")
    parser.add_argument("--dashboards", nargs="+", help="Dashboard UIDs to pull via API (live mode)")
    parser.add_argument("--datasets", nargs="+", help="Dataset UIDs to pull via API (live mode; carries datasets + their indicators)")
    parser.add_argument("--out", required=True, help="Output package path, e.g. metadata/full_package.json")
    # Auth flags only needed for --dashboards mode:
    parser.add_argument("--base-url", help="DHIS2 base URL (live mode)")
    parser.add_argument("--username")
    parser.add_argument("--password")
    parser.add_argument("--token")
    args = parser.parse_args()

    report = {"files": [], "duplicates": 0, "defaults_excluded": 0}

    if args.in_dir:
        dest = load_offline(args.in_dir, report)
    elif args.dashboards or args.datasets:
        if not args.base_url:
            sys.exit("--dashboards/--datasets require --base-url (and credentials).")
        session = make_session(args.username, args.password, args.token)
        dest = load_from_api(args.base_url, session, args.dashboards or [], args.datasets or [], report)
    else:
        sys.exit("Provide either --in-dir (offline merge) or --dashboards/--datasets + --base-url (live pull).")

    package = finalize(dest)

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(package, fh, indent=2)
        fh.write("\n")

    print(f"Wrote {args.out}")
    print(f"  sources merged : {len(report['files'])} ({', '.join(report['files'])})")
    print(f"  duplicates skipped : {report['duplicates']}")
    print(f"  default objects excluded : {report['defaults_excluded']}")
    if "viz_refetched" in report:
        print(f"  visualizations re-fetched with periods : {report['viz_refetched']}")
    if "maps_dropped" in report:
        print(f"  maps dropped (recreate in Maps app) : {report['maps_dropped']}")
    if package.get("visualizations"):
        withp = sum(1 for v in package["visualizations"]
                    if v.get("rawPeriods") or any((v.get("relativePeriods") or {}).values()))
        print(f"  visualizations with a period : {withp}/{len(package['visualizations'])}")
    print("  object counts:")
    for obj_type, items in package.items():
        print(f"    {obj_type:24} {len(items)}")


if __name__ == "__main__":
    main()
