import { DISEASES } from '../constants/diseases.js'

// ─────────────────────────────────────────────────────────────────────────────
// validate(rec, diseaseKey)
//
// Returns array of { level: 'error'|'warn'|'info', msg: string }
// Empty array = record is clean and ready to submit.
// ─────────────────────────────────────────────────────────────────────────────
export function validate(rec, diseaseKey) {
  const issues = []
  const cfg = DISEASES[diseaseKey]
  if (!rec) return [{ level: 'error', msg: 'Transform returned null' }]

  // Crosswalk
  if (String(rec.admin1Id) === 'SETUP_REQUIRED')
    issues.push({ level: 'error', msg: 'OrgUnit crosswalk not set — admin1Id/admin2Id/iuId/iuCode missing from setup' })

  // Coverage sanity
  if (rec.covMDA !== null && rec.covMDA > 150)
    issues.push({ level: 'error', msg: `covMDA ${rec.covMDA}% > 150 — likely data error` })
  if (rec.popTreat > rec.popTrg && rec.popTrg > 0)
    issues.push({ level: 'warn', msg: `popTreat (${rec.popTreat.toLocaleString()}) > popTrg (${rec.popTrg.toLocaleString()}) — possible over-reporting` })

  // popTot reconciliation
  const reconstructed = rec.popPreSAC + rec.popSAC + rec.popAdult
  if (reconstructed > 0 && Math.abs(reconstructed - rec.popTot) / rec.popTot > 0.01)
    issues.push({ level: 'warn', msg: `popTot mismatch: components sum to ${reconstructed.toLocaleString()}, popTot=${rec.popTot.toLocaleString()}` })

  // drugDistStatus consistency
  if (rec.drugDistStatus === 1 && rec.popTreat === 0)
    issues.push({ level: 'error', msg: 'drugDistStatus=1 but popTreat=0 — inconsistent' })
  if (rec.drugDistStatus === 0 && rec.popTreat > 0)
    issues.push({ level: 'warn', msg: 'popTreat > 0 but no MDA month recorded — month field may be missing' })

  // targetPop
  if (cfg?.hasTargetPop && (!rec.targetPop || rec.targetPop === 'MISSING'))
    issues.push({ level: 'warn', msg: 'targetPop not entered in DHIS2' })

  return issues
}

// Convenience: highest severity across all issues for a record set
export function recordSetStatus(allIssues) {
  const flat = allIssues.flat()
  if (flat.some(i => i.level === 'error')) return 'error'
  if (flat.some(i => i.level === 'warn'))  return 'warn'
  return 'ok'
}
