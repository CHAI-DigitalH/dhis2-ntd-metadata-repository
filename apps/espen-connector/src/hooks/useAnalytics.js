import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { buildAnalyticsQuery, pivotAnalyticsResponse } from '../engine/analyticsQuery.js'
import { ACTIVE_DISEASES } from '../constants/diseases.js'

function useDiseaseQuery(diseaseKey, year) {
  const staticQuery = useMemo(
    () => buildAnalyticsQuery(diseaseKey),
    [diseaseKey]
  )

  const { data, loading, error, refetch } = useDataQuery(
    staticQuery ?? { analytics: { resource: 'analytics', params: {} } },
    { lazy: !staticQuery, variables: { year: String(year) } }
  )

  const pivoted = useMemo(() => {
    if (!data?.analytics) return null
    return pivotAnalyticsResponse(data.analytics, diseaseKey)
  }, [data, diseaseKey])

  return { data: pivoted, loading, error, refetch }
}

export function useAnalytics(year) {
  const lf    = useDiseaseQuery('LF',    year)
  const oncho = useDiseaseQuery('Oncho', year)
  const sch   = useDiseaseQuery('SCH',   year)
  const sth   = useDiseaseQuery('STH',   year)

  const results = { LF: lf, Oncho: oncho, SCH: sch, STH: sth }

  const loading = ACTIVE_DISEASES.some(d => results[d]?.loading)
  const error   = ACTIVE_DISEASES.map(d => results[d]?.error).find(Boolean) ?? null
  const data    = Object.fromEntries(
    ACTIVE_DISEASES.map(d => [d, results[d]?.data])
  )

  return { data, loading, error }
}
