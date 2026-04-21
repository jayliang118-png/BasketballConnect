'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'
import type { Round } from '@/types/fixture'

interface ApiDataOptions {
  readonly pollingInterval?: number | null
  readonly teamIds?: number[]
  readonly ignoreStatuses?: number[]
}

export function useFixtures(
  competitionId: string | number | null,
  divisionId: number | null,
  options?: ApiDataOptions,
): UseApiDataResult<readonly Round[]> {
  const { pollingInterval, teamIds, ignoreStatuses } = options ?? {}

  const fetcher = useMemo(
    () =>
      competitionId && divisionId
        ? async () => {
            const { fetchFixtures } = await import('@/services/fixture.service')
            return fetchFixtures(competitionId, divisionId, teamIds, ignoreStatuses) as Promise<readonly Round[]>
          }
        : null,
    [competitionId, divisionId, teamIds, ignoreStatuses]
  )

  return useApiData(fetcher, [competitionId, divisionId, teamIds, ignoreStatuses], { pollingInterval })
}
