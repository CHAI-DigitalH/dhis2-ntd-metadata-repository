# Changelog

All notable changes to the NTD DHIS2 Metadata Package.

## v1.0 — 2026-11-02

First tagged release: a validated, installable package for the five preventive-chemotherapy NTDs (LF, Oncho, SCH, STH, Trachoma).

**Package**
- 9 dashboards, 113 visualisations, 91 indicators, 136 data elements, 14 datasets, 14 validation rules.
- Country-neutral: no organisation units baked in; charts use relative `LEVEL-1`/`LEVEL-2`.
- Generic names where they would collide with an existing HMIS (`NTD Male` / `NTD Female` / `NTD Population`).
- All data elements carry a `code` and `description`.
- Dashboards named `NTD — N. …` (Sierra Leone is the documented model, not branding).

**Installer (`tools/install.py`)**
- One-command install that adapts the package to a country's org units, imports everything, applies roles and sharing, and assigns datasets.
- Restores chart data elements after import via a per-visualisation PUT (DHIS2's metadata importer drops them).
- Flags missing district boundary geometry and points to `docs/maps.md`.
- Forward-looking map-install step (PUTs maps when the package ships them).

**Tools & docs**
- `tools/seed_demo_data.py` — seed random demo data to populate the dashboards for a demo.
- `docs/contents.md` + `docs/data-dictionary.xlsx` — full contents and data dictionary.
- `docs/maps.md` — loading district boundaries.
- `metadata/individual/` — the package split into dependency-ordered bundles for partial import.

**Validated**
- Full install and single-bundle import tested end to end on a clean DHIS2 v2.42; 110/111 visualisations structurally complete (the one gap: `LF - Target Population by Age Group`, whose age-group data elements are not in any dataset).

**Known gaps**
- Map *visualisations* are not yet in the package (DHIS2 import limitation); boundaries + manual map creation documented in `docs/maps.md`.
- ESPEN Connector is built but pending API access from WHO AFRO ESPEN.
- French/Portuguese dashboard translations planned.
