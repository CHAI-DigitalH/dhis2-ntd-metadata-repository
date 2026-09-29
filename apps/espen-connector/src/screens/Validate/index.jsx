import React from 'react'

export default function ValidateScreen({ disease, year, records, issues, onBack, onNext }) {
  const errorCount = issues.filter(i => i.some(x => x.level === 'error')).length
  const warnCount  = issues.filter(i => i.some(x => x.level === 'warn')).length
  const cleanCount = records.length - errorCount - (warnCount - errorCount > 0 ? warnCount - errorCount : 0)
  const canSubmit  = errorCount === 0

  return (
    <div>
      <div style={styles.header}>
        <h1>Validation — {disease} {year}</h1>
        <p style={styles.sub}>Review all flags before submitting to ESPEN.</p>
      </div>

      <div style={styles.summary}>
        <span style={{ color: '#2ea043' }}>✓ {records.length - errorCount - warnCount} clean</span>
        <span style={{ color: '#d29922' }}>⚠ {warnCount} warnings</span>
        <span style={{ color: '#da3633' }}>✗ {errorCount} errors</span>
      </div>

      {!canSubmit && (
        <div style={styles.alertError}>
          ✗ {errorCount} district(s) have errors that must be resolved in DHIS2 before submission.
        </div>
      )}
      {canSubmit && warnCount > 0 && (
        <div style={styles.alertWarn}>
          ⚠ {warnCount} warning(s). Review carefully — submission is allowed but flag these for follow-up.
        </div>
      )}
      {canSubmit && warnCount === 0 && (
        <div style={styles.alertGreen}>✓ All records passed validation. Ready to submit.</div>
      )}

      {/* Per-district issue list */}
      {records.map((rec, i) => {
        const iss = issues[i] ?? []
        if (iss.length === 0) return null
        return (
          <div key={rec.iusName} style={styles.issueBlock}>
            <div style={styles.issueDistrict}>{rec.iusName}</div>
            {iss.map((issue, j) => (
              <div key={j} style={{ ...styles.issue, color: issue.level === 'error' ? '#da3633' : issue.level === 'warn' ? '#d29922' : '#388bfd' }}>
                {issue.level === 'error' ? '✗' : issue.level === 'warn' ? '⚠' : 'ℹ'} {issue.msg}
              </div>
            ))}
          </div>
        )
      })}

      <div style={styles.btnRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={{ ...styles.btnPrimary, opacity: canSubmit ? 1 : .4 }} onClick={onNext} disabled={!canSubmit}>
          Proceed to Submit →
        </button>
      </div>
    </div>
  )
}

const styles = {
  header:       { marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #30363d' },
  sub:          { color: '#7d8590', fontSize: 13, marginTop: 4 },
  summary:      { display: 'flex', gap: 24, fontSize: 13, marginBottom: 16 },
  alertError:   { background: '#2d0f0e', border: '1px solid rgba(218,54,51,.4)', color: '#da3633', padding: '11px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  alertWarn:    { background: '#2d2000', border: '1px solid rgba(210,153,34,.4)', color: '#d29922', padding: '11px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  alertGreen:   { background: '#0d2e17', border: '1px solid rgba(46,160,67,.4)', color: '#2ea043', padding: '11px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  issueBlock:   { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '12px 16px', marginBottom: 8 },
  issueDistrict:{ fontFamily: 'monospace', fontSize: 12, color: '#388bfd', marginBottom: 6 },
  issue:        { fontSize: 12, marginBottom: 3 },
  btnRow:       { display: 'flex', gap: 10, marginTop: 24 },
  btnPrimary:   { background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  btnSecondary: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
