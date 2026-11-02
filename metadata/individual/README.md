# Individual metadata bundles

The whole package installs in one step with the installer (see the [main README](../../README.md)) — that's the supported path, and it imports exactly these objects in the right order.

These files are the same package **split into dependency-ordered layers**, for when you only want part of it or want to inspect one layer on its own.

| File | Contains | Grab this when you want… |
|---|---|---|
| `01-category-metadata.json` | categories, category combos & options, option sets, indicator type | the shared building blocks (everything below needs these) |
| `02-data-elements.json` | 136 data elements | the fields data is captured against |
| `03-indicators.json` | 91 indicators | the calculated measures (coverage, gaps, rates) |
| `04-datasets.json` | 14 datasets + sections + entry forms | just the data-entry forms |
| `05-dashboards.json` | 9 dashboards + 113 visualisations | just the dashboards & charts |

Also available separately in the parent folder: `validation_rules.json` and `access_scaffold.json` (roles + user groups).

## Import order matters

Each layer depends on **all** the ones above it, so import cumulatively in number order — to get a layer, import `01` through that layer. Stop at the one you need.

- Just the **data elements** → `01` + `02`
- Just the **indicators** → `01` + `02` + `03`
- Just the **data-entry forms** → `01` + `02` + `03` + `04` *(datasets also reference their indicators, so `03` is required)*
- The **dashboards** → all of `01`–`05` (and use the installer to make the charts work — see below)

Import each file with `importStrategy=CREATE_AND_UPDATE`. Note that `atomicMode=ALL` (the default) rejects the **whole** file if any single reference is missing, so don't skip a lower layer.

## Caveat: dashboards imported by hand will have broken charts

Importing `05-dashboards.json` through the DHIS2 Import/Export app leaves charts without their data elements — a DHIS2 API limitation (see the [main README](../../README.md)). To get **working** dashboards, use the installer (`tools/install.py`), which repairs them. These split files are best for the lower layers (data elements, indicators, datasets) and for inspecting what's inside.
