import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import { DISEASES, ACTIVE_DISEASES } from '../../constants/diseases.js'

const systemInfoQuery = {
  info: { resource: 'system/info' }
}

export default function ReviewScreen({ disease, setDisease, year, setYear, records, issues, loading, error, onNext }) {
  const { data: sysData } = useDataQuery(systemInfoQuery)

  const lastAnalytics = sysData?.info?.lastAnalyticsTableSuccess
  const analyticsAge  = lastAnalytics ? getAge(lastAnalytics) : null

  const errorCount = issues.filter(i => i.some(x => x.level === 'error')).length
  const warnCount  = issues.filter(i => i.some(x => x.level === 'warn')).length

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1>Review Data</h1>
            <p style={styles.sub}>Confirm DHIS2 data pulled correctly before validation.</p>
          </div>
          {analyticsAge && (
            <div style={{ ...styles.analyticsChip, ...(analyticsAge.stale ? styles.analyticsChipStale : {}) }}>
              <span style={styles.analyticsDot}>●</span>
              <span>Analytics last updated <strong>{analyticsAge.label}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Disease</label>
          <select style={styles.select} value={disease} onChange={e => setDisease(e.target.value)}>
            {ACTIVE_DISEASES.map(d => (
              <option key={d} value={d}>{DISEASES[d].label}</option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Reporting Year</label>
          <input
            type="number"
            style={styles.input}
            value={year}
            min={2010}
            max={2030}
            onChange={e => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {loading && <div style={styles.loading}>Fetching data from DHIS2…</div>}
      {error   && <div style={styles.error}>Error fetching data: {error.message}</div>}

      {!loading && !error && records.length > 0 && (
        <>
          <div style={styles.tileRow}>
            <Tile count={records.length} label="Districts"    color="blue" />
            <Tile count={records.filter(r => (r.mda ?? r.pc) === 1).length} label="MDA Delivered" color="green" />
            <Tile count={warnCount}      label="Warnings"     color="amber" />
            <Tile count={errorCount}     label="Errors"       color="red" />
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['District', 'Endemicity', 'Pop Required', 'Pop Treated', 'Cov MDA %', 'MDA', 'cumMDA', 'Drug', 'R1 Month'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => {
                  const hasError = issues[i]?.some(x => x.level === 'error')
                  const hasWarn  = issues[i]?.some(x => x.level === 'warn')
                  return (
                    <tr key={rec.iusName} style={hasError ? styles.rowError : hasWarn ? styles.rowWarn : {}}>
                      <td style={styles.tdName}>{rec.iusName}</td>
                      <td style={styles.td}>{rec.endemicity}</td>
                      <td style={styles.td}>{rec.popReq?.toLocaleString() ?? '—'}</td>
                      <td style={styles.td}>{rec.popTreat?.toLocaleString() ?? '—'}</td>
                      <td style={styles.td}>{rec.covMDA ?? '—'}</td>
                      <td style={styles.td}>{(rec.mda ?? rec.pc) === 1 ? '✓' : '—'}</td>
                      <td style={styles.td}>{rec.cumMda}</td>
                      <td style={styles.td}>{rec.mdaScheme}</td>
                      <td style={styles.td}>{rec.r1Month ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnPrimary} onClick={onNext}>
              Proceed to Validation →
            </button>
          </div>
        </>
      )}

      {!loading && !error && records.length === 0 && (
        <div style={styles.empty}>
          No records generated. Check that analytics data exists for {disease} / {year} in DHIS2.
        </div>
      )}
    </div>
  )
}

// Returns a human-readable age label and a stale flag (>24h = stale)
function getAge(isoString) {
  const updated = new Date(isoString)
  const now     = new Date()
  const diffMs  = now - updated
  const diffH   = diffMs / (1000 * 60 * 60)
  const diffD   = diffH / 24

  let label
  if (diffH < 1)       label = 'less than an hour ago'
  else if (diffH < 24) label = `${Math.floor(diffH)}h ago`
  else if (diffD < 2)  label = 'yesterday'
  else                 label = `${Math.floor(diffD)} days ago`

  return { label, stale: diffH > 24 }
}

function Tile({ count, label, color }) {
  const colors = {
    blue:  { border: '#1f6feb', bg: '#0c2849', text: '#388bfd' },
    green: { border: '#2ea043', bg: '#0d2e17', text: '#2ea043' },
    amber: { border: '#d29922', bg: '#2d2000', text: '#d29922' },
    red:   { border: '#da3633', bg: '#2d0f0e', text: '#da3633' },
  }[color]
  return (
    <div style={{ ...styles.tile, borderColor: colors.border, background: colors.bg }}>
      <div style={{ ...styles.tileCount, color: colors.text }}>{count}</div>
      <div style={styles.tileLabel}>{label}</div>
    </div>
  )
}

const styles = {
  header:             { marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #30363d' },
  headerTop:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  sub:                { color: '#7d8590', fontSize: 13, marginTop: 4 },
  analyticsChip:      { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2ea043', background: '#0d2e17', border: '1px solid rgba(46,160,67,.3)', borderRadius: 20, padding: '5px 12px', whiteSpace: 'nowrap', marginTop: 4 },
  analyticsChipStale: { color: '#d29922', background: '#2d2000', borderColor: 'rgba(210,153,34,.3)' },
  analyticsDot:       { fontSize: 8 },
  controls:           { display: 'flex', gap: 16, marginBottom: 20 },
  formGroup:          { display: 'flex', flexDirection: 'column', gap: 6 },
  label:              { fontSize: 12, color: '#7d8590', fontWeight: 500 },
  select:             { background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13 },
  input:              { background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: 100 },
  loading:            { color: '#7d8590', fontSize: 13, padding: 20 },
  error:              { color: '#da3633', fontSize: 13, padding: 12, background: '#2d0f0e', borderRadius: 6, marginBottom: 16 },
  empty:              { color: '#7d8590', fontSize: 13, padding: 20 },
  tileRow:            { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  tile:               { border: '1px solid', borderRadius: 6, padding: 14, textAlign: 'center' },
  tileCount:          { fontFamily: 'monospace', fontSize: 26, fontWeight: 600, lineHeight: 1, marginBottom: 4 },
  tileLabel:          { fontSize: 10, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '.06em' },
  tableWrap:          { overflowX: 'auto', border: '1px solid #30363d', borderRadius: 6, marginBottom: 16, maxHeight: 400 },
  table:              { width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' },
  th:                 { background: '#21262d', color: '#7d8590', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #30363d', whiteSpace: 'nowrap', position: 'sticky', top: 0 },
  tdName:             { padding: '5px 10px', borderBottom: '1px solid rgba(48,54,61,.5)', color: '#388bfd', whiteSpace: 'nowrap' },
  td:                 { padding: '5px 10px', borderBottom: '1px solid rgba(48,54,61,.5)', whiteSpace: 'nowrap' },
  rowError:           { background: 'rgba(218,54,51,.08)' },
  rowWarn:            { background: 'rgba(210,153,34,.06)' },
  btnRow:             { display: 'flex', gap: 10, marginTop: 16 },
  btnPrimary:         { background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
