#!/usr/bin/env python3
"""
seed_demo_data.py — fill the NTD datasets with plausible RANDOM sample values so the
dashboards light up, for demos and evaluation. NOT real data — never use in production.

Run it after install.py, against the same instance:

    python3 tools/seed_demo_data.py --base-url https://your-dhis2 --username admin --password ...

Then generate analytics (or pass --analytics) and open the dashboards.
"""
import argparse, json, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ntd_common import add_auth_args, make_session  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PACKAGE = os.path.join(os.path.dirname(HERE), "metadata", "full_package.json")
ENTRY_GROUP = "NTDentryGrp"  # NTD Data Entry group — holds data-write on the category options


def periods(ptype):
    if ptype == "Yearly":    return [str(y) for y in range(2019, 2027)]
    if ptype == "Monthly":   return [f"{y}{m:02d}" for y in (2025, 2026) for m in range(1, 13)]
    if ptype == "Quarterly": return [f"{y}Q{q}" for y in (2024, 2025, 2026) for q in range(1, 5)]
    return [str(y) for y in range(2022, 2027)]


def value(value_type):
    return str(random.randint(20, 95) if value_type == "PERCENTAGE" else random.randint(50, 8000))


def main():
    ap = argparse.ArgumentParser(description="Seed demo (fake) data into the NTD datasets")
    add_auth_args(ap)
    ap.add_argument("--analytics", action="store_true", help="Kick off analytics generation when done")
    args = ap.parse_args()
    s = make_session(args.username, args.password, args.token)
    base = args.base_url.rstrip("/")

    ntd_ids = {d["id"] for d in json.load(open(PACKAGE))["dataSets"]}
    print(f"Seeding {len(ntd_ids)} NTD datasets on {base} (random demo data — not real).")

    # 1. Make sure the current user can write data: add them to the NTD Data Entry group,
    #    which the installer granted data-write on the category options.
    me = s.get(f"{base}/api/me.json?fields=id,userGroups[id]", timeout=30).json()
    if ENTRY_GROUP not in {g["id"] for g in me.get("userGroups", [])}:
        r = s.post(f"{base}/api/userGroups/{ENTRY_GROUP}/users/{me['id']}", timeout=30)
        print(f"  Added current user to NTD Data Entry group (data-write): HTTP {r.status_code}")

    # 2. Build the data values from each NTD dataset's own structure.
    ds = s.get(f"{base}/api/dataSets.json?fields=id,periodType,organisationUnits[id],"
               "dataSetElements[dataElement[id,valueType,optionSet[options[code]],"
               "categoryCombo[categoryOptionCombos[id]]]]&paging=false", timeout=120).json()["dataSets"]
    ds = [d for d in ds if d["id"] in ntd_ids]
    dvs = []
    for d in ds:
        pers = periods(d.get("periodType", "Yearly"))
        ous = [o["id"] for o in d.get("organisationUnits", [])]
        if not ous:
            continue  # dataset not assigned to any org unit yet (run install.py first)
        for dse in d.get("dataSetElements", []):
            de = dse["dataElement"]
            opts = [o["code"] for o in (de.get("optionSet") or {}).get("options", [])]
            cocs = [c["id"] for c in de.get("categoryCombo", {}).get("categoryOptionCombos", [])] or ["HllvX50cXC0"]
            for ou in ous:
                for pe in pers:
                    for coc in cocs:
                        v = random.choice(opts) if opts else value(de.get("valueType", "INTEGER"))
                        dvs.append({"dataElement": de["id"], "period": pe, "orgUnit": ou,
                                    "categoryOptionCombo": coc, "value": v})
    # De-duplicate: a data element can sit in more than one dataset, which would otherwise
    # produce duplicate (de, period, org unit, catOptCombo) rows in the payload.
    seen, uniq = set(), []
    for v in dvs:
        k = (v["dataElement"], v["period"], v["orgUnit"], v["categoryOptionCombo"])
        if k not in seen:
            seen.add(k)
            uniq.append(v)
    dvs = uniq
    if not dvs:
        sys.exit("  No data values generated — are the datasets assigned to org units? Run install.py first.")
    print(f"  Generated {len(dvs)} data values; importing (chunks of 5,000)...")

    total, ignored, chunks = 0, 0, (len(dvs) + 4999) // 5000
    for n, i in enumerate(range(0, len(dvs), 5000), 1):
        try:
            r = s.post(f"{base}/api/dataValueSets?importStrategy=CREATE_AND_UPDATE&skipAudit=true",
                       data=json.dumps({"dataValues": dvs[i:i + 5000]}),
                       headers={"Content-Type": "application/json"}, timeout=180).json()
        except Exception as exc:  # noqa: BLE001 — keep seeding even if one chunk fails
            print(f"    chunk {n}/{chunks}: request failed ({exc}); continuing")
            continue
        c = r.get("importCount") or (r.get("response") or {}).get("importCount") or {}
        got = c.get("imported", 0) + c.get("updated", 0)
        total += got
        ignored += c.get("ignored", 0)
        if got == 0:
            print(f"    chunk {n}/{chunks}: 0 imported (status {r.get('status')}, ignored {c.get('ignored', '?')})")
    print(f"  Imported/updated {total} values" + (f" ({ignored} ignored)." if ignored else "."))

    if args.analytics:
        r = s.post(f"{base}/api/resourceTables/analytics?skipEvents=true&lastYears=8", timeout=60)
        print(f"  Analytics started: HTTP {r.status_code} (runs ~15 min; then open the dashboards).")
    else:
        print("  Next: run Analytics (Data Administration → Analytics, or re-run with --analytics), then open the dashboards.")


if __name__ == "__main__":
    main()
