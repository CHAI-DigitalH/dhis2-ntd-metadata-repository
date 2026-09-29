# ESPEN Connector

DHIS2 application that pulls NTD programme data from a DHIS2 instance and submits it to the WHO AFRO ESPEN portal.

## Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Access to a DHIS2 2.35+ instance (developed against 2.42.1)

## Setup

```bash
# Install dependencies
npm install

# Start development server (connects to DHIS2 at localhost:8080 by default)
npm start

# Or point to your dev instance
REACT_APP_DHIS2_BASE_URL=https://your-dhis2-instance.org npm start

# Build for App Hub upload
npm run build
```

## Before first data pull — fill in PLACEHOLDER UIDs

Open `src/constants/diseases.js` and replace every `PLACEHOLDER_*` UID with the
confirmed data element and category option combo UIDs from your DHIS2 instance metadata.

Specifically:
- `popTrtDEs[].coc` — category option combo UIDs for age-disaggregated treatment (preSAC / SAC / adult)
- `tabletsReqDE`, `tabletsDistDE`, `tabletsRemainDE` — logistics DEs per disease

These are marked with `PLACEHOLDER_` so the analytics query builder skips them
safely until they are confirmed.

## Project structure

```
src/
  constants/
    orgUnits.js     — Sierra Leone district UIDs (confirmed)
    diseases.js     — Disease configs + DE UIDs — EDIT THIS to update data dictionaries
  engine/
    analyticsQuery.js — Builds DHIS2 analytics API queries + pivots responses
    transform.js    — Derives ESPEN fields from DHIS2 data (port from v3 HTML connector)
    validate.js     — Validation rules (port from v3 HTML connector)
  hooks/
    useSetup.js     — Reads/writes setup config from DHIS2 dataStore
    useHistory.js   — Reads/writes submission history from DHIS2 dataStore
    useAnalytics.js — Fetches live analytics data per disease/year
  screens/
    Setup/          — Credentials, crosswalk, baselines, drug codes
    Review/         — Data preview table
    Validate/       — Per-district issue list
    Submit/         — Pre-flight check + submission + history
```

## Updating transform logic (next iterations)

- **Data dictionary changes**: edit `src/constants/diseases.js` — add/remove/change DE UIDs
- **New derivation logic**: edit `src/engine/transform.js` — no other files change
- **Auto-derive baselines**: in `transform.js`, replace the `setup.baselines` lookup
  with a historical analytics query (sum of past years where `mda === 1`)
- **New validation rules**: add to `src/engine/validate.js`

## Deploying to App Hub

1. `npm run build` — creates `build/` directory
2. Zip the `build/` directory
3. Upload to [apps.dhis2.org](https://apps.dhis2.org)

## ESPEN API

The submit screen POSTs each district record as JSON to:
`{espenUrl}/{disease-endpoint}`

Add the API token to setup once WHO AFRO grants access:
`setup.espenToken` → sent as `Authorization: Bearer {token}`
