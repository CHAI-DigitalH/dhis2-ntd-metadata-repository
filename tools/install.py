#!/usr/bin/env python3
"""
install.py — one-command installer for the NTD metadata package on a fresh DHIS2.

Order of operations (see docs/setup.md and docs/adaptation.md):
  1. Connect + verify DHIS2 version.
  2. Preflight ORG UNITS — a hard prerequisite. If the instance has no administrative
     hierarchy below the national level, STOP and tell the user to set it up first.
     Also warn if district-level org units lack geometry (maps will render blank).
  3. Detect / confirm the national root org unit.
  4. Run configure.py to adapt the package (swap national UID, scrub, strip dataset OUs).
  5. Dry-run the metadata import; show a summary; then commit (atomic).
  6. Import the validation rules.
  7. Import the access scaffold (generic NTD roles + user groups).
  8. Assign every dataset to national + district-level org units (data entry works OOTB).
  9. Apply a sharing pattern so dashboards are visible and datasets enterable.
 10. Regenerate category option combos (belt-and-suspenders).

After this, the only remaining manual work is loading data (docs/data-sources.md) and,
if maps are wanted, ensuring org units carry boundary geometry.

Usage:
    python3 tools/install.py \
        --base-url https://your-instance.org --username admin --password ... \
        --config country-config.yaml \
        --package metadata/full_package.json \
        --rules   metadata/validation_rules.json
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json  # noqa: E402
from _ntd_common import add_auth_args, load_config, make_session  # noqa: E402
import configure  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DEFAULT_SCAFFOLD = os.path.join(REPO, "metadata", "access_scaffold.json")

# Group UIDs must match metadata/access_scaffold.json (two groups: view + data entry).
GRP_USERS = "NTDusersGrp"   # NTD Users — everyone; gets VIEW on dashboards/viz/maps + data read on datasets
GRP_ENTRY = "NTDentryGrp"   # NTD Data Entry — gets DATA capture on datasets + category options

# DHIS2 access strings: [metadata-r][metadata-w][data-r][data-w][----].
# Access is group-controlled (public "--------"): the NTD Users group sees dashboards and
# reads data; the NTD Data Entry group can capture data on datasets AND category options
# (the latter is required or entry against disaggregated data elements is silently blocked).
# No one but a superuser gets metadata write, so the shipped configuration stays static.
SHARING_SPEC = {
    "dashboards":      ("dashboard",     "--------", {GRP_USERS: "r-------"}),
    "visualizations":  ("visualization", "--------", {GRP_USERS: "r-------"}),
    "maps":            ("map",           "--------", {GRP_USERS: "r-------"}),
    "indicatorGroups": ("indicatorGroup","--------", {GRP_USERS: "r-------"}),
    "dataSets":        ("dataSet",       "--------", {GRP_USERS: "r-r-----", GRP_ENTRY: "r-rw----"}),
    "categoryOptions": ("categoryOption","r-r-----", {GRP_ENTRY: "r-rw----"}),
}


def step(msg):
    print(f"\n=== {msg} ===")


# ── 1. Connection ────────────────────────────────────────────────────────────
def check_connection(session, base_url):
    step("1. Connection & version")
    resp = session.get(f"{base_url}/api/system/info.json", timeout=30)
    resp.raise_for_status()
    version = resp.json().get("version", "unknown")
    print(f"  Connected to {base_url}")
    print(f"  DHIS2 version: {version}")
    return version


# ── 2. Org-unit preflight ─────────────────────────────────────────────────────
def preflight_org_units(session, base_url, config):
    step("2. Org-unit preflight (hard prerequisite)")
    resp = session.get(
        f"{base_url}/api/organisationUnits.json?fields=id,name,level&paging=false",
        timeout=60,
    )
    resp.raise_for_status()
    units = resp.json().get("organisationUnits", [])
    levels = {u.get("level") for u in units if u.get("level")}

    if not units:
        sys.exit(
            "  STOP: no organisation units found.\n"
            "  Set up your administrative hierarchy in Maintenance → Organisation Unit,\n"
            "  then re-run. Org units are not shipped in the package."
        )
    if max(levels) < 2:
        sys.exit(
            f"  STOP: only level-1 org units exist (levels present: {sorted(levels)}).\n"
            "  Add at least your district level before importing — dashboards report by district."
        )
    print(f"  Found {len(units)} org units across levels {sorted(levels)}.")

    entry_level = (config.get("org_units") or {}).get("data_entry_level", 2)
    check_geometry(session, base_url, entry_level)
    return units


def check_geometry(session, base_url, level):
    """Warn (do not block) if the data-entry-level org units lack boundary geometry."""
    resp = session.get(
        f"{base_url}/api/organisationUnits.json?fields=id,geometry&filter=level:eq:{level}&paging=false",
        timeout=60,
    )
    if resp.status_code != 200:
        return
    ous = resp.json().get("organisationUnits", [])
    if not ous:
        return
    with_geo = sum(1 for o in ous if o.get("geometry"))
    if with_geo < len(ous):
        print(
            f"  WARNING: {len(ous) - with_geo}/{len(ous)} level-{level} org units have no geometry.\n"
            "           Choropleth MAPS will render blank for those until boundaries are loaded\n"
            "           (Import/Export → GeoJSON import; sources: geoBoundaries, GADM, OCHA COD).\n"
            "           Non-map charts are unaffected. See docs/adaptation.md."
        )
    else:
        print(f"  All level-{level} org units carry geometry — maps will render.")


# ── 3. National root ──────────────────────────────────────────────────────────
def resolve_national_root(units, config):
    step("3. National root org unit")
    configured = (config.get("org_units") or {}).get("national_uid")
    level1 = [u for u in units if u.get("level") == 1]

    if configured and configured != "REPLACE_ME":
        match = next((u for u in level1 if u["id"] == configured), None)
        if not match:
            sys.exit(f"  STOP: configured national_uid {configured} is not a level-1 org unit here.")
        print(f"  Using configured national root: {match['name']} ({configured})")
        return configured

    if len(level1) == 1:
        root = level1[0]
        print(f"  Auto-detected national root: {root['name']} ({root['id']})")
        return root["id"]

    names = ", ".join(f"{u['name']} ({u['id']})" for u in level1)
    sys.exit(
        f"  STOP: {len(level1)} level-1 org units exist ({names}).\n"
        "  Set org_units.national_uid in your config to pick the national root, then re-run."
    )


# ── 4. Adapt package ──────────────────────────────────────────────────────────
def configure_package(package_path, config, national_uid, out_path):
    step("4. Adapt package (configure.py)")
    config.setdefault("org_units", {})["national_uid"] = national_uid
    with open(package_path, "r", encoding="utf-8") as fh:
        package = json.load(fh)
    if not package:
        sys.exit(f"  STOP: {package_path} is empty. Build it first (see tools/build_metadata_package.py).")

    stats = configure.Stats()
    uid_map = configure.build_uid_map(config)
    package = configure.remap_uids(package, uid_map, stats)
    opts = config.get("options") or {}
    if opts.get("scrub_audit_and_sharing", True):
        package = configure.scrub(package, stats)
    if opts.get("strip_dataset_org_units", True):
        configure.strip_dataset_org_units(package, stats)
    periods = config.get("periods") or {}
    if periods.get("relativize"):
        configure.relativize_periods(package, periods.get("relative_period", "LAST_12_MONTHS"), stats)

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(package, fh, indent=2)
    print(f"  Adapted package -> {out_path} "
          f"({stats.uid_swaps} UID swaps, {stats.scrubbed} scrubbed, "
          f"{stats.dataset_ou_stripped} dataset OU refs cut)")
    return out_path, package


# ── 5/6/7. Import stages ──────────────────────────────────────────────────────
def post_metadata(session, base_url, path_or_obj, dry_run, strategy="CREATE_AND_UPDATE"):
    params = f"importStrategy={strategy}&atomicMode=ALL&importReportMode=ERRORS"
    params += "&dryRun=true" if dry_run else "&dryRun=false"
    if isinstance(path_or_obj, (dict, list)):
        data = json.dumps(path_or_obj).encode("utf-8")
    else:
        with open(path_or_obj, "rb") as fh:
            data = fh.read()
    resp = session.post(
        f"{base_url}/api/metadata.json?{params}",
        data=data,
        headers={"Content-Type": "application/json"},
        timeout=600,
    )
    try:
        return resp.json()
    except ValueError:
        resp.raise_for_status()
        raise


def summarize(body, label):
    status = body.get("status", "UNKNOWN")
    stats = body.get("stats") or (body.get("response") or {}).get("stats") or {}
    print(f"  [{label}] status={status}  "
          f"created={stats.get('created', '?')} updated={stats.get('updated', '?')} "
          f"ignored={stats.get('ignored', '?')} total={stats.get('total', '?')}")
    type_reports = body.get("typeReports") or (body.get("response") or {}).get("typeReports") or []
    errors = []
    for tr in type_reports:
        for obj in tr.get("objectReports", []):
            for err in obj.get("errorReports", []):
                errors.append(f"    {tr.get('klass', '').split('.')[-1]}: {err.get('message')}")
    if errors:
        print(f"  {len(errors)} error(s):")
        for line in errors[:25]:
            print(line)
        if len(errors) > 25:
            print(f"    ... and {len(errors) - 25} more")
    return status == "OK"


def import_stage(session, base_url, path_or_obj, label, assume_yes, strategy="CREATE_AND_UPDATE"):
    dry = post_metadata(session, base_url, path_or_obj, dry_run=True, strategy=strategy)
    if not summarize(dry, f"{label} dry-run"):
        sys.exit(f"  STOP: {label} dry-run reported errors. Fix them first (nothing was changed).")
    if not assume_yes:
        if input(f"  Commit {label} import? [y/N] ").strip().lower() != "y":
            sys.exit("  Aborted by user (nothing was committed).")
    if not summarize(post_metadata(session, base_url, path_or_obj, dry_run=False, strategy=strategy),
                     f"{label} commit"):
        sys.exit(f"  STOP: {label} commit reported errors.")


# ── 5b. Reapply visualization data items ──────────────────────────────────────
def reapply_visualizations(session, base_url, package, assume_yes):
    """The DHIS2 metadata importer creates visualizations but DROPS their data-dimension
    items (dataDimensionItems / columns[dx].items) — charts import with null data elements.
    Periods and org units survive the import, but the data elements only persist via a
    direct PUT /api/visualizations/{id} of the full object. So after the metadata import we
    PUT every visualization to restore its data items. (Validated on 2.42; see docs/setup.md.)"""
    step("5b. Reapply visualization data items (PUT — importer drops them)")
    viz = package.get("visualizations", [])
    if not viz:
        print("  No visualizations in package — skipping.")
        return
    if not assume_yes:
        if input(f"  PUT {len(viz)} visualizations to restore data elements? [y/N] ").strip().lower() != "y":
            print("  Skipped — charts will render with no data element until PUT.")
            return
    ok, failed, errs = 0, 0, []
    for v in viz:
        vid = v.get("id")
        if not vid:
            continue
        resp = session.put(
            f"{base_url}/api/visualizations/{vid}",
            data=json.dumps(v).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            timeout=120,
        )
        if resp.status_code in (200, 201, 204):
            ok += 1
        else:
            failed += 1
            if len(errs) < 15:
                errs.append(f"    {vid}: HTTP {resp.status_code} {resp.text[:160]}")
    print(f"  Reapplied {ok}/{len(viz)} visualizations" + (f", {failed} failed:" if failed else "."))
    for line in errs:
        print(line)


# ── 8. Assign datasets to org units ───────────────────────────────────────────
def assign_datasets(session, base_url, package, national_uid, entry_level, assume_yes):
    step(f"8. Assign datasets to org units (national + level {entry_level})")
    datasets = package.get("dataSets", [])
    if not datasets:
        print("  No datasets in package — skipping.")
        return

    resp = session.get(
        f"{base_url}/api/organisationUnits.json?fields=id&filter=level:eq:{entry_level}&paging=false",
        timeout=60,
    )
    resp.raise_for_status()
    ou_ids = [national_uid] + [o["id"] for o in resp.json().get("organisationUnits", [])]
    ou_ids = list(dict.fromkeys(ou_ids))  # dedupe, preserve order
    print(f"  Assigning {len(datasets)} datasets to {len(ou_ids)} org units.")

    payload = {"dataSets": []}
    for ds in datasets:
        payload["dataSets"].append({**ds, "organisationUnits": [{"id": uid} for uid in ou_ids]})
    import_stage(session, base_url, payload, "dataset-org-units", assume_yes, strategy="UPDATE")


# ── 9. Apply sharing ──────────────────────────────────────────────────────────
def apply_sharing(session, base_url, package):
    step("9. Apply sharing (visibility + data entry access)")
    applied, failed = 0, 0
    for pkg_key, (schema_type, public, groups) in SHARING_SPEC.items():
        for obj in package.get(pkg_key, []):
            oid = obj.get("id")
            if not oid:
                continue
            body = {
                "object": {
                    "publicAccess": public,
                    "externalAccess": False,
                    "userGroupAccesses": [{"id": gid, "access": acc} for gid, acc in groups.items()],
                    "userAccesses": [],
                }
            }
            resp = session.post(
                f"{base_url}/api/sharing?type={schema_type}&id={oid}",
                data=json.dumps(body),
                headers={"Content-Type": "application/json"},
                timeout=60,
            )
            if resp.status_code in (200, 204):
                applied += 1
            else:
                failed += 1
    print(f"  Sharing applied to {applied} objects" + (f", {failed} failed" if failed else "."))
    if failed:
        print("  (Failures usually mean an object type this DHIS2 version names differently — non-fatal.)")


# ── 10. Category option combos ────────────────────────────────────────────────
def generate_cocs(session, base_url):
    step("10. Regenerate category option combos")
    resp = session.post(f"{base_url}/api/maintenance?categoryOptionComboUpdate=true", timeout=300)
    print("  COC update requested." if resp.status_code in (200, 204) else
          f"  COC update returned {resp.status_code} (non-fatal; run it from Data Administration if needed).")


def main():
    parser = argparse.ArgumentParser(description="Install the NTD metadata package on a fresh DHIS2")
    add_auth_args(parser)
    parser.add_argument("--config", required=True, help="Country config (see country-config.example.yaml)")
    parser.add_argument("--package", default="metadata/full_package.json", help="Metadata package to import")
    parser.add_argument("--rules", default="metadata/validation_rules.json", help="Validation rules to import")
    parser.add_argument("--scaffold", default=DEFAULT_SCAFFOLD, help="Access scaffold (roles + user groups)")
    parser.add_argument("--out", default=None, help="Where to write the adapted package")
    parser.add_argument("--yes", action="store_true", help="Commit without interactive confirmation")
    parser.add_argument("--no-reapply-viz", action="store_true",
                        help="Skip the post-import PUT that restores visualization data elements")
    parser.add_argument("--no-scaffold", action="store_true", help="Skip importing roles/groups")
    parser.add_argument("--no-assign", action="store_true", help="Skip dataset org-unit assignment")
    parser.add_argument("--no-sharing", action="store_true", help="Skip applying sharing")
    args = parser.parse_args()

    config = load_config(args.config)
    session = make_session(args.username, args.password, args.token)
    base_url = args.base_url.rstrip("/")
    entry_level = (config.get("org_units") or {}).get("data_entry_level", 2)

    try:
        check_connection(session, base_url)
        units = preflight_org_units(session, base_url, config)
        national_uid = resolve_national_root(units, config)

        out_path = args.out or args.package.replace(".json", ".configured.json")
        configured_path, package = configure_package(args.package, config, national_uid, out_path)

        step("5. Metadata import")
        import_stage(session, base_url, configured_path, "metadata", args.yes)

        if not args.no_reapply_viz:
            reapply_visualizations(session, base_url, package, args.yes)

        step("6. Validation rules")
        import_stage(session, base_url, args.rules, "validation-rules", args.yes)

        if not args.no_scaffold:
            step("7. Access scaffold (roles + user groups)")
            import_stage(session, base_url, args.scaffold, "access-scaffold", args.yes)

        if not args.no_assign:
            assign_datasets(session, base_url, package, national_uid, entry_level, args.yes)

        if not args.no_sharing and not args.no_scaffold:
            apply_sharing(session, base_url, package)

        generate_cocs(session, base_url)
    except Exception as exc:  # noqa: BLE001 — top-level guard for a CLI
        sys.exit(f"\nInstaller failed: {exc}")

    print("\nDone. Next steps:")
    print("  - Create users and assign, per user: a ROLE + GROUP(s) + org-unit SCOPE:")
    print("      National M&E   -> role 'NTD Administrator', groups [NTD Users, NTD Data Entry], national scope")
    print("      District entry -> role 'NTD Data Entry',   groups [NTD Users, NTD Data Entry], their district")
    print("      Viewer/partner -> role 'NTD Viewer',       group  [NTD Users],                national (view)")
    print("    Also set each user's UI/DB locale (e.g. en / fr / pt).")
    print("  - Load data (docs/data-sources.md), then run Analytics before dashboards populate.")
    print("  - Run: python3 tools/validate_import.py --base-url {} --config {} ...".format(base_url, args.config))


if __name__ == "__main__":
    main()
