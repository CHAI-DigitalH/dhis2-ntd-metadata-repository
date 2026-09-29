import React from 'react'

const STEPS = [
  { id: 'setup',    label: 'Setup',      num: '⚙' },
  { id: 'review',   label: 'Review Data', num: '1' },
  { id: 'validate', label: 'Validate',   num: '2' },
  { id: 'submit',   label: 'Submit',     num: '3' },
]

export default function Nav({ screen, setScreen, setup, analyticsLoading }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <div style={styles.logo}>ESPEN Connector</div>
        <div style={styles.subtitle}>Sierra Leone · NTD</div>
      </div>

      <div style={styles.steps}>
        {STEPS.map(step => (
          <div
            key={step.id}
            style={{
              ...styles.step,
              ...(screen === step.id ? styles.stepActive : {}),
            }}
            onClick={() => setScreen(step.id)}
          >
            <div style={{
              ...styles.stepNum,
              ...(screen === step.id ? styles.stepNumActive : {}),
            }}>
              {step.num}
            </div>
            {step.label}
            {step.id === 'review' && analyticsLoading && (
              <span style={styles.loading}>●</span>
            )}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <div>
          <span style={{ ...styles.dot, background: setup.espenUrl ? '#2ea043' : '#d29922' }} />
          ESPEN: {setup.espenUrl ? 'Configured' : 'Not set'}
        </div>
        <div style={{ marginTop: 4, color: '#7d8590' }}>v1.0.0</div>
      </div>
    </nav>
  )
}

const styles = {
  nav:         { width: 220, background: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  brand:       { padding: '18px 16px 14px', borderBottom: '1px solid #30363d' },
  logo:        { fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#009edb', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 },
  subtitle:    { fontSize: 11, color: '#7d8590', fontWeight: 300 },
  steps:       { padding: '8px 0', flex: 1 },
  step:        { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer', borderLeft: '3px solid transparent', fontSize: 13, color: '#7d8590', userSelect: 'none', transition: 'all .15s ease' },
  stepActive:  { borderLeftColor: '#388bfd', color: '#e6edf3', background: 'rgba(56,139,253,.08)' },
  stepNum:     { width: 22, height: 22, borderRadius: '50%', background: '#21262d', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 10, fontWeight: 600, flexShrink: 0 },
  stepNumActive:{ background: '#1f6feb', borderColor: '#1f6feb', color: '#fff' },
  loading:     { marginLeft: 'auto', color: '#d29922', fontSize: 10, animation: 'pulse 1s infinite' },
  footer:      { padding: '10px 16px', borderTop: '1px solid #30363d', fontSize: 11, color: '#7d8590' },
  dot:         { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', marginRight: 4 },
}
