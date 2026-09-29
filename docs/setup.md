# Setup & Adaptation

This document walks through standing up the SL NTD Metadata Repository on a fresh DHIS2 instance and adapting it for a country other than Sierra Leone. Follow the steps in order — DHIS2 metadata has dependencies, so importing out of order will produce partial failures.

If you are adapting this repository for a new country, read **[adaptation.md](./adaptation.md)** before importing anything — several decisions (chiefly relativizing the dashboards) are far cheaper to make upfront. The [Adaptation](#adaptation) section below is a summary; adaptation.md is the authoritative guide.

> **Fastest path:** once you have a built `metadata/full_package.json`, the installer
> ([`tools/install.py`](../tools/install.py)) runs this entire document end to end —
> org-unit preflight, per-country adaptation, dry-run, import, validation rules, and
> post-import checks. See [tools/README.md](../tools/README.md). The manual steps below
> explain what it does and remain the reference for doing it by hand.

## Prerequisites

- A DHIS2 instance, version 2.36 or later
- An account with **metadata import** and **superuser or admin** access
- The exported metadata JSON files from this repository's `/metadata` directory
- Python 3 installed (for `tools/configure.py` and `tools/validate_import.py`)
- A web browser with access to **Import/Export → Metadata Import** and **Maintenance** apps on your instance

---

## Adaptation

Everything in this repository was built against Sierra Leone-specific identifiers: org unit UIDs, district names, MDA calendar months, and disease endemicity assumptions. None of these travel automatically to a new country. Decide the following before importing.

### 1. Organisation units

**This is the first thing to change, before importing anything else.**

Every dataset, visualization, and dashboard references Sierra Leone's org unit UIDs directly — the national UID `ImspTQPwCqd` and the 13 district UIDs. These are hardcoded in dataset org unit assignments, visualization dimension items, and dashboard map items.

**Option A — Remap UIDs before import (recommended).** Run `tools/configure.py` — it takes a config YAML with your national and district UIDs and produces a customized metadata JSON with all Sierra Leone UIDs swapped out before import. This is the cleanest path and preserves dashboard structure exactly.

**Option B — Re-point manually in Data Visualizer.** Import the metadata as-is, then open every district-level visualization and dashboard map and manually replace the org unit selections. Slower — most of Dashboard 2 (District) and all disease dashboards have hardcoded district selections.

**District count mismatch:** Sierra Leone has 13 districts. If your country has a different number, every chart with all-districts hardcoded needs that selection redone regardless of which option above you choose — `configure.py`'s find-and-replace only works one-to-one.

### 2. MDA calendar months

Drug management charts and Trachoma charts use fixed monthly periods tied to Sierra Leone's MDA calendar: October for LF/Oncho/SCH/STH, April for Trachoma main MDA, May for Trachoma Child MDA.

**Option A — Switch to relative periods (recommended).** Open each fixed-period chart in Data Visualizer, switch to Relative periods, select "Last 12 months" or "This year." The chart always shows trailing data regardless of when your MDA occurs and never needs updating again.

**Option B — Manually set your fixed month.** Keep fixed periods and change the month in Data Visualizer's period picker per chart. Charts currently using fixed monthly periods:
- LF/Oncho/SCH/STH drug management charts — currently October
- Trachoma Module 1 and Module 6 charts — currently April
- Trachoma Child MDA charts — currently May

### 3. Disease endemicity

This repository assumes all five diseases are present and require MDA in every district. If your country has non-endemic districts or diseases not present at all:
- Update `Endemicity {Disease}` data element values per district before relying on endemicity-based charts
- If a disease is entirely absent, simply don't import that disease's dashboard and datasets — the four PC-NTD dashboards are independent of each other
- For NTDs beyond the five covered here, build new datasets, indicators, and dashboards from scratch following the patterns in [indicators.md](./indicators.md)

### 4. Replicating a dashboard for a new disease

The Oncho, SCH, and STH dashboards were built by manually cloning the LF dashboard in Data Visualizer. To replicate for a new disease:

1. Open the LF dashboard, go through each chart one at a time
2. In Data Visualizer, use **File → Save As**, rename to `{NewDisease} - {Chart description}`
3. In the Data tab, swap LF data elements/indicators for the new disease equivalents — see [indicators.md](./indicators.md) for the parallel indicator structure
4. Save and add to the new disease dashboard
5. Budget roughly 20–25 charts per full dashboard — there is no scripting shortcut given the API limitation below

### 5. Language and translation

French translations are included for the National, District, and LF dashboards using DHIS2's built-in `translations` array. For a different language:
1. Add a `translations` entry with the appropriate `locale` code and translated `value` for the `NAME` property on each dashboard and visualization object
2. Apply via browser console PATCH — metadata import silently ignores translation-only updates to visualizations
3. Module text blocks need either a separate translated dashboard (as done for French) or manual per-language editing

### 6. Data dictionary differences

If your instance already has data elements for these concepts under different UIDs:

**Option A — Adopt this repository's data elements wholesale.** Accepts some duplication in exchange for guaranteed dashboard compatibility. Recommended for instances starting from scratch.

**Option B — Remap to your existing data elements.** Edit every indicator formula and visualization data dimension reference to point at your UIDs. Significant manual work — only advisable if you have strong reasons to avoid duplication (e.g. existing HMIS pipeline dependencies).

### Adaptation checklist

Before importing, confirm:

- [ ] Org unit UIDs remapped via `configure.py` or manual re-point plan decided (Section 1)
- [ ] MDA calendar months approach decided — relative periods or manual fixed-period edits (Section 2)
- [ ] Endemicity assumptions reviewed against your country's disease distribution (Section 3)
- [ ] Diseases not present in your country identified and excluded from import scope (Section 3)
- [ ] Translation needs identified and approach decided (Section 5)
- [ ] Data dictionary approach decided (Section 6)

---

## Import order

**You can ship and import everything as one combined `metadata.json`.** DHIS2's importer
sorts object types into dependency order internally and resolves UID references, so a
single file imported in one request is the norm (it's how the official WHO/HISP packages
ship). Use the API for this:

```bash
# 1. Dry run — validates only, changes nothing:
curl -u user:pass -X POST \
  "https://your-instance.org/api/metadata?importMode=VALIDATE&atomicMode=ALL" \
  -H "Content-Type: application/json" --data-binary @metadata/full_package.json

# 2. Commit — only if the dry run is clean:
curl -u user:pass -X POST \
  "https://your-instance.org/api/metadata?importStrategy=CREATE_AND_UPDATE&atomicMode=ALL" \
  -H "Content-Type: application/json" --data-binary @metadata/full_package.json
```

Use **`atomicMode=ALL`** (all-or-nothing) for a fresh install so a single failure rolls
the whole import back and leaves the instance untouched and re-runnable, rather than
half-imported. [`tools/install.py`](../tools/install.py) does exactly this (dry-run →
confirm → commit) plus the org-unit preflight and adaptation.

**Organisation units are a prerequisite, not part of the package** — set up your
administrative hierarchy in Maintenance (or confirm your existing HMIS hierarchy) *before*
importing. See [adaptation.md](./adaptation.md) §2.

The numbered order below matters only when you import **in stages through the UI** (for
clearer per-stage errors) or when **troubleshooting a partial failure**:

1. **Organisation units** — your country's administrative hierarchy (national + district level minimum). Set these up first; they are not shipped in the package. Run `tools/configure.py` to adapt the package to your national root UID before importing.
2. **Category combos and category option combos** — required by data elements. Most datasets use the default category combo (`bjDvmb4bfuf`) so this is usually a no-op unless adding new disaggregation.
3. **Option sets and options** — required by any data element that uses an option set (endemicity classifications, MDA month/PC-implemented flags, drug codes). Import before data elements, since data elements reference option sets. *(This step is easy to miss — data elements with an unresolved `optionSet` reference will fail to import.)*
4. **Data elements** — all data elements across the 13 datasets. Import before datasets since datasets reference data elements via `dataSetElements`.
5. **Datasets** — the 13 datasets (4 treatment forms, 4 drugs management, JRSM, microplanning, 4 trachoma forms). See [data-sources.md](./data-sources.md) for the full list with periods and org unit levels.
6. **Indicators** — Coverage Rate / Refusal Rate / Coverage Gap per disease plus NTD Overall Coverage Rate. See [indicators.md](./indicators.md) for formula reference.
7. **Indicator groups** — the `NTD Coverage Indicators` group used for Maps app access.
8. **Visualizations** — import via Metadata Import. **Read the warning below before this step.**
9. **Maps** — the choropleth coverage maps referenced by dashboards.
10. **Dashboards** — reference visualization and map UIDs via `dashboardItems`. Must be imported after visualizations and maps.
11. **Validation rules** — import `metadata/validation_rules.json` (or fold it into the combined package). If you remapped data-element/indicator UIDs, re-run `tools/build_validation_rules.py --uids ...` first to regenerate with your UIDs.

For a staged UI import of each step: **Import/Export → Metadata Import**, select **JSON**, run a **dry run** first, then re-run with **Create and update**.

---

## Critical warning: visualizations and the API

This is the most important operational fact about this repository.

**DHIS2 stores data element / indicator references inside visualizations in internal dimension tables that are not exposed through the standard metadata JSON.** When a visualization is exported, `dataDimensionItems` comes back empty — the `id` fields are stripped.

This means:

- **Importing visualizations from this repository's `/metadata` export works correctly** — internal tables travel with the object on export/import. This is a supported DHIS2 operation.
- **You cannot generate new visualizations from scratch via PUT/PATCH** — attempting this strips the internal references and leaves the visualization blank. This was confirmed directly during this repository's development.
- **Creating new visualizations via POST works** if you use the correct payload structure: `dimension: "dx"` inside the `columns` array with `items` containing actual UIDs, plus `dataDimensionItems` at the top level. Do not include `series`, `category`, or `filterDimensions` root-level fields — these cause a 500 error.

If a new country needs different data elements in a chart, rebuild manually in Data Visualizer using **Save As** to clone an existing chart, then swap data elements in the UI. Or use the POST approach above for new chart creation.

---

## Post-import validation

Run `tools/validate_import.py` after every metadata import:

```bash
python3 tools/validate_import.py --base-url https://your-instance.org \
    --username admin --password yourpassword
```

Also confirm manually:
- [ ] All 13 datasets appear in **Maintenance → Dataset** with expected data elements attached
- [ ] All indicators appear in **Maintenance → Indicator** with formulas previewing correctly
- [ ] All dashboards open without errors — blank charts usually mean org unit UIDs still reference Sierra Leone
- [ ] Spot-check 2–3 visualizations per dashboard in Data Visualizer to confirm data dimension items show actual names, not blank selectors
- [ ] Maps app shows choropleth with district boundaries rendering correctly

---

## Loading data

Once metadata is imported, dashboards show "No data" until real data is loaded — this is expected. Two paths:

- **ESPEN-sourced data** (LF, Oncho, SCH, STH treatment and coverage) — use the ESPEN Connector app included in this repository
- **Manually-reported data** (JRSM, drugs management, microplanning, trachoma TEMF forms) — enter via DHIS2 data entry or CSV import. See [data-sources.md](./data-sources.md) for field-by-field guidance per dataset.

After loading any data, run **Data Administration → Analytics → Analytics Tables** to regenerate analytics before charts will reflect new values.

---

## Sharing and access control

DHIS2 splits access into three independent things — **roles** (what a person can *do*),
**groups** (which shared objects they can reach), and each user's **org-unit scope** (which
locations). The package ships the roles and groups; the installer sets the sharing; adopters
set each user's role + group(s) + scope.

