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

Each layer depends on the ones above it. If you import a subset by hand (DHIS2 **Import/Export** app or the API), import low numbers first (`01` → `05`). Examples:
- "Just the data-entry forms" → `01` + `02` + `04`
- "Just the indicators" → `01` + `02` + `03`

## Caveat: dashboards imported by hand will have broken charts

Importing `05-dashboards.json` through the DHIS2 Import/Export app leaves charts without their data elements — a DHIS2 API limitation (see the [main README](../../README.md)). To get **working** dashboards, use the installer (`tools/install.py`), which repairs them. These split files are best for the lower layers (data elements, indicators, datasets) and for inspecting what's inside.
