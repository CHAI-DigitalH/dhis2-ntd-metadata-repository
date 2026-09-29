import React, { useState } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import CredsTab     from './CredsTab.jsx'
import CrosswalkTab from './CrosswalkTab.jsx'
import BaselinesTab from './BaselinesTab.jsx'
import DrugsTab     from './DrugsTab.jsx'

const TABS = [
  { id: 'creds',     label: 'Credentials' },
  { id: 'crosswalk', label: 'IU Crosswalk' },
  { id: 'baselines', label: 'MDA Baselines' },
  { id: 'drugs',     label: 'Drug Codes' },
]

export default function SetupScreen({ setup, setSetup, saveSetup, saving, onComplete }) {
  const [tab, setTab]           = useState('creds')
  const [tabDone, setTabDone]   = useState({})

  const markDone = (tabId) => setTabDone(p => ({ ...p, [tabId]: true }))

  const handleSaveAndNext = async (nextTab) => {
    await saveSetup()
    markDone(tab)
    if (nextTab) setTab(nextTab)
  }

  const handleComplete = async () => {
    await saveSetup()
    onComplete()
  }

  return (
    <div>
      <div style={styles.header}>
        <h1>Setup</h1>
        <p style={styles.sub}>One-time configuration. Credentials, IU crosswalk, cumulative MDA baselines, and drug codes are reused for every submission.</p>
      </div>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}), ...(tabDone[t.id] ? styles.tabDone : {}) }}
            onClick={() => setTab(t.id)}
          >
            {tabDone[t.id] ? '✓ ' : ''}{t.label}
          </button>
        ))}
      </div>

      {tab === 'creds'     && <CredsTab     setup={setup} setSetup={setSetup} onNext={() => handleSaveAndNext('crosswalk')} saving={saving} />}
      {tab === 'crosswalk' && <CrosswalkTab setup={setup} setSetup={setSetup} onNext={() => handleSaveAndNext('baselines')} saving={saving} />}
      {tab === 'baselines' && <BaselinesTab setup={setup} setSetup={setSetup} onNext={() => handleSaveAndNext('drugs')}     saving={saving} />}
      {tab === 'drugs'     && <DrugsTab     setup={setup} setSetup={setSetup} onComplete={handleComplete}                   saving={saving} />}
    </div>
  )
}

const styles = {
  header:    { marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #30363d' },
  sub:       { color: '#7d8590', fontSize: 13, marginTop: 4 },
  tabBar:    { display: 'flex', borderBottom: '1px solid #30363d', marginBottom: 20 },
  tab:       { padding: '8px 18px', background: 'none', border: 'none', color: '#7d8590', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, fontSize: 13, fontFamily: 'sans-serif' },
  tabActive: { color: '#e6edf3', borderBottomColor: '#388bfd' },
  tabDone:   { color: '#2ea043' },
}
