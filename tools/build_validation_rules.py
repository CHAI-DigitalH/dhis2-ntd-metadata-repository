#!/usr/bin/env python3
"""
build_validation_rules.py — generate metadata/validation_rules.json.

The 14 NTD plausibility rules are defined here as data, not hand-edited JSON, so
that adapting them to another country's UIDs is a matter of editing the UID table
below (or passing --uids) and re-running — never editing DHIS2 validation-rule
expression syntax by hand. See docs/validation.md.

Usage:
    # Regenerate the reference (Sierra Leone) rules:
    python3 tools/build_validation_rules.py --out metadata/validation_rules.json

    # Regenerate with your instance's UIDs (see docs/validation.md "If you remapped UIDs"):
    python3 tools/build_validation_rules.py --uids my-uids.yaml --out metadata/validation_rules.json

    # Verify the current file matches what this script would produce:
    python3 tools/build_validation_rules.py --check metadata/validation_rules.json
"""

import argparse
import json
import sys

# ── Sierra Leone reference UIDs ──────────────────────────────────────────────
# Override any of these via --uids (a JSON/YAML file with the same keys) to
# regenerate the rules for another instance.
DEFAULT_UIDS = {
    # Coverage / Refusal indicators, per disease
    "LF_COVERAGE": "XBa46KPfVob",
    "LF_REFUSAL": "YaOECfS0F2p",
    "ONCHO_COVERAGE": "pOm2P6euSOk",
    "ONCHO_REFUSAL": "eKkIi6V7isc",
    "SCH_COVERAGE": "LYDWDY2BWYs",
    "SCH_REFUSAL": "hWzV6g0xYpl",
    "STH_COVERAGE": "een3XnZX69s",
    "STH_REFUSAL": "DepeAmyR3FY",
    # Drug logistics data elements
    "DRUGS_WASTED": "f1U4RH51PFz",
    "DRUGS_LOST": "k2OmpZNCiaE",
    "TABLETS_RECEIVED": "fLPMRui5pm3",
    "STOCK_AFTER_MDA": "QQhjsLUuU5m",
    # Trachoma prevalence data elements
    "TF_SURVEILLANCE": "AQUFPlseXfo",
    "TF_IMPACT": "akcEiBEVnD1",
    "TT_SURVEILLANCE": "FGui2eCTtBG",
    "TT_IMPACT": "PR3XBXGC3dL",
}

PC_DISEASES = ["LF", "Oncho", "SCH", "STH"]

# Stable UIDs so re-importing the rules UPDATEs the same objects instead of creating
# duplicates that collide on name. Do not change these once released.
RULE_IDS = {
    "covhigh": {"LF": "NTDvrLFcovH", "Oncho": "NTDvrONcovH", "SCH": "NTDvrSHcovH", "STH": "NTDvrSTcovH"},
    "covref":  {"LF": "NTDvrLFsum1", "Oncho": "NTDvrONsum1", "SCH": "NTDvrSHsum1", "STH": "NTDvrSTsum1"},
    "drug_wl": "NTDvrDrgWL1",
    "drug_neg": "NTDvrDrgNg1",
    "trach": {
        ("TF1-9", "surveillance"): "NTDvrTFsur1",
        ("TF1-9", "impact"): "NTDvrTFimp1",
        ("TT", "surveillance"): "NTDvrTTsur1",
        ("TT", "impact"): "NTDvrTTimp1",
    },
}

CEILING_110 = {"expression": "110", "description": "Plausibility ceiling (110%)", "missingValueStrategy": "NEVER_SKIP"}
UPPER_100 = {"expression": "100", "description": "Upper bound (100%)", "missingValueStrategy": "NEVER_SKIP"}


def _left(expression, description):
    return {"expression": expression, "description": description, "missingValueStrategy": "SKIP_IF_ANY_VALUE_MISSING"}


