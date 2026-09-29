#!/usr/bin/env python3
"""
validate_import.py — Post-import metadata validation for the SL NTD Metadata
Repository.

Run this against your DHIS2 instance after metadata import to confirm every
expected dataset, indicator, visualization, and dashboard actually landed
correctly. Metadata import partial-failures are common and silent — this
script exists because setup.md's manual checklist can't catch everything a
human reviewer would miss when checking 9 dashboards x ~20 charts each.

Usage:
    python3 validate_import.py --base-url https://your-instance.org \
        --username admin --password yourpassword

    # Or with a token instead of basic auth:
    python3 validate_import.py --base-url https://your-instance.org \
        --token your-pat-token

Exit code 0 = all checks passed. Exit code 1 = one or more checks failed —
read the printed report for specifics.
"""

import argparse
import sys

# ── Expected counts and UIDs, per the Sierra Leone reference implementation ──
# If you remapped UIDs during adaptation (see adaptation.md Section 1), the
# UID-based checks below will fail even on a correct import — that's
# expected. Use --skip-uid-checks in that case and rely on the count checks
# instead.

EXPECTED_DATASET_COUNT = 13
EXPECTED_DATASET_UIDS = [
    "G3FoEmgSCp3", "uDvRmfYwCgy", "MEGM70nEeKK", "ksp1GsbQL1N",
    "Uzlfdr5xjRb", "O3JdNETqSWF", "OC49KqbG1Ey", "KiDomPJQbWq",
    "APBfE1FbrPQ", "E4VSiu6PBy8",
    "fwa0557YOwJ", "acuUpM0yCSb", "jk4G6NafWhl", "ZAfeSKiLeIT",
]

EXPECTED_INDICATOR_UIDS = [
    "XBa46KPfVob", "YaOECfS0F2p", "QHCLfJqINDw",  # LF
    "pOm2P6euSOk", "eKkIi6V7isc", "rPcqs0WCIVE",  # Oncho
    "LYDWDY2BWYs", "hWzV6g0xYpl", "gRYj4qj0SXB",  # SCH
    "een3XnZX69s", "DepeAmyR3FY", "x5m3A7mdvj4",  # STH
    "JDickiHSkPd",                                  # cross-cutting
]

EXPECTED_DASHBOARD_NAME_PREFIXES = [
    "SL NTD — 1. National",
    "SL NTD — 2. District",
    "SL NTD — 3. Lymphatic Filariasis",
    "SL NTD — 4. Onchocerciasis",
    "SL NTD — 5. Schistosomiasis",
    "SL NTD — 6. Soil Transmitted Helminths",
    "SL NTD — 7. Trachoma",
    "SL NTD — 8. Trachoma WASH",
    "SL NTD — 9. Drug Management",
]

# Minimum dashboard item count per dashboard, as a sanity floor — not exact,
# since a few module-text/spacer items vary, but a dashboard with far fewer
# items than this almost certainly had charts silently dropped on import.
MIN_DASHBOARD_ITEMS = {
    "SL NTD — 1. National": 8,
    "SL NTD — 2. District": 4,
    "SL NTD — 3. Lymphatic Filariasis": 18,
    "SL NTD — 4. Onchocerciasis": 15,
    "SL NTD — 5. Schistosomiasis": 15,
    "SL NTD — 6. Soil Transmitted Helminths": 15,
    "SL NTD — 7. Trachoma": 6,
    "SL NTD — 8. Trachoma WASH": 4,
    "SL NTD — 9. Drug Management": 6,
}


class Report:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []

    def ok(self, msg):
        self.passed.append(msg)
        print(f"  PASS  {msg}")

    def fail(self, msg):
        self.failed.append(msg)
        print(f"  FAIL  {msg}")

    def warn(self, msg):
        self.warnings.append(msg)
        print(f"  WARN  {msg}")

    def summary(self):
        print()
        print(f"Passed: {len(self.passed)}  Failed: {len(self.failed)}  Warnings: {len(self.warnings)}")
        return len(self.failed) == 0


def get(session, base_url, path):
    resp = session.get(f"{base_url}/api/{path}")
    resp.raise_for_status()
    return resp.json()


def check_datasets(session, base_url, report, skip_uid_checks):
    print("\n[Datasets]")
    data = get(session, base_url, "dataSets.json?fields=id,name&paging=false")
    datasets = data.get("dataSets", [])

    if len(datasets) >= EXPECTED_DATASET_COUNT:
        report.ok(f"Found {len(datasets)} datasets (expected at least {EXPECTED_DATASET_COUNT})")
    else:
        report.fail(f"Found only {len(datasets)} datasets, expected at least {EXPECTED_DATASET_COUNT}")

    if not skip_uid_checks:
        found_uids = {d["id"] for d in datasets}
        missing = [u for u in EXPECTED_DATASET_UIDS if u not in found_uids]
        if missing:
            report.fail(f"Missing expected dataset UIDs: {missing}")
        else:
            report.ok("All expected dataset UIDs present")


