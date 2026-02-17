'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'
import type { Round } from '@/types/fixture'

export function useFixtures(
  competitionId: number | null,
  divisionId: number | null
): UseApiDataResult<readonly Round[]> {
  const fetcher = useMemo(
    () =>
      competitionId && divisionId
        ? async () => {
            const { fetchFixtures } = await import('@/services/fixture.service')
            return fetchFixtures(competitionId, divisionId) as Promise<readonly Round[]>
          }
        : null,
    [competitionId, divisionId]
  )

  return useApiData(fetcher, [competitionId, divisionId])
}
