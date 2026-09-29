import React from 'react'
import { ORG_UNITS } from '../../constants/orgUnits.js'

const DISEASE_COLS = ['LF', 'Oncho', 'SCH', 'STH']

export default function BaselinesTab({ setup, setSetup, onNext, saving }) {
  const update = (ouId, disease, value) => {
    setSetup(p => ({
      ...p,
      baselines: {
        ...p.baselines,
        [ouId]: { ...p.baselines[ouId], [disease]: Number(value) },
      },
    }))
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Cumulative MDA Baselines</div>
        <p style={styles.help}>
          Enter the number of MDA rounds completed in each district <em>before</em> the current reporting year.
          The connector adds 1 for each qualifying round in the reporting year to derive <code style={styles.icode}>cumMda</code>.
        </p>
        <p style={styles.help}>
          Baseline year: <strong style={{ color: '#e6edf3' }}>{setup.baselineYear}</strong>.
          Auto-derivation from historical DHIS2 data is planned for a future iteration.
        </p>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>District</th>
                {DISEASE_COLS.map(d => <th key={d} style={styles.th}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {ORG_UNITS.map(ou => {
                const b = setup.baselines[ou.id] ?? {}
                return (
                  <tr key={ou.id}>
                    <td style={styles.tdName}>{ou.name}</td>
                    {DISEASE_COLS.map(d => (
                      <td key={d} style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          style={styles.input}
                          value={b[d] ?? 0}
                          onChange={e => update(ou.id, d, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button style={styles.btnPrimary} onClick={onNext} disabled={saving}>
        {saving ? 'Saving…' : 'Save & Continue →'}
      </button>
    </div>
  )
}

const styles = {
  card:       { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 20, marginBottom: 16 },
  cardTitle:  { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7d8590', fontFamily: 'monospace', marginBottom: 12 },
  help:       { fontSize: 13, color: '#7d8590', marginBottom: 8 },
  icode:      { fontFamily: 'monospace', fontSize: 11, background: '#21262d', border: '1px solid #30363d', borderRadius: 3, padding: '1px 4px', color: '#388bfd' },
  tableWrap:  { overflowX: 'auto', border: '1px solid #30363d', borderRadius: 6, maxHeight: 420 },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th:         { background: '#21262d', color: '#7d8590', textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid #30363d', fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', position: 'sticky', top: 0 },
  tdName:     { padding: '4px 10px', borderBottom: '1px solid rgba(48,54,61,.5)', fontFamily: 'monospace', fontSize: 11, color: '#388bfd' },
  td:         { padding: '4px 6px', borderBottom: '1px solid rgba(48,54,61,.5)', textAlign: 'center' },
  input:      { background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', padding: '5px 6px', fontSize: 11, fontFamily: 'monospace', width: 70, textAlign: 'center' },
  btnPrimary: { background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
