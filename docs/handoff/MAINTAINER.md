# Maintainer Guide

How the package is built, how the installer works, and the DHIS2 quirks behind both — so you don't rediscover them.

## How the package is produced

`metadata/full_package.json` is exported from a reference DHIS2 instance (the Sierra Leone build), then scrubbed. The reliable method:

1. **Dependency-export** the 9 NTD dashboards (`/api/dashboards/{id}/metadata.json`) and the 14 datasets (`/api/dataSets/{id}/metadata.json`), and merge.
2. **Re-fetch each visualisation** with `fields=*,columns[:all],rows[:all],filters[:all]` — the dependency export returns charts as *shells* (it drops periods, the `dx` items, legends). The full fetch is the only way to keep them.
3. **Scrub**: remove sharing, audit fields, `attributeValues`, org units; exclude DHIS2 default objects.
4. **De-brand / de-collide**: dashboards `NTD —`; `NTD Male/Female/Population` so they don't collide with an existing HMIS.

`tools/build_metadata_package.py` does the offline merge/scrub; `tools/configure.py` does per-country adaptation at install time. `tools/build_validation_rules.py` regenerates the 14 rules with stable UIDs (idempotent re-import).

> The one-off browser-console scripts used to repair/export from the reference instance (resolve/apply/export_maps) are **throwaway ops tools** — they live in the working scratchpad, not the repo.

## The DHIS2 quirks that shaped everything

1. **The metadata importer drops a visualisation's data items.** `POST /api/metadata` reports `updated` but silently discards each chart's `dx` (data element) selection — on both CREATE and UPDATE. The data item lives in `columns[dx].items` as a full `DATA_X` dimension object, *not* in `dataDimensionItems` (which serialises type-only). The only write path that persists it is **`PUT /api/visualizations/{id}`** of the full object. → installer **stage 5b** PUTs every viz after import. This is the single most important thing to know.
2. **The importer also rejects maps** (Hibernate transient error on nested `mapView` refs). Same fix: **`PUT /api/maps/{id}`** → installer **stage 5c** (no-op until maps ship).
3. **Periods and org units survive the import** as scalar fields (`relativePeriods`, `organisationUnitLevels`) — only the `dx` items need the PUT.
4. **Name collisions** with an existing HMIS (Male/Female/Population) fail an atomic import — hence the `NTD ` prefixes.
5. **Dangling `legend.set`** refs on charts cause a Hibernate null-name error on atomic import — strip any legendSet ref not included in the package.
6. **Datasets reference their indicators**, so a partial import of datasets needs indicators first (bundle order `01→05`, cumulative).
7. **Analytics must be generated** after data load before any chart renders (`POST /api/resourceTables/analytics`). On the SL demo this is heavy; `?skipEvents=true&lastYears=N` speeds it up.
8. **GeoJSON boundary import**: `POST /api/organisationUnits/geometry` (raw GeoJSON body, `orgUnitProperty` = id/code/name, `geoJsonProperty` for the feature property, `dryRun`). Used by installer step 11.
9. **Unauthenticated API calls return 302** (redirect to login), not 401 — matters when scripting readiness checks.

## Installer stages (`tools/install.py`)

1 connect → 2 org-unit preflight (+ geometry check) → 3 national root → 4 configure (adapt to country) → 5 metadata import → **5b reapply viz (PUT)** → **5c install maps (PUT)** → 6 validation rules → 7 roles/groups → 8 assign datasets to org units → 9 sharing → 10 regenerate COCs → **11 maps/boundary geometry (interactive or `--geojson`)**.

## Updating the package

After changing the reference instance: re-export (steps above), replace `metadata/full_package.json`, regenerate the derived files (`metadata/individual/*`, `docs/contents.md`, `docs/data-dictionary.xlsx`), bump `CHANGELOG.md`, and re-run the end-to-end test (full install + a single-bundle import + verify 110+/111 viz complete).
