import React, { useState } from 'react'

export default function SubmitScreen({ disease, year, records, issues, setup, history, onSubmit, onBack }) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const errorCount = issues.filter(i => i.some(x => x.level === 'error')).length

  const handleSubmit = async () => {
    setSubmitting(true)
    setResult(null)
    try {
      const r = await onSubmit()
      setResult({ ok: r.failed === 0, ...r })
    } catch (e) {
      setResult({ ok: false, error: e.message })
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div style={styles.header}>
        <h1>Submit to ESPEN</h1>
        <p style={styles.sub}>Submitting {records.length} district records for {disease} {year}.</p>
      </div>

      {/* Pre-flight summary */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Pre-flight Check</div>
        <Row label="Disease"     value={disease} />
        <Row label="Year"        value={year} />
        <Row label="Records"     value={records.length} />
        <Row label="Errors"      value={errorCount} color={errorCount > 0 ? '#da3633' : '#2ea043'} />
        <Row label="ESPEN URL"   value={setup.espenUrl} />
        <Row label="API Token"   value={setup.espenToken ? '● ● ● ● (set)' : '⚠ Not set — submission will fail'} color={setup.espenToken ? '#2ea043' : '#d29922'} />
      </div>

      {result && (
        <div style={result.ok ? styles.alertGreen : styles.alertError}>
          {result.ok
            ? `✓ Successfully submitted ${result.succeeded} records to ESPEN.`
            : result.error
              ? `✗ Submission failed: ${result.error}`
              : `✗ ${result.failed} records failed. ${result.succeeded} succeeded.`
          }
        </div>
      )}

      <div style={styles.btnRow}>
        <button style={styles.btnSecondary} onClick={onBack} disabled={submitting}>← Back</button>
        <button
          style={{ ...styles.btnGreen, opacity: submitting || errorCount > 0 ? .5 : 1 }}
          onClick={handleSubmit}
          disabled={submitting || errorCount > 0}
        >
          {submitting ? 'Submitting…' : `Submit ${records.length} Records to ESPEN`}
        </button>
      </div>

      {/* Submission history */}
      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={styles.h2}>Submission History</h2>
          {history.map(entry => (
            <div key={entry.id} style={styles.historyRow}>
              <span style={styles.mono}>{entry.disease}</span>
              <span style={styles.mono}>{entry.year}</span>
              <span style={{ color: entry.status === 'success' ? '#2ea043' : entry.status === 'partial' ? '#d29922' : '#da3633' }}>
                {entry.status}
              </span>
              <span style={styles.mono}>{entry.records} records</span>
              <span style={{ color: '#7d8590', fontSize: 11 }}>{new Date(entry.submittedAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, color: color ?? '#e6edf3' }}>{value}</span>
    </div>
  )
}

const styles = {
  header:      { marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #30363d' },
  sub:         { color: '#7d8590', fontSize: 13, marginTop: 4 },
  h2:          { fontSize: 15, fontWeight: 600, marginBottom: 12 },
  card:        { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 20, marginBottom: 16 },
  cardTitle:   { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7d8590', fontFamily: 'monospace', marginBottom: 14 },
  row:         { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(48,54,61,.4)', fontSize: 13 },
  rowLabel:    { color: '#7d8590' },
  rowValue:    { fontFamily: 'monospace', fontSize: 12 },
  alertGreen:  { background: '#0d2e17', border: '1px solid rgba(46,160,67,.4)', color: '#2ea043', padding: '11px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  alertError:  { background: '#2d0f0e', border: '1px solid rgba(218,54,51,.4)', color: '#da3633', padding: '11px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  btnRow:      { display: 'flex', gap: 10, marginTop: 8 },
  btnSecondary:{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  btnGreen:    { background: '#2ea043', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  historyRow:  { display: 'flex', gap: 20, alignItems: 'center', padding: '10px 12px', border: '1px solid #30363d', borderRadius: 6, marginBottom: 8, background: '#161b22', fontSize: 12 },
  mono:        { fontFamily: 'monospace' },
}
