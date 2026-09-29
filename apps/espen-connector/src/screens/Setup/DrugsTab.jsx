import React, { useState } from 'react'
import { DRUG_TRANSLATION } from '../../constants/diseases.js'

export default function DrugsTab({ setup, setSetup, onComplete, saving }) {
  // Local editable copy of drug translations
  const [drugs, setDrugs] = useState({ ...DRUG_TRANSLATION })

  const update = (code, field, value) => {
    setDrugs(p => ({ ...p, [code]: { ...p[code], [field]: value } }))
  }

  // Persist drug overrides into setup so they're saved to dataStore
  const handleComplete = () => {
    setSetup(p => ({ ...p, drugOverrides: drugs }))
    onComplete()
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Drug Code → ESPEN mdaScheme Mapping</div>
        <p style={styles.help}>
          Resolved from the <code style={styles.icode}>PC implemented Rounds</code> option set in DHIS2.
          Edit ESPEN values only if your programme uses non-standard codes.
        </p>

        <table style={styles.table}>
          <thead>
            <tr>
              {['DHIS2 Code', 'DHIS2 Label', 'ESPEN mdaScheme value', 'Disease'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(drugs).map(([code, info]) => (
              <tr key={code}>
                <td style={styles.tdCode}><code style={styles.icode}>{code}</code></td>
                <td style={styles.td}>{info.label}</td>
                <td style={styles.td}>
                  <input
                    style={styles.input}
                    value={info.espen}
                    onChange={e => update(code, 'espen', e.target.value)}
                  />
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: badgeColor(info.disease) }}>
                    {info.disease}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button style={styles.btnGreen} onClick={handleComplete} disabled={saving}>
        {saving ? 'Saving…' : '✓ Finalise Setup'}
      </button>
    </div>
  )
}

const badgeColor = (d) => ({ LF: '#0c2849', Oncho: '#0d2e17', SCH: '#2d0f0e', STH: '#2d2000' }[d] ?? '#21262d')

const styles = {
  card:      { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7d8590', fontFamily: 'monospace', marginBottom: 12 },
  help:      { fontSize: 13, color: '#7d8590', marginBottom: 16 },
  icode:     { fontFamily: 'monospace', fontSize: 11, background: '#21262d', border: '1px solid #30363d', borderRadius: 3, padding: '1px 4px', color: '#388bfd' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th:        { background: '#21262d', color: '#7d8590', textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid #30363d', fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase' },
  tdCode:    { padding: '6px 10px', borderBottom: '1px solid rgba(48,54,61,.5)' },
  td:        { padding: '6px 10px', borderBottom: '1px solid rgba(48,54,61,.5)', color: '#7d8590', fontSize: 12 },
  input:     { background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', maxWidth: 140 },
  badge:     { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: '#e6edf3' },
  btnGreen:  { background: '#2ea043', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