def check_indicators(session, base_url, report, skip_uid_checks):
    print("\n[Indicators]")
    data = get(session, base_url, "indicators.json?fields=id,name,numerator,denominator&paging=false")
    indicators = data.get("indicators", [])

    if not skip_uid_checks:
        found = {i["id"]: i for i in indicators}
        for uid in EXPECTED_INDICATOR_UIDS:
            if uid not in found:
                report.fail(f"Missing expected indicator UID {uid}")
                continue
            ind = found[uid]
            if not ind.get("numerator") or not ind.get("denominator"):
                report.fail(f"Indicator '{ind['name']}' ({uid}) has empty numerator or denominator — formula likely failed to import")
            else:
                report.ok(f"Indicator '{ind['name']}' present with formula intact")
    else:
        report.warn("Skipped indicator UID checks (--skip-uid-checks)")


def check_dashboards(session, base_url, report):
    print("\n[Dashboards]")
    data = get(session, base_url, "dashboards.json?fields=id,name,dashboardItems&paging=false")
    dashboards = {d["name"]: d for d in data.get("dashboards", [])}

    for expected_prefix in EXPECTED_DASHBOARD_NAME_PREFIXES:
        matches = [name for name in dashboards if name.startswith(expected_prefix)]
        if not matches:
            report.fail(f"No dashboard found matching '{expected_prefix}'")
            continue

        name = matches[0]
        item_count = len(dashboards[name].get("dashboardItems", []))
        min_expected = MIN_DASHBOARD_ITEMS.get(expected_prefix, 1)

        if item_count >= min_expected:
            report.ok(f"'{name}' has {item_count} items (expected at least {min_expected})")
        else:
            report.fail(f"'{name}' has only {item_count} items, expected at least {min_expected} — charts may have failed to import or attach")


def check_visualizations_not_blank(session, base_url, report, sample_size=10):
    """
    Spot-checks a sample of visualizations to confirm their dataDimensionItems
    are not empty — this is the exact failure mode documented in setup.md's
    API limitation warning (PUT corrupting visualizations, or a bad import
    leaving them structurally present but data-empty).
    """
    print(f"\n[Visualization integrity spot-check, n={sample_size}]")
    data = get(
        session, base_url,
        f"visualizations.json?fields=id,name,dataDimensionItems&paging=true&pageSize={sample_size}"
    )
    visualizations = data.get("visualizations", [])

    if not visualizations:
        report.fail("No visualizations found in instance at all")
        return

    empty_count = 0
    for viz in visualizations:
        items = viz.get("dataDimensionItems", [])
        has_real_data = any(
            item.get("dataElement", {}).get("id") or item.get("indicator", {}).get("id")
            for item in items
        )
        if items and not has_real_data:
            empty_count += 1
            report.warn(f"Visualization '{viz['name']}' ({viz['id']}) has dataDimensionItems with no resolved data element/indicator id — may render blank")

    if empty_count == 0:
        report.ok(f"All {len(visualizations)} sampled visualizations have resolved data references")
    else:
        report.fail(f"{empty_count} of {len(visualizations)} sampled visualizations may be blank — open these in Data Visualizer to confirm")


def main():
    parser = argparse.ArgumentParser(description="Validate SL NTD Metadata Repository import")
    parser.add_argument("--base-url", required=True, help="DHIS2 instance base URL, e.g. https://your-instance.org")
    parser.add_argument("--username", help="DHIS2 username (basic auth)")
    parser.add_argument("--password", help="DHIS2 password (basic auth)")
    parser.add_argument("--token", help="DHIS2 personal access token (alternative to username/password)")
    parser.add_argument("--skip-uid-checks", action="store_true", help="Skip UID-exact checks — use if you remapped org units/UIDs per adaptation.md")
    parser.add_argument("--config", help="Country config (YAML/JSON); its optional 'expected' block overrides dashboard name prefixes / item floors after per-country renames")
    args = parser.parse_args()

    # Per-country overrides. Dataset/indicator UIDs survive adaptation unchanged
    # (they are bundled into the package and imported with the same UIDs), so the
    # only checks that typically need overriding are dashboard names, if a country
    # renamed or translated them.
    if args.config:
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from _ntd_common import load_config
        expected = (load_config(args.config) or {}).get("expected", {})
        global EXPECTED_DASHBOARD_NAME_PREFIXES, MIN_DASHBOARD_ITEMS, EXPECTED_DATASET_COUNT
        if "dashboard_name_prefixes" in expected:
            EXPECTED_DASHBOARD_NAME_PREFIXES = expected["dashboard_name_prefixes"]
        if "min_dashboard_items" in expected:
            MIN_DASHBOARD_ITEMS = expected["min_dashboard_items"]
        if "dataset_count" in expected:
            EXPECTED_DATASET_COUNT = expected["dataset_count"]

    try:
        import requests
    except ImportError:
        sys.exit("This step needs the `requests` package. Run: pip install -r tools/requirements.txt")

    base_url = args.base_url.rstrip("/")
    session = requests.Session()

    if args.token:
        session.headers.update({"Authorization": f"ApiToken {args.token}"})
    elif args.username and args.password:
        session.auth = (args.username, args.password)
    else:
        print("Error: provide either --token or both --username and --password")
        sys.exit(2)

    report = Report()

    try:
        check_datasets(session, base_url, report, args.skip_uid_checks)
        check_indicators(session, base_url, report, args.skip_uid_checks)
        check_dashboards(session, base_url, report)
        check_visualizations_not_blank(session, base_url, report)
    except requests.HTTPError as e:
        print(f"\nHTTP error while querying DHIS2: {e}")
        print("Check your base URL and credentials.")
        sys.exit(2)

    ok = report.summary()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
