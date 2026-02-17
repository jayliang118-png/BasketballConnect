'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

interface Division {
  readonly id: number
  readonly name: string
}

export function useDivisions(competitionKey: string | null): UseApiDataResult<readonly Division[]> {
  const fetcher = useMemo(
    () =>
      competitionKey
        ? async () => {
            const { fetchDivisions } = await import('@/services/division.service')
            return fetchDivisions(competitionKey) as Promise<readonly Division[]>
          }
        : null,
    [competitionKey]
  )

  return useApiData(fetcher, [competitionKey])
}
