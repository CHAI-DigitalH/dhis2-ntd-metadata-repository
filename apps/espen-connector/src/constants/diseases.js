// ─────────────────────────────────────────────────────────────────────────────
// DRUG TRANSLATION
// Source: DHIS2 option set fqyj0mlhMHr (KB4BsFABqgs / xFdWM5vKsJF)
// ─────────────────────────────────────────────────────────────────────────────
export const DRUG_TRANSLATION = {
  1: { label: 'MDA1 (IVM+ALB)',    espen: 'ALB+IVM', disease: 'LF' },
  3: { label: 'MDA3 (IVM)',        espen: 'IVM',     disease: 'Oncho' },
  4: { label: 'T1 (PZQ+ALB/MBD)', espen: 'PZQ+ALB', disease: 'SCH' },
  5: { label: 'T2 (PZQ)',          espen: 'PZQ',     disease: 'SCH' },
  6: { label: 'T3 (ALB/MBD)',      espen: 'ALB',     disease: 'STH' },
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDEMICITY OPTION SETS
// Source: metadata.json option sets ABacRryzWaX / LWDrvmEaUuL / W97GRllBQuW
// ─────────────────────────────────────────────────────────────────────────────
export const ENDEMICITY_OPTS = {
  LF_ONCHO: {
    0:  'Non-endemic',
    1:  'Endemic (under MDA)',
    4:  'Status unknown',
    5:  'Endemic (prevalence unknown)',
    19: 'Endemic (pending impact survey)',
    99: 'Cleared TAS, no longer require PC',
  },
  SCH: {
    0:  'Non-endemic',
    1:  'Low prev <10%',
    2:  'Moderate 10-49% 1/yr',
    3:  'High ≥50% 1/yr',
    4:  'Unknown',
    5:  'Endemic prev unknown',
    11: '<10% 1/2-3yr',
    21: '10-49% 1/yr',
    31: '>50% 1/yr',
    99: '<1% surveillance',
  },
  STH: {
    0:  'Non-endemic',
    1:  'Low <20%',
    2:  'Moderate 20-49% 1/yr',
    3:  'High ≥50% 2/yr',
    4:  'Unknown',
    5:  'Endemic prev unknown',
    11: '2-9% 1/2yr',
    21: '10-19% 1/yr',
    22: '20-49% baseline',
    31: '>50% 3/yr',
    99: '<2% surveillance',
  },
}

export const MONTH_OPTS = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
  5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
  9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
}

// ─────────────────────────────────────────────────────────────────────────────
// AGE-SEX CATEGORY OPTION COMBO UIDs (catCombo J0cswuu7Q3l)
// Used by all treatment and population DEs.
//
// Strategy per LF_Transformation_Rules.xlsx:
//   popPreSAC = sum of PreSAC sex disaggregations
//   popSAC    = sum of SAC sex disaggregations
//   popAdult  = sum of Adult sex disaggregations
//   total     = use HllvX50cXC0 (default/total COC) directly
//
// The analytics API lets us request de.coc dimension items explicitly.
// ─────────────────────────────────────────────────────────────────────────────
export const COC = {
  // Total (default) — used for direct popTreat / popReq totals
  DEFAULT: 'HllvX50cXC0',
  // PreSAC disaggregation (sum for popPreSAC)
  PRESAC_F:   'nlveO95Twbw',
  PRESAC_M:   'QpxakQfy6A8',
  PRESAC_UNK: 'mNXV9NwrhaB',
  PRESAC_TOT: 'fGrqqCV6SV9',   // total PreSAC COC if available
  // SAC disaggregation (sum for popSAC)
  SAC_F:   'dM307212w1X',
  SAC_M:   'J28WZsF6S30',
  SAC_UNK: 'rgMcFrdj8Ha',
  SAC_TOT: 'bdllCaAg4ul',      // total SAC COC
  // Adult disaggregation (sum for popAdult)
  ADULT_F:   'cKke8FSePIX',
  ADULT_M:   'gd2hXMUIHR2',
  ADULT_UNK: 'p2uvQDkKN3h',
  ADULT_TOT: 'Jw3ZcNvE6jz',    // total Adult COC
}

