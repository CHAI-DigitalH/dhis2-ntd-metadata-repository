import React, { useState } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

// Test DHIS2 connection by fetching /me
const meQuery = { me: { resource: 'me', params: { fields: 'displayName,username' } } }

export default function CredsTab({ setup, setSetup, onNext, saving }) {
  const [dhis2Status, setDhis2Status] = useState(null)  // null | 'ok' | 'error'
  const [espenStatus, setEspenStatus] = useState(null)
  const [testing, setTesting]         = useState(false)

  const { refetch: fetchMe } = useDataQuery(meQuery, {
    lazy: true,
    onComplete: (d) => {
      setDhis2Status({ ok: true, msg: `Connected as ${d.me.displayName} (${d.me.username})` })
      setTesting(false)
    },
    onError: (e) => {
      setDhis2Status({ ok: false, msg: `Connection failed: ${e.message}` })
      setTesting(false)
    },
  })

  const testDHIS2 = () => { setTesting(true); fetchMe() }

  const testESPEN = async () => {
    setTesting(true)
    try {
      // ESPEN ping endpoint — confirm exact URL with WHO AFRO when API access granted
      const res = await fetch(`${setup.espenUrl}/ping`, {
        headers: setup.espenToken ? { Authorization: `Bearer ${setup.espenToken}` } : {},
      })
      setEspenStatus({ ok: res.ok, msg: res.ok ? 'Connected to ESPEN API' : `HTTP ${res.status}` })
    } catch (e) {
      setEspenStatus({ ok: false, msg: `Could not reach ESPEN: ${e.message}` })
    }
    setTesting(false)
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>DHIS2 Connection</div>
        <p style={styles.help}>
          The app reads from whichever DHIS2 instance it is installed on.
          Authentication is handled automatically by the DHIS2 app shell — no credentials needed here.
        </p>
        <button style={styles.btnSecondary} onClick={testDHIS2} disabled={testing}>
          {testing ? 'Testing…' : 'Test DHIS2 Connection'}
        </button>
        {dhis2Status && (
          <div style={{ ...styles.status, color: dhis2Status.ok ? '#2ea043' : '#da3633' }}>
            {dhis2Status.ok ? '✓' : '✗'} {dhis2Status.msg}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>ESPEN API</div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>ESPEN Base URL</label>
            <input
              style={styles.input}
              value={setup.espenUrl}
              onChange={e => setSetup(p => ({ ...p, espenUrl: e.target.value }))}
              placeholder="https://espen.afro.who.int/api/v1"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Country Code</label>
            <input
              style={styles.input}
              value={setup.espenCountry}
              onChange={e => setSetup(p => ({ ...p, espenCountry: e.target.value }))}
              placeholder="SLE"
            />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>API Token <span style={{ color: '#7d8590', fontWeight: 400 }}>(once issued by WHO AFRO)</span></label>
          <input
            style={styles.input}
            type="password"
            value={setup.espenToken ?? ''}
            onChange={e => setSetup(p => ({ ...p, espenToken: e.target.value }))}
            placeholder="Bearer token — leave blank until access is granted"
          />
        </div>
        <button style={styles.btnSecondary} onClick={testESPEN} disabled={testing || !setup.espenUrl}>
          {testing ? 'Testing…' : 'Test ESPEN Connection'}
        </button>
        {espenStatus && (
          <div style={{ ...styles.status, color: espenStatus.ok ? '#2ea043' : '#da3633' }}>
            {espenStatus.ok ? '✓' : '✗'} {espenStatus.msg}
          </div>
        )}
      </div>

      <button style={styles.btnPrimary} onClick={onNext} disabled={saving}>
        {saving ? 'Saving…' : 'Save & Continue →'}
      </button>
    </div>
  )
}

const styles = {
  card:        { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 20, marginBottom: 16 },
  cardTitle:   { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7d8590', fontFamily: 'monospace', marginBottom: 12 },
  help:        { fontSize: 13, color: '#7d8590', marginBottom: 12 },
  formRow:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 },
  formGroup:   { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 },
  label:       { fontSize: 12, color: '#7d8590', fontWeight: 500 },
  input:       { background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%' },
  status:      { marginTop: 8, fontSize: 13 },
  btnPrimary:  { background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  btnSecondary:{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
}
