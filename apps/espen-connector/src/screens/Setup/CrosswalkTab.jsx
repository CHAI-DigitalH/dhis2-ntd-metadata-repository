import React, { useRef } from 'react'
import { ORG_UNITS } from '../../constants/orgUnits.js'

export default function CrosswalkTab({ setup, setSetup, onNext, saving }) {
  const fileRef = useRef()

  const update = (ouId, field, value) => {
    setSetup(p => ({
      ...p,
      crosswalk: {
        ...p.crosswalk,
        [ouId]: { ...p.crosswalk[ouId], [field]: value },
      },
    }))
  }

  const exportCSV = () => {
    let csv = 'district,dhis2Id,admin1Id,admin2Id,iuId,iuCode\n'
    ORG_UNITS.forEach(ou => {
      const xw = setup.crosswalk[ou.id] ?? {}
      csv += `${ou.name},${ou.id},${xw.admin1Id ?? ''},${xw.admin2Id ?? ''},${xw.iuId ?? ''},${xw.iuCode ?? ''}\n`
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'dhis2_espen_crosswalk.csv'
    a.click()
  }

  const importCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = ev.target.result.trim().split('\n').slice(1)
      const newCrosswalk = { ...setup.crosswalk }
      lines.forEach(line => {
        const [, dhis2Id, admin1Id, admin2Id, iuId, iuCode] = line.split(',')
        if (dhis2Id?.trim()) {
          newCrosswalk[dhis2Id.trim()] = {
            admin1Id: admin1Id?.trim(),
            admin2Id: admin2Id?.trim(),
            iuId:     iuId?.trim(),
            iuCode:   iuCode?.trim(),
          }
        }
      })
      setSetup(p => ({ ...p, crosswalk: newCrosswalk }))
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>District → ESPEN IU Mapping</div>
        <p style={styles.help}>
          For each DHIS2 district enter the corresponding ESPEN numeric IDs.
          Get these from the ESPEN portal → Sierra Leone → IU list.
          This mapping is shared across all diseases and years.
        </p>
        <div style={styles.btnRow}>
          <button style={styles.btnSecondary} onClick={exportCSV}>↓ Export CSV</button>
          <button style={styles.btnSecondary} onClick={() => fileRef.current.click()}>↑ Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importCSV} />
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['District', 'DHIS2 ID', 'ESPEN Admin1 ID', 'ESPEN Admin2 ID', 'ESPEN IU ID', 'IU Code'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORG_UNITS.map(ou => {
                const xw = setup.crosswalk[ou.id] ?? {}
                return (
                  <tr key={ou.id}>
                    <td style={styles.tdName}>{ou.name}</td>
                    <td style={styles.tdCode}><code style={styles.code}>{ou.id}</code></td>
                    {['admin1Id', 'admin2Id', 'iuId', 'iuCode'].map(f => (
                      <td key={f} style={styles.td}>
                        <input
                          style={styles.input}
                          value={xw[f] ?? ''}
                          placeholder={f === 'iuCode' ? 'e.g. SLE010101' : 'numeric ID'}
                          onChange={e => update(ou.id, f, e.target.value)}
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
  help:       { fontSize: 13, color: '#7d8590', marginBottom: 12 },
  btnRow:     { display: 'flex', gap: 8, marginBottom: 16 },
  tableWrap:  { overflowX: 'auto', border: '1px solid #30363d', borderRadius: 6, maxHeight: 420 },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th:         { background: '#21262d', color: '#7d8590', textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid #30363d', fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', position: 'sticky', top: 0 },
  tdName:     { padding: '4px 10px', borderBottom: '1px solid rgba(48,54,61,.5)', fontFamily: 'monospace', fontSize: 11, color: '#388bfd' },
  tdCode:     { padding: '4px 10px', borderBottom: '1px solid rgba(48,54,61,.5)' },
  td:         { padding: '4px 6px', borderBottom: '1px solid rgba(48,54,61,.5)' },
  code:       { fontSize: 10, background: '#21262d', border: '1px solid #30363d', borderRadius: 3, padding: '1px 5px', color: '#388bfd' },
  input:      { background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', width: '100%' },
  btnPrimary: { background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  btnSecondary:{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