// ─────────────────────────────────────────────────────────────────────────────
// DISEASE CONFIGS — all UIDs confirmed from metadata.json
//
// NOTE on logistics (tabletsReq/Dist/Remain):
//   The full mapping confirms these DEs (pcn-drugs-* / YXm7wIX4rys etc.) are
//   LOCAL_ONLY — not present in ESPEN IU schema. They are NOT submitted to ESPEN
//   but are retained here as optional pull fields for internal review screens.
//   They use catCombo azpCGWiAVdJ (NTD PC Drug), disaggregated by drug type.
//   Drug COC UIDs: ALB=MeT8Ri0Un7p, IVM=CsMFxkhnYcq, PZQ=NM5Pl6pTGNA, MBD=yCHFT92tBeM
//
// NOTE on mdaScheme for LF:
//   Confirmed MISSING_SOURCE in mapping — no DHIS2 DE stores the LF regimen name.
//   Hardcoded 'ALB+IVM' for Sierra Leone LF programme per LF_Transformation_Rules.xlsx.
// ─────────────────────────────────────────────────────────────────────────────
export const DISEASES = {

  LF: {
    label: 'Lymphatic Filariasis',
    abbr: 'LF',
    color: '#388bfd',
    espenEndpoint: '/api/v1/submit/lf',
    endemicitySet: 'LF_ONCHO',
    usesPcFlag: false,
    hasTargetPop: false,
    drugCode: 1,
    effThreshold: 65,

    // ── Confirmed DE UIDs ──────────────────────────────────────────────────
    popReqDE:     'b1UgpNyL1Dw',   // Population requiring PC - LF  (Age-Sex catCombo)
    popTrgDE:     'oZ9K6CP5IlC',   // Population targeted for LF treatment
    endemicityDE: 'iQc8N62EszN',   // Endemicity LF  (option set ABacRryzWaX)
    r1MonthDE:    'wVpMrmrdENa',   // MDA Round 1 Month
    r2MonthDE:    'warRckc3tsT',   // MDA Round 2 Month
    pcImplDE:     'KB4BsFABqgs',   // PC implemented - Round 1  (option set fqyj0mlhMHr)

    // Treatment population — single DE, aggregate all Age-Sex COCs
    // Total pulled via HllvX50cXC0; age groups via sum of sex-disagg COCs on same DE
    popTrtDE: 'MDo91FRtJur',       // Population treated for LF

    // popReq DE also provides age disaggregation for popPreSAC/SAC/Adult
    // (same DE b1UgpNyL1Dw, different COCs per LF_Transformation_Rules.xlsx)
    popAgeDE: 'b1UgpNyL1Dw',

    // mdaScheme: MISSING_SOURCE — hardcoded for SL LF programme
    mdaSchemeOverride: 'ALB+IVM',

    readiness: { exe: 28, arch: 2, warn: 0, missing: 1, total: 31 },
    notes: [
      { level: 'green', msg: '28 fields executable. mdaScheme hardcoded ALB+IVM (MISSING_SOURCE confirmed).' },
      { level: 'blue',  msg: 'cumMda: baseline from connector setup + qualifying rounds. OrgUnit IDs from crosswalk.' },
      { level: 'warn',  msg: 'mdaScheme has no DHIS2 source. Consider adding a dedicated option-set DE to the LF Treatment dataset.' },
    ],
  },

  Oncho: {
    label: 'Onchocerciasis',
    abbr: 'Oncho',
    color: '#3fb950',
    espenEndpoint: '/api/v1/submit/oncho',
    endemicitySet: 'LF_ONCHO',
    usesPcFlag: false,
    hasTargetPop: false,
    drugCode: 3,
    effThreshold: 65,

    popReqDE:     'PQ8giF0T2Ux',   // Population requiring PC - oncho
    popTrgDE:     'Pp3bKCyc0vx',   // Population targeted for oncho treatment
    endemicityDE: 'SO6KWmYVD0s',   // Endemicity Oncho
    r1MonthDE:    'wVpMrmrdENa',
    r2MonthDE:    'warRckc3tsT',
    pcImplDE:     'KB4BsFABqgs',

    // Two separate DEs for R1 and R2 treated — both use Age-Sex catCombo
    popTrtR1DE: 'aHmt1Gjbubg',     // Population treated for Oncho round 1
    popTrtR2DE: 'lnhhqsWCDmQ',     // Population treated for Oncho round 2
    popAgeDE:   'PQ8giF0T2Ux',     // Age disagg from popReq DE

    readiness: { exe: 28, arch: 2, warn: 0, missing: 1, total: 31 },
    notes: [
      { level: 'green', msg: 'popTreat = R1 (aHmt1Gjbubg) + R2 (lnhhqsWCDmQ). Drug code 3 = IVM.' },
      { level: 'blue',  msg: 'cumMda baseline from setup. OrgUnit from crosswalk.' },
      { level: 'warn',  msg: 'R2 often zero for annual IVM programmes — expected and acceptable.' },
    ],
  },

  SCH: {
    label: 'Schistosomiasis',
    abbr: 'SCH',
    color: '#f78166',
    espenEndpoint: '/api/v1/submit/sch',
    endemicitySet: 'SCH',
    usesPcFlag: true,
    hasTargetPop: true,
    drugCode: 5,
    effThreshold: 75,

    popReqDE:     'X6o81cnhhWX',   // Population requiring PC - SCH
    popTrgDE:     'kjsYIjg2Qvc',   // Population targeted for SCH treatment
    targetPopDE:  'dmoPqc69Rml',   // Population Targeted for T2 (SCH target population category)
    endemicityDE: 'HzSxsGkYXKH',  // Endemicity SCH
    r1MonthDE:    'wVpMrmrdENa',
    r2MonthDE:    'warRckc3tsT',
    pcImplDE:     'KB4BsFABqgs',

    popTrtDE: 'BdVa6Im13iq',       // Population treated for SCH
    popAgeDE: 'X6o81cnhhWX',       // Age disagg from popReq DE

    readiness: { exe: 28, arch: 2, warn: 1, missing: 1, total: 32 },
    notes: [
      { level: 'green', msg: 'Uses pc/effPc/pcN (not mda). Effectiveness threshold 75%.' },
      { level: 'blue',  msg: 'cumPc baseline from setup. OrgUnit from crosswalk.' },
      { level: 'warn',  msg: 'targetPop (dmoPqc69Rml): validate consistent DHIS2 entry across all districts.' },
    ],
  },

  STH: {
    label: 'Soil-Transmitted Helminths',
    abbr: 'STH',
    color: '#e3b341',
    espenEndpoint: '/api/v1/submit/sth',
    endemicitySet: 'STH',
    usesPcFlag: true,
    hasTargetPop: true,
    drugCode: 6,
    effThreshold: 75,

    popReqDE:     'q2PnpP4lNs7',   // Population requiring PC - STH
    popTrgDE:     't8WCZwxXfaO',   // Population targeted for STH and SCH treatment
    targetPopDE:  'fiy6WUwGPZp',   // Population Targeted for T3/STH Round 1
    endemicityDE: 'h77trEqTOMH',   // Endemicity STH
    r1MonthDE:    'wVpMrmrdENa',
    r2MonthDE:    'warRckc3tsT',
    pcImplDE:     'KB4BsFABqgs',

    // Two separate DEs for R1 and R2 — both Age-Sex catCombo
    popTrtR1DE: 'GkqUNJFflvt',     // Population treated for STH round 1
    popTrtR2DE: 'BJA5CL61r8I',     // Population treated for STH round 2
    popAgeDE:   'q2PnpP4lNs7',     // Age disagg from popReq DE

    readiness: { exe: 28, arch: 2, warn: 1, missing: 1, total: 32 },
    notes: [
      { level: 'green', msg: 'popTreat = R1 (GkqUNJFflvt) + R2 (BJA5CL61r8I). Drug code 6 = ALB/MBD.' },
      { level: 'blue',  msg: 'cumPc baseline from setup. OrgUnit from crosswalk.' },
      { level: 'warn',  msg: 'popTrg DE (t8WCZwxXfaO) named STH+SCH — programme confirmed STH-only use.' },
    ],
  },

  Loa: {
    label: 'Loa loa',
    abbr: 'Loa',
    color: '#a5d6ff',
    deferred: true,
    espenEndpoint: '/api/v1/submit/loa',
    notes: [{ level: 'red', msg: 'Deferred. No Loa-specific DEs in Sierra Leone DHIS2.' }],
  },

  Trachoma: {
    label: 'Trachoma',
    abbr: 'TF',
    color: '#bc8cff',
    deferred: true,
    espenEndpoint: '/api/v1/submit/trachoma',
    notes: [{ level: 'red', msg: 'Deferred. ESPEN trachoma schema not confirmed.' }],
  },
}

export const ACTIVE_DISEASES = Object.entries(DISEASES)
  .filter(([, cfg]) => !cfg.deferred)
  .map(([key]) => key)
