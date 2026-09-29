import { DISEASES, COC } from '../constants/diseases.js'
import { ORG_UNIT_UIDS } from '../constants/orgUnits.js'

// ─────────────────────────────────────────────────────────────────────────────
// buildAnalyticsQuery(diseaseKey)
//
// Builds a @dhis2/app-runtime query that fetches all needed DEs for one disease.
// Year is intentionally omitted here — pass it as a `variables` object to
// useDataQuery so the query object stays stable and app-runtime can refetch
// reactively when the year changes without violating the static-query contract.
//
// Age-disaggregated fields use de.coc notation:
//   b1UgpNyL1Dw.fGrqqCV6SV9  = Population requiring PC LF, PreSAC total
//   b1UgpNyL1Dw.bdllCaAg4ul  = Population requiring PC LF, SAC total
//   b1UgpNyL1Dw.Jw3ZcNvE6jz  = Population requiring PC LF, Adult total
//   b1UgpNyL1Dw.HllvX50cXC0  = Population requiring PC LF, default/all (fallback)
//
// LF treatment (MDo91FRtJur) uses same COC pattern.
// Oncho/STH use separate R1/R2 DEs; age disagg comes from popReq DE.
// ─────────────────────────────────────────────────────────────────────────────
export function buildAnalyticsQuery(diseaseKey) {
  const cfg = DISEASES[diseaseKey]
  if (!cfg || cfg.deferred) return null

  const dxItems = new Set()

  // ── Scalar DEs (default catCombo — no coc needed) ────────────────────────
  ;[
    cfg.endemicityDE,
    cfg.r1MonthDE,
    cfg.r2MonthDE,
    cfg.pcImplDE,
    cfg.targetPopDE,   // undefined for LF/Oncho — filtered below
  ].filter(Boolean).forEach(de => dxItems.add(de))

  // ── Population Required — total + age groups ─────────────────────────────
  // Total (default COC) used as fallback for popReq
  dxItems.add(cfg.popReqDE)
  // Age disaggregation on same DE
  dxItems.add(`${cfg.popAgeDE}.${COC.PRESAC_TOT}`)
  dxItems.add(`${cfg.popAgeDE}.${COC.SAC_TOT}`)
  dxItems.add(`${cfg.popAgeDE}.${COC.ADULT_TOT}`)

  // ── Population Targeted ──────────────────────────────────────────────────
  dxItems.add(cfg.popTrgDE)

  // ── Treatment population ─────────────────────────────────────────────────
  if (cfg.popTrtDE) {
    // LF / SCH: single DE, aggregate all COCs = default COC total
    dxItems.add(cfg.popTrtDE)
  }
  if (cfg.popTrtR1DE) {
    // Oncho / STH: separate R1 and R2 DEs
    dxItems.add(cfg.popTrtR1DE)
  }
  if (cfg.popTrtR2DE) {
    dxItems.add(cfg.popTrtR2DE)
  }

  const dx = [...dxItems].join(';')
  const ou = ORG_UNIT_UIDS.join(';')

  return {
    analytics: {
      resource: 'analytics',
      params: ({ year }) => ({
        dimension: [`dx:${dx}`, `ou:${ou}`, `pe:${year}`],
        displayProperty: 'shortName',
        skipMeta: true,
        paging: false,
      }),
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// pivotAnalyticsResponse(analyticsData, diseaseKey)
//
// Converts flat analytics rows into the shape transform() expects:
// {
//   endemicity:  { ouId: numericValue }
//   popReq:      { ouId: value }
//   popTrg:      { ouId: value }
//   popTreat:    { ouId: value }           ← total treated
//   popPreSAC:   { ouId: value }           ← from popAgeDE + PRESAC_TOT coc
//   popSAC:      { ouId: value }
//   popAdult:    { ouId: value }
//   r1Month:     { ouId: value|null }
//   r2Month:     { ouId: value|null }
//   pcImpl:      { ouId: value }
//   targetPop:   { ouId: value }
// }
// ─────────────────────────────────────────────────────────────────────────────
export function pivotAnalyticsResponse(analyticsData, diseaseKey) {
  const cfg  = DISEASES[diseaseKey]
  const rows = analyticsData?.rows ?? []

  // Build lookup: 'dxDim::ouId' → numeric value
  const lookup = {}
  rows.forEach(([dx, ou, , val]) => {
    lookup[`${dx}::${ou}`] = val !== '' && val != null ? Number(val) : null
  })

  const get = (deDim, ouId) => lookup[`${deDim}::${ouId}`] ?? null

  const result = {
    endemicity: {},
    popReq:     {},
    popTrg:     {},
    popTreat:   {},
    popPreSAC:  {},
    popSAC:     {},
    popAdult:   {},
    r1Month:    {},
    r2Month:    {},
    pcImpl:     {},
    targetPop:  {},
  }

  ORG_UNIT_UIDS.forEach(ouId => {
    result.endemicity[ouId] = get(cfg.endemicityDE, ouId) ?? 0
    result.popReq[ouId]     = get(cfg.popReqDE,     ouId) ?? 0
    result.popTrg[ouId]     = get(cfg.popTrgDE,     ouId) ?? 0
    result.r1Month[ouId]    = get(cfg.r1MonthDE,    ouId)
    result.r2Month[ouId]    = get(cfg.r2MonthDE,    ouId)
    result.pcImpl[ouId]     = get(cfg.pcImplDE,     ouId) ?? 0
    result.targetPop[ouId]  = cfg.targetPopDE ? get(cfg.targetPopDE, ouId) : null

    // ── Age disaggregation from popAgeDE ──────────────────────────────────
    result.popPreSAC[ouId] = get(`${cfg.popAgeDE}.${COC.PRESAC_TOT}`, ouId) ?? 0
    result.popSAC[ouId]    = get(`${cfg.popAgeDE}.${COC.SAC_TOT}`,    ouId) ?? 0
    result.popAdult[ouId]  = get(`${cfg.popAgeDE}.${COC.ADULT_TOT}`,  ouId) ?? 0

    // ── Treatment population ──────────────────────────────────────────────
    if (cfg.popTrtDE) {
      // LF / SCH: single DE total
      result.popTreat[ouId] = get(cfg.popTrtDE, ouId) ?? 0
    } else {
      // Oncho / STH: sum R1 + R2
      const r1 = get(cfg.popTrtR1DE, ouId) ?? 0
      const r2 = get(cfg.popTrtR2DE, ouId) ?? 0
      result.popTreat[ouId] = r1 + r2
    }
  })

  return result
}
