import React, { useState, useMemo } from 'react'
import { useSetup }     from './hooks/useSetup.js'
import { useHistory }   from './hooks/useHistory.js'
import { useAnalytics } from './hooks/useAnalytics.js'
import { transform }    from './engine/transform.js'
import { validate }     from './engine/validate.js'
import { ORG_UNITS }    from './constants/orgUnits.js'
import { DISEASES, ACTIVE_DISEASES } from './constants/diseases.js'
import Nav              from './components/Nav.jsx'
import SetupScreen      from './screens/Setup/index.jsx'
import ReviewScreen     from './screens/Review/index.jsx'
import ValidateScreen   from './screens/Validate/index.jsx'
import SubmitScreen     from './screens/Submit/index.jsx'

export default function App() {
  const [screen, setScreen] = useState('setup')  // 'setup' | 'review' | 'validate' | 'submit'
  const [year, setYear]     = useState(new Date().getFullYear() - 1)
  const [disease, setDisease] = useState('LF')

  const { setup, setSetup, save: saveSetup, loading: setupLoading, saving: setupSaving } = useSetup()
  const { history, addEntry } = useHistory()
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalytics(year)

  // ── Derive all records + validation in one pass ──────────────────────────
  // Memoised so it only recalculates when source data changes
  const { records, issues } = useMemo(() => {
    if (!analyticsData[disease]) return { records: [], issues: [] }

    const recs = ORG_UNITS.map(ou =>
      transform(ou, disease, year, analyticsData[disease], setup)
    ).filter(Boolean)

    const iss = recs.map(rec => validate(rec, disease))

    return { records: recs, issues: iss }
  }, [analyticsData, disease, year, setup])

  // ── ESPEN submission ──────────────────────────────────────────────────────
  const submitToEspen = async () => {
    const cfg = DISEASES[disease]
    const url = `${setup.espenUrl}${cfg.espenEndpoint}`

    const results = await Promise.allSettled(
      records.map(rec =>
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Auth header will be added once CHAI/ESPEN confirm token format
            // 'Authorization': `Bearer ${setup.espenToken}`,
          },
          body: JSON.stringify(rec),
        })
      )
    )

    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.ok).length
    const failed    = results.length - succeeded

    await addEntry({
      disease,
      year,
      records: records.length,
      succeeded,
      failed,
      status: failed === 0 ? 'success' : succeeded === 0 ? 'error' : 'partial',
    })

    return { succeeded, failed }
  }

  if (setupLoading) return <div style={styles.loading}>Loading setup…</div>

  return (
    <div style={styles.layout}>
      <Nav
        screen={screen}
        setScreen={setScreen}
        setup={setup}
        analyticsLoading={analyticsLoading}
      />
      <main style={styles.main}>
        {screen === 'setup' && (
          <SetupScreen
            setup={setup}
            setSetup={setSetup}
            saveSetup={saveSetup}
            saving={setupSaving}
            onComplete={() => setScreen('review')}
          />
        )}
        {screen === 'review' && (
          <ReviewScreen
            disease={disease}
            setDisease={setDisease}
            year={year}
            setYear={setYear}
            records={records}
            issues={issues}
            loading={analyticsLoading}
            error={analyticsError}
            onNext={() => setScreen('validate')}
          />
        )}
        {screen === 'validate' && (
          <ValidateScreen
            disease={disease}
            year={year}
            records={records}
            issues={issues}
            onBack={() => setScreen('review')}
            onNext={() => setScreen('submit')}
          />
        )}
        {screen === 'submit' && (
          <SubmitScreen
            disease={disease}
            year={year}
            records={records}
            issues={issues}
            setup={setup}
            history={history}
            onSubmit={submitToEspen}
            onBack={() => setScreen('validate')}
          />
        )}
      </main>
    </div>
  )
}

const styles = {
  layout:  { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#0d1117', color: '#e6edf3' },
  main:    { flex: 1, padding: '28px 32px', maxWidth: 1080, overflowY: 'auto' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7d8590' },
}
