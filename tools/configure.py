#!/usr/bin/env python3
"""
configure.py — adapt the reference (Sierra Leone) NTD metadata package for another
country, before importing it into that country's DHIS2 instance.

Because the dashboards are RELATIVIZED before export (org-unit selections set to a
level or the root/user org unit, periods set to relative — see docs/adaptation.md),
the only per-country change that is usually required is swapping the single national
root org unit UID. This script does that safely by editing the exported package JSON
and leaving it to be re-imported whole — it never reconstructs visualization internals
via the API, so dataDimensionItems are preserved (see docs/setup.md).

What it does:
  1. Remaps the source national root UID -> your national UID (everywhere it appears).
  2. Optionally remaps specific district UIDs (only needed for any non-relativized charts).
  3. Optionally scrubs audit/ownership/sharing fields (idempotent; safe with skip-sharing).
  4. Optionally applies a best-effort relative period to visualizations.

Usage:
    python3 tools/configure.py \
        --in  metadata/full_package.json \
        --out metadata/full_package.uganda.json \
        --config country-config.yaml
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json  # noqa: E402
from _ntd_common import (  # noqa: E402
    AUDIT_AND_SHARING_FIELDS,
    SL_NATIONAL_UID,
    load_config,
)

# DHIS2 relativePeriods object keys, by the keyword used in config.
RELATIVE_PERIOD_KEYS = {
    "LAST_12_MONTHS": "last12Months",
    "THIS_YEAR": "thisYear",
    "LAST_YEAR": "lastYear",
    "LAST_5_YEARS": "last5Years",
    "LAST_4_QUARTERS": "last4Quarters",
}


class Stats:
    def __init__(self):
        self.uid_swaps = 0
        self.scrubbed = 0
        self.viz_relativized = 0
        self.dataset_ou_stripped = 0


def build_uid_map(config):
    """Source-UID -> target-UID mapping from the config."""
    ou = config.get("org_units", {})
    uid_map = {}

    source_national = config.get("source_national_uid", SL_NATIONAL_UID)
    target_national = ou.get("national_uid")
    if target_national and target_national != "REPLACE_ME":
        uid_map[source_national] = target_national

    for src, dst in (ou.get("district_map") or {}).items():
        if dst and dst != "REPLACE_ME":
            uid_map[src] = dst

    return uid_map


def remap_uids(node, uid_map, stats):
    """Recursively replace any string value that exactly equals a source UID."""
    if isinstance(node, dict):
        return {k: remap_uids(v, uid_map, stats) for k, v in node.items()}
    if isinstance(node, list):
        return [remap_uids(v, uid_map, stats) for v in node]
    if isinstance(node, str) and node in uid_map:
        stats.uid_swaps += 1
        return uid_map[node]
    return node


def scrub(node, stats):
    """Recursively remove audit/ownership/sharing fields."""
    if isinstance(node, dict):
        out = {}
        for k, v in node.items():
            if k in AUDIT_AND_SHARING_FIELDS:
                stats.scrubbed += 1
                continue
            out[k] = scrub(v, stats)
        return out
    if isinstance(node, list):
        return [scrub(v, stats) for v in node]
    return node


def strip_dataset_org_units(package, stats):
    """
    Remove org-unit assignments from datasets. They point at the reference country's
    org units (which don't exist on the target), so they would be dropped on import
    and leave the dataset assigned to nothing. install.py reassigns each dataset to the
    target's national root + district level after import, so data entry works out of
    the box (see docs/setup.md "Assigning datasets to org units").
    """
    for ds in package.get("dataSets", []):
        assigned = ds.get("organisationUnits") or []
        if assigned:
            stats.dataset_ou_stripped += len(assigned)
            ds["organisationUnits"] = []


def relativize_periods(package, keyword, stats):
    """
    Best-effort: set the relativePeriods flag on every visualization and clear its
    fixed `periods` array. This is a convenience for packages that still contain
    fixed-period charts; the recommended path is to relativize by hand in Data
    Visualizer before export (see docs/adaptation.md).
    """
    rel_key = RELATIVE_PERIOD_KEYS.get(keyword)
    if not rel_key:
        sys.exit(f"Unknown relative_period '{keyword}'. Choose one of: {', '.join(RELATIVE_PERIOD_KEYS)}")

    for viz in package.get("visualizations", []):
        viz["relativePeriods"] = {rel_key: True}
        if viz.get("periods"):
            viz["periods"] = []
        stats.viz_relativized += 1


def main():
    parser = argparse.ArgumentParser(description="Adapt the NTD metadata package for a country")
    parser.add_argument("--in", dest="infile", required=True, help="Input package JSON (the reference export)")
    parser.add_argument("--out", dest="outfile", required=True, help="Where to write the adapted package")
    parser.add_argument("--config", required=True, help="Country config (YAML or JSON) — see country-config.example.yaml")
    args = parser.parse_args()

    config = load_config(args.config)
    with open(args.infile, "r", encoding="utf-8") as fh:
        package = json.load(fh)

    if not isinstance(package, dict) or not package:
        sys.exit(f"{args.infile} does not look like a metadata package (expected a non-empty JSON object).")

    stats = Stats()
    uid_map = build_uid_map(config)

    if not uid_map:
        print("WARNING: no org-unit UIDs to remap. Set org_units.national_uid in your config "
              "(unless your instance genuinely reuses the reference UIDs).")

    package = remap_uids(package, uid_map, stats)

    opts = config.get("options", {})
    if opts.get("scrub_audit_and_sharing", True):
        package = scrub(package, stats)

    if opts.get("strip_dataset_org_units", True):
        strip_dataset_org_units(package, stats)

    periods = config.get("periods", {})
    if periods.get("relativize"):
        relativize_periods(package, periods.get("relative_period", "LAST_12_MONTHS"), stats)

    with open(args.outfile, "w", encoding="utf-8") as fh:
        json.dump(package, fh, indent=2)
        fh.write("\n")

    print(f"Adapted package written to {args.outfile}")
    print(f"  org-unit UID swaps  : {stats.uid_swaps}  (map: {uid_map or 'none'})")
    print(f"  fields scrubbed     : {stats.scrubbed}")
    print(f"  dataset OU refs cut : {stats.dataset_ou_stripped}  (installer reassigns after import)")
    print(f"  viz relativized     : {stats.viz_relativized}")


if __name__ == "__main__":
    main()
