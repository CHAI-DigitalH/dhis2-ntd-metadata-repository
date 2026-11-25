# Project Handoff

NTD DHIS2 Metadata Package — status, what's done, what's open, and how to pick it up. Start here if you're taking this over.

## What this project is

A reusable DHIS2 package (dashboards, indicators, data-entry forms) for the five PC-NTDs, plus a one-command installer and the ESPEN Connector app. Developed by CHAI Digital Health; Sierra Leone is the reference model. Released as **v1.0**.

## State in one paragraph

The package installs cleanly on a fresh DHIS2 via `tools/install.py` and produces working dashboards (validated: 110/111 visualisations structurally complete). It's metadata-only — load data + run analytics to see figures. The ESPEN Connector is built but blocked on WHO AFRO API access. Maps need the country's boundary geometry (installer handles that) **and** the map visualisations added back to the package (the one real content gap). The repo is clean and tagged `v1.0`.

## The three rules that matter

1. **Install with `tools/install.py`, never a plain metadata import.** The DHIS2 metadata importer silently drops each chart's data elements; the installer repairs them with a per-visualisation PUT (stage 5b). A hand import = broken charts.
2. **The package is metadata-only.** Dashboards install empty ("No data available") until data is entered/imported and analytics runs. That's correct, not a bug.
3. **Maps need boundary geometry** (the country's own GeoJSON) — the installer offers to load it (step 11 / `--geojson`). Loading boundaries is covered; the map *tiles* themselves are the open item below.

## Done

- Package: 9 dashboards, 113 visualisations, 91 indicators, 136 data elements, 14 datasets, 14 validation rules. Country-neutral (no org units), collision-safe names, all DEs carry code + description, dashboards named `NTD —`.
- `tools/install.py` — adapts to country org units, imports, restores viz data items (stage 5b), installs maps if present (stage 5c), applies roles/sharing, assigns datasets, and offers interactive boundary-geometry loading (step 11).
- `tools/seed_demo_data.py` — one command to populate a demo instance.
- Docs: `docs/contents.md` + `docs/data-dictionary.xlsx`, `setup.md`, `adaptation.md`, `data-sources.md`, `maps.md`, `validation.md`, `indicators.md`; this handoff set.
- `metadata/individual/` — package split into dependency-ordered bundles for partial import.
- Validated end to end on a clean DHIS2 v2.42 (full install + single-bundle import).

## Open items

See [ROADMAP.md](./ROADMAP.md) for the prioritised list. In short:

1. **Maps** (content gap) — the map visualisations aren't in the package yet (DHIS2 importer rejects them). Export them from the reference instance (`scratchpad export_maps.js` pattern), add to `metadata/full_package.json`, and the installer's stage 5c + dashboard map items will handle the rest. Boundary loading is already done.
2. **Age-group chart + population indicators** — `LF - Target Population by Age Group` and a few age/sex "population" indicators reference demographic data elements not in the package. Ship those DEs, or remove the few affected charts/indicators.
3. **ESPEN Connector** — finish once WHO AFRO grants API access. Design + remaining steps in [ESPEN.md](./ESPEN.md).
4. **License/governance** — confirm the open license (recommendation in [ROADMAP.md](./ROADMAP.md) and the root `LICENSE`).
5. **FR/PT dashboards** — see [../translations.md](../translations.md).

## How to run / test it

```bash
pip install -r tools/requirements.txt
# install onto a DHIS2 (v2.42) that already has an org-unit hierarchy:
python3 tools/install.py --base-url https://your-dhis2 --username admin --password *** \
  --config country-config.yaml --package metadata/full_package.json --rules metadata/validation_rules.json
# see it with data:
python3 tools/seed_demo_data.py --base-url https://your-dhis2 --username admin --password *** --analytics
```

For how the package is built/exported and the DHIS2 quirks behind the installer, read [MAINTAINER.md](./MAINTAINER.md).