**The package ships a generic access scaffold** (`metadata/access_scaffold.json`) — three
roles + two groups (not Sierra Leone accounts). Every role is deliberately limited so the
shipped configuration is **static for every non-superuser**: no role has the Maintenance app
or any metadata-create authority.

**Roles (capabilities):**

| Role | Can do | Cannot do |
|---|---|---|
| **NTD Administrator** | View all dashboards; enter national datasets; run validation; export/download (incl. dependency JSON); build own charts | Maintenance app; any metadata-create authority |
| **NTD Data Entry** | Enter/edit data; view dashboards | Maintenance; config editing; export |
| **NTD Viewer** | View & download dashboards, visualizations, maps | Any data entry or editing |

*(The System Administrator is the existing instance superuser — not shipped.)*

**Groups (sharing targets):** **NTD Users** (everyone — receives *view* on
dashboards/visualizations/maps/indicator group and *data read* on datasets) and **NTD Data
Entry** (receives *data capture* on datasets **and category options** — the latter is
essential, or entry against disaggregated data elements is silently blocked). Access is
group-controlled; only a superuser gets metadata-write.

This is why dashboards are visible and data entry works immediately after install even
though the export used "skip sharing" (which strips the *source* instance's sharing): skip-
sharing removes Sierra Leone's per-object sharing, and the installer adds a clean one.

**Membership matrix (what each user gets):**

| User type | Role | Group(s) | Org scope |
|---|---|---|---|
| National M&E | NTD Administrator | NTD Users + NTD Data Entry | National |
| District officer | NTD Data Entry | NTD Users + NTD Data Entry | Their district |
| Partner / observer | NTD Viewer | NTD Users | National (view) |

**ESPEN Connector app access** is restricted separately, per adopter — see
[Restricting the ESPEN Connector app](#restricting-the-espen-connector-app) below.

**Locale note:** DHIS2 has two locale settings per user — **UI locale** (app chrome) and
**database locale** (which translations of metadata *names* show). For translated
dashboard/data-element names to appear, set the **database locale**, not just the UI locale,
and ensure the translations exist (only partial French ships today; Portuguese must still be
authored).

**What must be done by hand** (per-user, cannot be pre-shipped):

1. Create the user accounts; assign each a role + group(s) + org-unit scope per the matrix.
2. Set each user's **org-unit scope** — data capture *and* data view org units — and locale.
3. **Verify the role authorities on your DHIS2 version** — the scaffold uses the classic
   `M_dhis-web-*` app authorities, which may need adjustment on newer versions. Confirm each
   role opens the apps you expect and **not** Maintenance.

Also check:

- **Maps geometry:** choropleth maps render only if your district org units carry boundary
  geometry. The installer warns if they don't; load boundaries via **Import/Export →
  GeoJSON import** (sources: geoBoundaries, GADM, OCHA COD). See [adaptation.md](./adaptation.md).

To opt out of the scaffold (e.g. your instance already has an access model), run the
installer with `--no-scaffold --no-sharing` and wire sharing to your own groups.

### Restricting the ESPEN Connector app

The ESPEN Connector is a separate app (installed via App Management, not part of the
metadata import). Because it stores the ESPEN API token and submits your country's data to
the WHO AFRO portal, restrict it to the one or two people responsible for submission.

DHIS2 gates each installed app by an **authority** it auto-creates on install (it appears in
the role editor under the app's name). To restrict:

1. **Install the app** (App Management → upload `apps/espen-connector/build/bundle/…zip`).
   The authority does not exist until the app is installed.
2. Create a small **"ESPEN Submitter"** role containing *only* that app authority.
3. Assign it to the focal person(s) **on top of** their normal role (DHIS2 unions a user's
   roles), and keep the authority **out of every other role**.

The app then appears only for those users. This is a per-adopter step — each new
implementation installs its own copy of the app and creates this role.

---

## Known limitations

- **Trachoma is national level only** — no district disaggregation exists in the TEMF reporting forms
- **Loa loa is out of scope** — Sierra Leone is not Loa loa co-endemic; no metadata for it exists in this instance
- **Sex disaggregation at facility level** — requires tracker-based reporting, not the current district-aggregate model; deferred to a future phase
- **Oncho, SCH, and STH dashboards** were built by manual replication from LF — cross-check item counts against the LF dashboard to verify completeness
