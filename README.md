# NTD DHIS2 Metadata Package

A ready-to-install DHIS2 setup — dashboards, indicators, and data-entry forms — for national monitoring of the five preventive-chemotherapy NTDs: **Lymphatic Filariasis, Onchocerciasis, Schistosomiasis, Soil-Transmitted Helminths, and Trachoma.**

Developed by **CHAI Digital Health** as a proof-of-concept Digital Public Good, with Sierra Leone's NTD programme as the model. Any PC-NTD-endemic country can install it and adapt it to their own system.

---

## What it gives you

A working NTD monitoring system in DHIS2, out of the box: **9 dashboards, 91 indicators, and 14 data-entry forms** covering treatment (MDA), drug and commodity management, microplanning, and surveys — for all five diseases, at national and district level.

You install the **structure**; your programme enters the **data**. (See [docs/contents.md](./docs/contents.md) for everything that's inside.)

## Install

**You'll need:** a running DHIS2 (tested on **v2.42**) that already has your country's district hierarchy set up, and Python 3.

```bash
git clone git@github.com:CHAI-DigitalH/dhis2-ntd-metadata-repository.git
cd dhis2-ntd-metadata-repository
pip install -r tools/requirements.txt

# set one value — your national org-unit ID — in a copy of the example config:
cp tools/country-config.example.yaml country-config.yaml

python3 tools/install.py \
  --base-url https://YOUR-DHIS2 --username admin --password ***** \
  --config country-config.yaml \
  --package metadata/full_package.json \
  --rules metadata/validation_rules.json
```

One command adapts the package to your org units and imports everything — dashboards, indicators, datasets, validation rules, roles, and sharing.

> ⚠️ **Use `install.py` — do not import the JSON by hand through DHIS2.** A plain Import/Export of the package silently breaks every chart; the installer's final step fixes that. This is the one thing to get right.

Dashboards install **empty** ("No data available") and fill in once you load data and run Analytics.

**Only want one piece** (just the forms, or just the dashboards)? The package is also split into importable layers — see [metadata/individual/](./metadata/individual/).

## Getting your data in

The package ships the forms and reports; your programme supplies the numbers. Three ways:

1. **Enter it** — staff fill the NTD forms in DHIS2's Data Entry app, per district and period (e.g. after each MDA round). Nothing to map — the forms are ready.
2. **Bulk-import history** — map existing spreadsheets (or ESPEN data) to the data elements and districts, and import via the Import/Export app or API.
3. **Transfer** from an existing DHIS2 / HMIS.

Then run **Data Administration → Analytics** (~15 min) and the dashboards populate. Details in [docs/data-sources.md](./docs/data-sources.md).

## Where to find things

| You want to… | Go to |
|---|---|
| See every dashboard, dataset, and data element | [docs/contents.md](./docs/contents.md) |
| Install, or understand why `install.py` is required | [docs/setup.md](./docs/setup.md) |
| Adapt it for your country (org units, MDA calendar, endemicity, translation) | [docs/adaptation.md](./docs/adaptation.md) |
| Load your data | [docs/data-sources.md](./docs/data-sources.md) |
| Understand the indicator formulas | [docs/indicators.md](./docs/indicators.md) |
| Run data-quality / validation checks | [docs/validation.md](./docs/validation.md) |
| Use the command-line tools | [tools/README.md](./tools/README.md) |
| Import just part of the package | [metadata/individual/](./metadata/individual/) |

## Repository map

```
/metadata              — the importable package + validation rules + access scaffold
  /individual          — the package split into importable layers (datasets, dashboards, …)
/docs                  — contents, setup, adaptation, data-sources, indicators, validation
/tools                 — install / configure / build / validate scripts
/apps/espen-connector  — DHIS2 app for submitting data to the WHO AFRO ESPEN portal
```

## Status & roadmap

- **Validated** end to end on a clean DHIS2 v2.42; other versions not yet verified.
- **Translations** — French dashboards exist as a template; **French and Portuguese** versions of the core dashboards are planned.
- **Data-element descriptions & codes** are being enriched in the metadata (names are self-describing today).
- **ESPEN Connector** — built, pending API access from WHO AFRO ESPEN.

See [docs/deployment-readiness.md](./docs/deployment-readiness.md) for the full readiness checklist and [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) to get involved.

## License & attribution

Developed by **CHAI Digital Health**, with Sierra Leone's NTD programme as the model implementation. Design conventions informed by WHO and HISP's DHIS2 Health Data Toolkit packages. License to be finalised — see [CONTRIBUTING.md](./docs/CONTRIBUTING.md).
