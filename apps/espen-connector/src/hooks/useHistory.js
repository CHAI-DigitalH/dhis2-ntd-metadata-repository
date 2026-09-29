import { useState } from 'react'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'

const NAMESPACE = 'espen-connector'
const KEY       = 'history'

const query = {
  history: { resource: `dataStore/${NAMESPACE}/${KEY}` },
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

export function useHistory() {
  const [history, setHistory] = useState([])
  const [exists, setExists]   = useState(false)

  useDataQuery(query, {
    onComplete: (d) => { setHistory(d.history ?? []); setExists(true) },
    onError:    ()  => { setHistory([]); setExists(false) },
  })

  const [runCreate] = useDataMutation(createMutation)
  const [runUpdate] = useDataMutation(updateMutation)

  const addEntry = async (entry) => {
    const newHistory = [
      { ...entry, id: crypto.randomUUID(), submittedAt: new Date().toISOString() },
      ...history,
    ].slice(0, 100) // cap at 100 entries

    setHistory(newHistory)

    if (exists) {
      await runUpdate({ value: newHistory })
    } else {
      await runCreate({ value: newHistory })
      setExists(true)
    }
  }

  return { history, addEntry }
}
