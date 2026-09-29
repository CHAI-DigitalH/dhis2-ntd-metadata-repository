import { useState, useEffect } from 'react'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { ORG_UNITS } from '../constants/orgUnits.js'

const NAMESPACE = 'espen-connector'
const KEY       = 'setup'

// Default setup — used on first run before anything is saved
function defaultSetup() {
  const crosswalk = {}
  const baselines = {}
  ORG_UNITS.forEach(ou => {
    crosswalk[ou.id] = { admin1Id: '', admin2Id: '', iuId: '', iuCode: '' }
    baselines[ou.id] = { LF: 0, Oncho: 0, SCH: 0, STH: 0 }
  })
  return {
    espenUrl:     'https://espen.afro.who.int/api/v1',
    espenCountry: 'SLE',
    baselineYear: 2023,
    crosswalk,
    baselines,
  }
}

// dataStore queries/mutations
const query = {
  setup: {
    resource: `dataStore/${NAMESPACE}/${KEY}`,
  },
}

const createMutation = {
  resource: `dataStore/${NAMESPACE}/${KEY}`,
  type: 'create',
  data: ({ value }) => value,
}

const updateMutation = {
  resource: `dataStore/${NAMESPACE}/${KEY}`,
  type: 'update',
  data: ({ value }) => value,
}

// ─────────────────────────────────────────────────────────────────────────────
// useSetup()
//
// Returns:
//   setup        — current setup object (defaults if not yet saved)
//   setSetup     — update local state (does not persist until save() called)
//   save()       — persist to dataStore
//   loading      — true while fetching from dataStore
//   saving       — true while writing to dataStore
//   error        — fetch error if any
// ─────────────────────────────────────────────────────────────────────────────
export function useSetup() {
  const [setup, setSetup]   = useState(null)
  const [exists, setExists] = useState(false)

  const { loading, error, data } = useDataQuery(query, {
    onComplete: (d) => {
      setSetup(d.setup ?? defaultSetup())
      setExists(true)
    },
    onError: (e) => {
      // 404 = key doesn't exist yet — use defaults
      if (e?.details?.httpStatus === 'Not Found' || e?.message?.includes('404')) {
        setSetup(defaultSetup())
        setExists(false)
      }
    },
  })

  const [runCreate, { loading: creating }] = useDataMutation(createMutation)
  const [runUpdate, { loading: updating }] = useDataMutation(updateMutation)

  const save = async (overrideSetup) => {
    const value = overrideSetup ?? setup
    if (exists) {
      await runUpdate({ value })
    } else {
      await runCreate({ value })
      setExists(true)
    }
  }

  return {
    setup:   setup ?? defaultSetup(),
    setSetup,
    save,
    loading,
    saving:  creating || updating,
    error,
  }
}
