// ─────────────────────────────────────────────────────────────────────────────
// pullFromEspen — ESPEN → DHIS2 (the reverse of transform.js / the Submit push)
//
// STATUS: skeleton, pending WHO AFRO ESPEN API access. The push workflow (DHIS2 →
// ESPEN) is implemented in App.jsx / engine/transform.js. This module is the
// return path: pull reported figures back from ESPEN into DHIS2 data values —
// useful for reconciling, or for seeding a new country's DHIS2 from ESPEN history.
//
// To finish it you need three things from ESPEN (see docs/handoff/ESPEN.md):
//   1. the read/query endpoint + auth (token format),
//   2. the exact response schema per disease,
//   3. the IU → org-unit crosswalk (already captured in setup.crosswalk, reversed here).
//
// Everything marked TODO(ESPEN) is waiting on one of those.
// ─────────────────────────────────────────────────────────────────────────────
import { DISEASES } from '../constants/diseases.js'

// Reverse of the DHIS2→ESPEN field derivation in transform.js. Maps an ESPEN
// response field to the DHIS2 data element UID it should be written to.
// Fill this per disease once the ESPEN response schema is confirmed; the UIDs are
// the same data elements the dashboards read (see docs/data-dictionary.xlsx).
export const ESPEN_TO_DHIS2 = {
  // LF: {
  //   PopReq:   'b1UgpNyL1Dw',   // Population requiring PC - LF
  //   PopTrg:   'oZ9K6CP5IlC',   // Population targeted for LF treatment
  //   PopTreat: 'MDo91FRtJur',   // Population treated for LF
  //   ...
  // },
  // TODO(ESPEN): complete per disease from NTD_DHIS2_ESPEN_FULL_EXHAUSTIVE_MAPPING.xlsx (reverse direction)
}

/**
 * Fetch ESPEN records for one disease + year.
 * TODO(ESPEN): confirm the query endpoint, params, and auth header.
 */
export async function fetchEspenRecords(disease, year, setup) {
  const cfg = DISEASES[disease]
  if (!cfg) throw new Error(`Unknown disease: ${disease}`)

  // TODO(ESPEN): real query endpoint + params (this mirrors the push endpoint in reverse)
  const url = `${setup.espenUrl}${cfg.espenEndpoint}?year=${year}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      // Enable once ESPEN confirms the token format (same token as the push):
      // Authorization: `Bearer ${setup.espenToken}`,
    },
  })
  if (!res.ok) throw new Error(`ESPEN query failed: ${res.status}`)
  return res.json() // TODO(ESPEN): shape = array of IU-level records; confirm envelope
}

/**
 * Reverse-map one ESPEN record to DHIS2 data values.
 * Returns [{ dataElement, orgUnit, period, value }], ready for /api/dataValueSets.
 */
export function reverseTransform(espenRecord, disease, year, setup) {
  const map = ESPEN_TO_DHIS2[disease] || {}
  // Reverse the crosswalk: ESPEN IU id -> DHIS2 org unit id
  const iuToOu = Object.entries(setup.crosswalk || {}).reduce((acc, [ouId, xw]) => {
    if (xw.iuId) acc[xw.iuId] = ouId
    return acc
  }, {})
  const orgUnit = iuToOu[espenRecord.IUID ?? espenRecord.iuId] // TODO(ESPEN): confirm IU id field name
  if (!orgUnit) return []

  const period = String(year)
  return Object.entries(map)
    .filter(([espenField]) => espenRecord[espenField] != null)
    .map(([espenField, dataElement]) => ({
      dataElement,
      orgUnit,
      period,
      value: String(espenRecord[espenField]),
    }))
}

/**
 * Orchestrate the pull: ESPEN query -> reverse-map -> DHIS2 dataValueSets import.
 * `dhis2Post` is the app's DHIS2 data engine mutation (so this stays testable).
 */
export async function pullFromEspen({ disease, year, setup, dhis2Post, dryRun = true }) {
  const records = await fetchEspenRecords(disease, year, setup)
  const dataValues = records.flatMap(r => reverseTransform(r, disease, year, setup))
  if (!dataValues.length) return { imported: 0, dataValues: [] }

  const result = await dhis2Post({
    resource: 'dataValueSets',
    params: { importStrategy: 'CREATE_AND_UPDATE', dryRun },
    data: { dataValues },
  })
  return { imported: dataValues.length, result, dataValues }
}
