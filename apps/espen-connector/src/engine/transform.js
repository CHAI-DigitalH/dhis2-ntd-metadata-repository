import { DISEASES, DRUG_TRANSLATION, ENDEMICITY_OPTS, MONTH_OPTS } from '../constants/diseases.js'

// ─────────────────────────────────────────────────────────────────────────────
// transform(ou, diseaseKey, year, data, setup)
//
// ou:         { id, name } from ORG_UNITS
// diseaseKey: 'LF' | 'Oncho' | 'SCH' | 'STH'
// year:       number e.g. 2024
// data:       pivoted analytics response from pivotAnalyticsResponse()
//             Fields: endemicity, popReq, popTrg, popTreat, popPreSAC,
//                     popSAC, popAdult, r1Month, r2Month, pcImpl, targetPop
// setup:      SETUP object from dataStore (crosswalk + baselines)
//
// All field derivations are confirmed against LF_Transformation_Rules.xlsx
// and NTD_DHIS2_ESPEN_FULL_EXHAUSTIVE_MAPPING.xlsx.
// ─────────────────────────────────────────────────────────────────────────────
export function transform(ou, diseaseKey, year, data, setup) {
  const cfg = DISEASES[diseaseKey]
  if (!cfg || !data) return null

  // ── Endemicity ──────────────────────────────────────────────────────────────
  const endId = data.endemicity?.[ou.id] ?? 0
  const opts  = ENDEMICITY_OPTS[cfg.endemicitySet] ?? ENDEMICITY_OPTS.LF_ONCHO

  // ── Population ──────────────────────────────────────────────────────────────
  const popPreSAC = data.popPreSAC?.[ou.id] ?? 0
  const popSAC    = data.popSAC?.[ou.id]    ?? 0
  const popAdult  = data.popAdult?.[ou.id]  ?? 0
  const popTreat  = data.popTreat?.[ou.id]  ?? 0
  const popReq    = data.popReq?.[ou.id]    ?? 0
  const popTrg    = data.popTrg?.[ou.id]    ?? popReq

  // popTot: sum of age components; fallback to popReq if age data absent
  // Per LF_Transformation_Rules.xlsx: popPreSAC + popSAC + popAdult OR fallback popReq
  const ageSum = popPreSAC + popSAC + popAdult
  const popTot = ageSum > 0 ? ageSum : popReq

  // ── Round timing ─────────────────────────────────────────────────────────────
  const r1Month = data.r1Month?.[ou.id] ?? null
  const r2Month = data.r2Month?.[ou.id] ?? null

  // drugDistStatus: popTreat > 0 AND r1Month populated
  const drugDistStatus = (popTreat > 0 && r1Month !== null) ? 1 : 0

  // Number of rounds delivered this year
  const mdaN = (r1Month !== null ? 1 : 0) + (r2Month !== null ? 1 : 0)

  // ── Drug scheme ───────────────────────────────────────────────────────────────
  // LF: MISSING_SOURCE — hardcoded per transformation rules
  // Others: derived from PC implemented option set code
  let mdaScheme
  if (cfg.mdaSchemeOverride) {
    mdaScheme = cfg.mdaSchemeOverride
  } else {
    const pcImplCode = data.pcImpl?.[ou.id] ?? 0
    const drugInfo   = DRUG_TRANSLATION[pcImplCode] ?? null
    mdaScheme = drugInfo
      ? drugInfo.espen
      : (pcImplCode ? `CODE:${pcImplCode}` : 'Not delivered')
  }

  // ── Coverage — always derive; never use precomputed indicators ───────────────
  // Per LF_Transformation_Rules.xlsx:
  //   cov    = popTreat / popTrg * 100  (targeted coverage)
  //   epiCov = popTreat / popReq * 100  (epidemiological coverage)
  const effThreshold = cfg.effThreshold ?? 65
  const covMDA = popTrg > 0 ? +((popTreat / popTrg * 100).toFixed(1)) : null
  const epiCov = popReq > 0 ? +((popTreat / popReq * 100).toFixed(1)) : null

  // ── MDA / PC binary flags ─────────────────────────────────────────────────────
  const mda        = r1Month !== null ? 1 : 0
  const effMda     = covMDA !== null && covMDA >= effThreshold ? 1 : 0
  const effMdaN    = effMda && mdaN > 0 ? mdaN : 0
  const epiMda     = epiCov !== null && epiCov > 0 ? 1 : 0
  const epiEffMda  = epiCov !== null && epiCov >= effThreshold ? 1 : 0
  const epiMdaN    = epiMda ? mdaN : 0
  const epiEffMdaN = epiEffMda ? effMdaN : 0

  // ── cumMda — baseline + current year ─────────────────────────────────────────
  // Baseline = rounds delivered before the reporting year (from dataStore)
  // Auto-derivation from historical DHIS2 data: future iteration
  // (query sum of past years where mda=1, replacing the manual baseline entry)
  const baseline = setup.baselines?.[ou.id]?.[diseaseKey] ?? 0
  const cumMda   = baseline + (mda === 1 ? 1 : 0)

  // ── OrgUnit crosswalk ──────────────────────────────────────────────────────
  const xw = setup.crosswalk?.[ou.id] ?? {}

  // ── Round month labels ────────────────────────────────────────────────────
  const r1Label = r1Month ? `Round 1: ${MONTH_OPTS[r1Month]} ${year}` : null
  const r2Label = r2Month ? `Round 2: ${MONTH_OPTS[r2Month]} ${year}` : null

  const base = {
    // Geography — static for Sierra Leone
    continent: 'Africa', region: 'Western Africa', whoRegion: 'AFRO',
    admin0: 'Sierra Leone', admin0Id: 39, admin0Fip: 'SL', admin0Iso2: 'SL', admin0Iso3: 'SLE',
    // OrgUnit — from crosswalk
    admin1: ou.name,   admin1Id: xw.admin1Id ?? 'SETUP_REQUIRED',
    admin2: ou.name,   admin2Id: xw.admin2Id ?? 'SETUP_REQUIRED',
    admin3Id: 0, iusAdm: 'ADM2', iusName: ou.name,
    iuId:   xw.iuId   ?? 'SETUP_REQUIRED',
    iuCode: xw.iuCode ?? 'SETUP_REQUIRED',
    // Period
    year,
    // Endemicity
    endemicity: opts[endId] ?? 'Status unknown', endemicityId: endId,
    // Population
    popReq, popTrg, popTreat, popTot, popPreSAC, popSAC, popAdult,
    // Coverage
    covMDA, epiCov,
    // Drug
    mdaScheme, drugDistStatus,
    // Round timing
    r1Month: r1Label, r2Month: r2Label,
    // cumMda — audit trail
    cumMda,
    _cumMdaBaseline: baseline,
    _cumMdaThisYear: mda === 1 ? 1 : 0,
  }

  // ── MDA vs PC flag set (disease-specific) ─────────────────────────────────
  if (cfg.usesPcFlag) {
    base.pc = mda; base.effPc = effMda; base.pcN = mdaN; base.effPcN = effMdaN
    base.epiPc = epiMda; base.epiEffPc = epiEffMda; base.epiPcN = epiMdaN; base.epiEffPcN = epiEffMdaN
    if (cfg.hasTargetPop) base.targetPop = data.targetPop?.[ou.id] ?? 'MISSING'
  } else {
    base.mda = mda; base.effMda = effMda; base.mdaN = mdaN; base.effMdaN = effMdaN
    base.epiMda = epiMda; base.epiEffMda = epiEffMda; base.epiMdaN = epiMdaN; base.epiEffMdaN = epiEffMdaN
  }

  return base
}
