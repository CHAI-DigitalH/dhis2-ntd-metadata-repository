# ESPEN Connector — integration design &amp; handoff

The **ESPEN Connector** (`apps/espen-connector/`) is a DHIS2 custom app that moves a country's NTD data between its DHIS2 instance and the WHO AFRO **ESPEN** portal, so national teams report to ESPEN from the same system they use day to day.

**Status:** The app and the push workflow are built; the pull workflow is scaffolded. Both are **blocked on API access from WHO AFRO ESPEN** — the integration can't be completed until ESPEN provides credentials, endpoints, and the data schema (see "What's needed", below). The *code* is ready to finish quickly once those arrive.

## What exists

| Part | File(s) | Status |
|---|---|---|
| App shell, 4-step flow (Setup → Review → Validate → Submit) | `src/App.jsx`, `src/screens/*`, `src/components/Nav.jsx` | Built |
| **Push** transform (DHIS2 analytics → ESPEN record) | `src/engine/transform.js` | Built, mappings confirmed against the transformation spreadsheets |
| Validation of records before submit | `src/engine/validate.js` | Built |
| Submit (POST records to ESPEN) | `submitToEspen()` in `src/App.jsx` | Built; auth header one line from live (commented, pending token format) |
| **Pull** (ESPEN → DHIS2 data values) | `src/engine/pullFromEspen.js` | **Skeleton** — reverse transform + import, marked `TODO(ESPEN)` |
| Config (ESPEN URL + token) | `src/screens/Setup/CredsTab.jsx`, stored in DHIS2 dataStore | Built, config-driven |
| Disease config + endpoints | `src/constants/diseases.js` | Assumed endpoints — confirm with ESPEN |

## Push workflow (DHIS2 → ESPEN)

1. **Setup** — enter the ESPEN base URL + token, and the IU ↔ org-unit crosswalk (stored in the DHIS2 dataStore).
2. **Review** — the app pulls DHIS2 analytics for the chosen disease/year and `transform()`s each district into an ESPEN record (population, coverage, drug scheme, round timing, MDA/PC flags). Coverage is always *derived* (treated ÷ targeted), never read from a precomputed indicator.
3. **Validate** — `validate()` flags implausible records before anything leaves DHIS2.
4. **Submit** — `submitToEspen()` POSTs each record to `${espenUrl}${disease.espenEndpoint}`.

## Pull workflow (ESPEN → DHIS2) — skeleton

`pullFromEspen.js` is the return path (reconcile DHIS2 against ESPEN, or seed a new country's DHIS2 from ESPEN history):
1. `fetchEspenRecords(disease, year)` — query ESPEN.
2. `reverseTransform()` — map ESPEN fields back to DHIS2 data element UIDs (via `ESPEN_TO_DHIS2`) and reverse the IU→org-unit crosswalk.
3. `pullFromEspen()` — assemble a `dataValueSets` payload and import it into DHIS2 (dry-run first).

## What's needed from WHO AFRO ESPEN

1. **API access** to ESPEN's submission/query service, with a **test/sandbox** environment.
2. **Authentication** — the method and token/credential format the API expects.
3. **Endpoints** — confirmed base URL, per-disease submission paths, the **query/read** path (for pull), and a health/validation check. The app currently assumes `base + /api/v1/submit/<disease>` and `/ping` — unconfirmed.
4. **Data specification** per disease — required fields, units, and the data dictionary; the **Trachoma** schema in particular, and whether other NTDs (e.g. *Loa loa*) are in scope.
5. **Submission rules** — reporting level (district / IU), periodicity, and how ESPEN validates and acknowledges a submission.
6. **API documentation** and a technical point of contact.

## How to finish it once access is granted

1. **Auth** — set the token format in `CredsTab`, then uncomment the `Authorization: Bearer ${setup.espenToken}` header in `submitToEspen()` (App.jsx) and `fetchEspenRecords()` (pullFromEspen.js).
2. **Endpoints** — set the real paths in `src/constants/diseases.js` (`espenEndpoint`) and the pull query path.
3. **Schemas** — verify `transform.js` output fields against ESPEN's spec; fill `ESPEN_TO_DHIS2` for the pull (reverse the exhaustive mapping spreadsheet).
4. **Test** against the sandbox with `dryRun` before any live submission.
5. **Trachoma / Loa** — add once ESPEN confirms their schemas (currently deferred).