def build_rules(uids):
    rules = []

    # 1–4 — Coverage Rate implausibly high
    for d in PC_DISEASES:
        rules.append({
            "id": RULE_IDS["covhigh"][d],
            "name": f"{d} Coverage Rate implausibly high",
            "description": (
                f"Flags {d} - Coverage Rate (%) above 110%, which almost always indicates a stale "
                "or undersized targeted-population denominator rather than genuine over-treatment. "
                "See indicators.md Coverage Rate interpretation note."
            ),
            "instruction": "Review the targeted population denominator for this district/period before treating this as a true coverage finding.",
            "importance": "MEDIUM",
            "operator": "less_than_or_equal_to",
            "periodType": "Yearly",
            "leftSide": _left(f"#{{{uids[f'{d.upper()}_COVERAGE']}}}", f"{d} - Coverage Rate (%)"),
            "rightSide": dict(CEILING_110),
        })

    # 5–8 — Coverage + Refusal Rate exceeds plausible total
    for d in PC_DISEASES:
        cov, ref = uids[f"{d.upper()}_COVERAGE"], uids[f"{d.upper()}_REFUSAL"]
        rules.append({
            "id": RULE_IDS["covref"][d],
            "name": f"{d} Coverage + Refusal Rate exceeds plausible total",
            "description": (
                f"Flags when {d} Coverage Rate (%) plus Refusal Rate (%) together exceed 110%. "
                "Treated and not-treated populations are both measured against the same "
                "targeted-population denominator, so their sum should not substantially exceed 100% of it."
            ),
            "instruction": "Check whether treated and not-treated figures were entered against the correct district and period — a combined total this high often indicates a data entry or denominator mismatch.",
            "importance": "MEDIUM",
            "operator": "less_than_or_equal_to",
            "periodType": "Yearly",
            "leftSide": _left(f"#{{{cov}}}+#{{{ref}}}", f"{d} Coverage Rate + Refusal Rate"),
            "rightSide": dict(CEILING_110),
        })

    # 9 — Drug wastage and loss exceeds quantity received
    rules.append({
        "id": RULE_IDS["drug_wl"],
        "name": "Drug wastage and loss exceeds quantity received",
        "description": (
            "Flags when the sum of drugs wasted and drugs lost exceeds the number of tablets received in "
            "the same period/org unit. This is a logical impossibility — outflow due to wastage/loss "
            "cannot exceed total inflow — and indicates either a data entry error or a missing prior-stock "
            "carryover that should be reflected via the 'remain from previous MDA' data element instead."
        ),
        "instruction": "Check whether wasted/lost figures were entered against the correct period, or whether a carried-over stock balance should be added to the comparison.",
        "importance": "HIGH",
        "operator": "less_than_or_equal_to",
        "periodType": "Monthly",
        "leftSide": _left(f"#{{{uids['DRUGS_WASTED']}}}+#{{{uids['DRUGS_LOST']}}}", "Drugs wasted + Drugs lost"),
        "rightSide": _left(f"#{{{uids['TABLETS_RECEIVED']}}}", "Number of tablets received"),
    })

    # 10 — Drug stock balance after MDA is negative
    rules.append({
        "id": RULE_IDS["drug_neg"],
        "name": "Drug stock balance after MDA is negative",
        "description": (
            "Flags a negative value for (H) Actual number of tablets remain after MDA. Physical stock cannot "
            "be negative — a negative value indicates a data entry error or a sign convention mismatch in "
            "how the figure was calculated before entry."
        ),
        "instruction": "Re-check the stock count and entry for this period/org unit. This data element should always be zero or positive.",
        "importance": "HIGH",
        "operator": "greater_than_or_equal_to",
        "periodType": "Monthly",
        "leftSide": _left(f"#{{{uids['STOCK_AFTER_MDA']}}}", "Actual remaining stock after MDA"),
        "rightSide": {"expression": "0", "description": "Zero floor", "missingValueStrategy": "NEVER_SKIP"},
    })

    # 11–14 — Trachoma prevalence out of plausible range
    trachoma = [
        ("TF1-9", "surveillance", "TF_SURVEILLANCE"),
        ("TF1-9", "impact", "TF_IMPACT"),
        ("TT", "surveillance", "TT_SURVEILLANCE"),
        ("TT", "impact", "TT_IMPACT"),
    ]
    for metric, survey, key in trachoma:
        rules.append({
            "id": RULE_IDS["trach"][(metric, survey)],
            "name": f"Trachoma {metric} % {survey} survey out of plausible range",
            "description": (
                f"Flags {metric} % {survey} survey values above 100% or below 0% — a percentage value "
                "outside this range is a data entry error, since this is reported directly as a prevalence "
                "percentage with no DHIS2-calculated denominator to debug."
            ),
            "instruction": "Check the original survey report for a transcription error.",
            "importance": "HIGH",
            "operator": "less_than_or_equal_to",
            "periodType": "Yearly",
            "leftSide": _left(f"#{{{uids[key]}}}", f"{metric} % {survey} survey"),
            "rightSide": dict(UPPER_100),
        })

    return {"validationRules": rules}


def serialize(payload):
    return json.dumps(payload, indent=2) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate NTD validation rules JSON")
    parser.add_argument("--out", help="Write generated rules to this path")
    parser.add_argument("--uids", help="JSON/YAML file overriding the default UID table")
    parser.add_argument("--check", metavar="FILE", help="Compare against an existing file; exit 1 if they differ")
    args = parser.parse_args()

    uids = dict(DEFAULT_UIDS)
    if args.uids:
        # Local import so the common helper's optional PyYAML stays optional.
        sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
        from _ntd_common import load_config
        uids.update(load_config(args.uids))

    payload = build_rules(uids)
    text = serialize(payload)

    if args.check:
        with open(args.check, "r", encoding="utf-8") as fh:
            existing = fh.read()
        if existing.strip() == text.strip():
            print(f"OK — {args.check} matches generated output ({len(payload['validationRules'])} rules).")
            sys.exit(0)
        print(f"MISMATCH — {args.check} differs from generated output. Re-run with --out to regenerate.")
        sys.exit(1)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text)
        print(f"Wrote {len(payload['validationRules'])} rules to {args.out}")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
