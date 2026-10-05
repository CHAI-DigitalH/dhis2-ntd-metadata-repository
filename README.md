# NTD DHIS2 Metadata Package

A ready-to-install DHIS2 package — dashboards, indicators, and data-entry forms — for national monitoring of the five preventive-chemotherapy NTDs: Lymphatic Filariasis (LF), Onchocerciasis (Oncho), Schistosomiasis (SCH), Soil-Transmitted Helminths (STH), and Trachoma.

A proof-of-concept Digital Public Good developed by **CHAI Digital Health**, with Sierra Leone's NTD programme as the reference (model) implementation, built to be adapted by any PC-NTD-endemic country.

## Quick install

**Prerequisites:** a running DHIS2 (tested on v2.42) that already has your country's organisation-unit hierarchy (country → districts) set up, and Python 3.

```bash
# 1. Get the package
git clone git@github.com:CHAI-DigitalH/dhis2-ntd-metadata-repository.git
cd dhis2-ntd-metadata-repository

# 2. Install the Python requirements
pip install -r tools/requirements.txt

# 3. Point it at your instance: copy the example config and set org_units.national_uid
cp tools/country-config.example.yaml country-config.yaml

# 4. Run the installer
python3 tools/install.py \
  --base-url https://YOUR-DHIS2 --username admin --password ***** \
  --config country-config.yaml \
  --package metadata/full_package.json \
  --rules metadata/validation_rules.json
```

That one command adapts the package to your org units, imports everything (dashboards, indicators, datasets, validation rules), applies roles and sharing, and restores each chart's data elements.

> ⚠️ **Install with `install.py` — do NOT do a plain metadata import.** Importing `full_package.json` by hand through the DHIS2 Import/Export app silently drops every chart's data elements and the dashboards come up broken. The installer's final step re-applies them via a per-visualization PUT; a plain import can't. This is the single most important thing to get right.

The install is **metadata only** — the dashboards render correctly but show **"No data available"** until you load your country's data (see below). Validated end to end on a clean DHIS2 v2.42; other versions are not yet verified.

## Getting your country's data in

The package ships the *structure* (forms, indicators, dashboards); your programme supplies the *numbers*. Three paths — use one or a mix:

1. **Enter it** — staff use DHIS2's **Data Entry** app to fill the NTD forms per district and period (e.g. after each MDA round). No mapping needed; the forms are already there. This is the ongoing path.
2. **Bulk-import history** — map your existing spreadsheets (or ESPEN data) to the package's data elements and org units, then import via the **Import/Export** app or the API. Backfills past years so trends appear immediately.
3. **Transfer** from an existing DHIS2 / HMIS — a mapping exercise to move NTD data you already hold.

In every case, afterwards run **Data Administration → Analytics → Start** (~15 min) and the dashboards populate. See [data-sources.md](./docs/data-sources.md) for where each dataset's data comes from and a recommended order to load from zero.

## What's inside

- **14 datasets** — treatment reporting (MDA), drug & commodity management, procurement planning (JRSM), microplanning, and Trachoma-specific monitoring (TEMF, prevalence surveys)
- **9 dashboards** — National overview, District performance, the four PC-NTD disease dashboards (LF / Oncho / SCH / STH), Trachoma, Trachoma WASH, and a cross-cutting Drug Management & Programme Planning dashboard — **91 indicators** across **113 visualisations**
- **Consistent indicator logic** for Coverage Rate, Refusal Rate, and Coverage Gap across all four PC-NTDs, plus **14 data-plausibility validation rules**
- **A generic access model** — 3 roles (NTD Administrator / Data Entry / Viewer) + 2 user groups, applied at install
- **An ESPEN Connector** DHIS2 app for submitting country treatment data to the WHO AFRO ESPEN portal (see its status in [tools/README.md](./tools/README.md))
- **French translation** of the National, District, and LF dashboards as a template for additional languages

## What this is not

- Not a replacement for the official WHO NTD Overarching Module, which covers 30+ NTDs with facility-level, sex/age-disaggregated reporting. This package covers five diseases at district-aggregate level, optimised for dashboard-first programme monitoring rather than comprehensive case-based surveillance.
- Not a tool for generating or bulk-editing DHIS2 visualisations via the API. A core finding from building this package is that DHIS2's visualisation API does not reliably support this — which is why the installer, not a plain import, is required. See [setup.md](./docs/setup.md).
- Not pre-loaded with country data. It installs the structure only; you load your own data (see above).

## Documentation

| Document | What it covers |
|---|---|
| [tools/README.md](./tools/README.md) | The CLI tooling — adopter runbook (install it) and maintainer runbook (rebuild the package) |
| [setup.md](./docs/setup.md) | Installation order, the visualisation-API limitation and why `install.py` is required, post-import validation, sharing/access control |
| [adaptation.md](./docs/adaptation.md) | What to change to adopt this for a country other than the Sierra Leone model — org units, MDA calendar, endemicity, translation |
| [data-sources.md](./docs/data-sources.md) | Where each dataset's data comes from (ESPEN vs manually reported), who owns it in an NTD programme, and a recommended order to populate from zero |
| [indicators.md](./docs/indicators.md) | Every indicator's formula, which diseases it applies to, and how to interpret it |
| [validation.md](./docs/validation.md) | The 14 data-plausibility validation rules and how to run validation analysis |
| [deployment-readiness.md](./docs/deployment-readiness.md) | Release-readiness checklist by blocker severity |

## Repository structure

```
/metadata           — the importable package (full_package.json) + validation_rules.json + access_scaffold.json
/docs               — indicators, setup, adaptation, data-sources, validation, deployment-readiness
/tools              — CLI tooling (build / configure / install / validate) + country-config template
/apps
  /espen-connector  — DHIS2 app for submitting NTD treatment data to the WHO AFRO ESPEN portal
/README.md          — this file
/LICENSE            — [placeholder — license to be finalised]
```

## Known limitations

- **Visualisations cannot be created or reliably edited via the DHIS2 API** — all chart building/editing happens in Data Visualizer, and the package must be installed via `install.py` (which works around this with a per-visualisation PUT). This is a DHIS2 platform limitation, not specific to this package.
- **Trachoma data is national-level only** — no district disaggregation exists in the source reporting forms.
- **No sex disaggregation** for treatment outcomes in this version — would require a facility/tracker-based model, out of scope for the current district-aggregate design.
- **Age-band breakdowns (Pre-SAC / SAC / Adult)** exist for LF only; one age-group chart references data elements not yet in the datasets.
- **Loa loa** is out of scope — the Sierra Leone model is not Loa-co-endemic, so no metadata for it exists here.

## Governance and license

**[Placeholder — to be finalised.]** This section should specify: the open license covering code and metadata in this repository, the maintaining organisation or team, and a contribution/issue process for adopting countries. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## Acknowledgements

Developed by **CHAI Digital Health**, with Sierra Leone's NTD programme as the model implementation. Design conventions informed by WHO and HISP's DHIS2 Health Data Toolkit metadata packages (dhis2.org/health-data-toolkit), the official NTD Overarching Module documentation, and the open-source NTD DHIS2 repository pattern.
