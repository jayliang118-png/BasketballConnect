'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

export function useStats(
  statType: string,
  divisionId: number | null,
  offset: number = 0,
  limit: number = 10
): UseApiDataResult<readonly Record<string, unknown>[]> {
  const fetcher = useMemo(
    () =>
      divisionId
        ? async () => {
            const { fetchScoringStatsByGrade } = await import('@/services/stats.service')
            return fetchScoringStatsByGrade(statType, divisionId, offset, limit) as Promise<readonly Record<string, unknown>[]>
          }
        : null,
    [statType, divisionId, offset, limit]
  )

  return useApiData(fetcher, [statType, divisionId, offset, limit])
}
