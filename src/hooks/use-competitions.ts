'use client'

import { useCallback, useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

interface Competition {
  readonly id: number
  readonly uniqueKey: string
  readonly name: string
  readonly [key: string]: unknown
}

export function useCompetitions(organisationUniqueKey: string | null): UseApiDataResult<readonly Competition[]> {
  const fetcher = useMemo(
    () =>
      organisationUniqueKey
        ? async () => {
            const { fetchCompetitions } = await import('@/services/competition.service')
            return fetchCompetitions(organisationUniqueKey) as Promise<readonly Competition[]>
          }
        : null,
    [organisationUniqueKey]
  )

  return useApiData(fetcher, [organisationUniqueKey])
}
