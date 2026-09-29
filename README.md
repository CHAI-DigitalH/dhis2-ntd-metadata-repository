# SL NTD Metadata Repository

A DHIS2-based metadata repository and dashboard suite for routine reporting and monitoring of five Neglected Tropical Diseases (NTDs): Lymphatic Filariasis (LF), Onchocerciasis (Oncho), Schistosomiasis (SCH), Soil-Transmitted Helminths (STH), and Trachoma. Built as a proof-of-concept Digital Public Good (DPG) with Sierra Leone as the reference implementation, designed to be replicable and adaptable for other PC-NTD-endemic countries.

This repository was developed by CHAI Sierra Leone. It draws on design conventions established by WHO and HISP's official DHIS2 health data toolkit packages (Malaria, RMNCAH, NTD Overarching Module), and is intended to complement — not replace — the official WHO NTD Overarching Module for countries that need a PC-NTD-focused, dashboard-first implementation.

## What this is

- **13 datasets** covering treatment reporting, drugs management, procurement planning (JRSM), microplanning, and Trachoma-specific monitoring (TEMF, prevalence surveys)
- **9 dashboards**: National overview, District performance, four PC-NTD disease dashboards (LF/Oncho/SCH/STH), Trachoma, Trachoma WASH, and a cross-cutting Drug Management & Programme Planning dashboard
- **Indicator logic** for Coverage Rate, Refusal Rate, and Coverage Gap, calculated consistently across all four PC-NTDs
- **An ESPEN Connector** DHIS2 app for submitting country treatment data to the WHO AFRO ESPEN portal
- **French translation** of the National, District, and LF dashboards as a template for additional languages

## What this is not

- Not a replacement for the official WHO NTD Overarching Module, which covers 30+ NTDs with facility-level, sex/age-disaggregated reporting. This repository covers five diseases at district-aggregate level, optimized for dashboard-first programme monitoring rather than comprehensive case-based surveillance.
- Not a tool that lets you generate or bulk-edit DHIS2 visualizations programmatically. A core finding from building this repository is that DHIS2's visualization API does not reliably support this — see [setup.md](./docs/setup.md) for the full explanation and what to do instead.
- Not pre-loaded with real country data beyond Sierra Leone's proof-of-concept dataset. See [data-sources.md](./docs/data-sources.md) for how to source and load real data for your country.

## Documentation

| Document | What it covers |
|---|---|
| [indicators.md](./docs/indicators.md) | Every indicator's formula, which diseases it applies to, how to interpret it, and what indicators exist in the instance but aren't yet visualized |
| [setup.md](./docs/setup.md) | Installation order, the visualization API limitation and how to work around it, post-import validation, sharing/access control |
| [adaptation.md](./docs/adaptation.md) | What must change to adopt this for a country other than Sierra Leone — relativizing dashboards, org units, MDA calendar, endemicity, translation |
| [data-sources.md](./docs/data-sources.md) | Where each dataset's data comes from (ESPEN vs manually-reported), who typically owns it in an NTD programme, and a recommended order to populate data from zero |
| [validation.md](./docs/validation.md) | The 14 data-plausibility validation rules, what each catches, and how to run validation analysis |
| [deployment-readiness.md](./docs/deployment-readiness.md) | Release-readiness checklist — what stands between this repo and a clone-and-run DPG, by blocker severity |
| [tools/README.md](./tools/README.md) | The CLI tooling — maintainer runbook (build the package) and adopter runbook (install it) |

Read them in that order if you're starting fresh: indicators → setup → adaptation → data-sources tells you what the numbers mean, how to get the structure in, what to change for your context, and how to fill it with real data.

## Quickstart

1. Read [setup.md](./docs/setup.md) in full, especially the visualization API warning, before importing anything.
2. If you are not Sierra Leone, read [adaptation.md](./docs/adaptation.md) and decide your org unit, MDA calendar, and endemicity changes *before* importing — several of these are far cheaper to handle pre-import than post-import.
3. Import the metadata. The fast path is the installer — `python3 tools/install.py --base-url ... --config country-config.yaml` — which preflights org units, adapts the package, dry-runs, imports, and loads validation rules. To do it by hand, follow the import sequence in [setup.md](./docs/setup.md). Either way, the package imports as a single combined `metadata.json`; DHIS2 resolves dependency order internally.
4. Run the post-import checks: `python3 tools/validate_import.py --base-url ... --config country-config.yaml`.
5. Load real data following [data-sources.md](./docs/data-sources.md), starting with one PC-NTD's ESPEN treatment data for the fastest path to a working demo.
6. Set up sharing and user groups per the access control section of [setup.md](./docs/setup.md) before handing the instance to programme staff.

## Repository structure

```
/metadata           — the importable package (full_package.json) + validation_rules.json
/docs               — indicators, setup, adaptation, data-sources, validation, deployment-readiness
/tools              — CLI tooling (build / configure / install / validate) + country-config template
/apps
  /espen-connector  — DHIS2 app for submitting NTD treatment data to the WHO AFRO ESPEN portal
/README.md          — this file
/LICENSE            — [placeholder — license to be finalized]
```

## Known limitations

These are documented in detail in [setup.md](./docs/setup.md), summarized here:

- **Visualizations cannot be created or reliably edited via the DHIS2 API.** All chart building and editing must happen manually in Data Visualizer. This is a DHIS2 platform limitation, not specific to this repository — it's the reason every official WHO/HISP metadata package also ships pre-built visualizations rather than generating them from scripts.
- **Trachoma data is national-level only** — no district disaggregation exists in the source reporting forms.
- **No sex disaggregation** exists for treatment outcomes in this version — would require a facility-level/tracker-based reporting model, out of scope for the current district-aggregate design.
- **Age-band breakdowns (Pre-SAC/SAC/Adult)** exist for LF only; replicating to Oncho/SCH/STH and adding a treated-by-age-band view are tabled for a future build pass — the underlying data elements already exist.
- **Loa loa** is out of scope — Sierra Leone is not a Loa loa co-endemic country, so no metadata for it exists in this instance.

## Governance and license

**[Placeholder — to be finalized.]** This section should specify: the open license covering code and metadata in this repository, the named maintaining organization or team, and a contribution/issue process for adopting countries to report problems or propose changes. A `CONTRIBUTING.md` should accompany this once governance is decided.

## Acknowledgements

Built by CHAI. Design conventions informed by WHO and HISP's DHIS2 Health Data Toolkit metadata packages (dhis2.org/health-data-toolkit), the official NTD Overarching Module documentation, and the open-source NTD DHIS2 repository pattern.
