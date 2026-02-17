'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

export function useGameSummary(
  matchId: number | null,
  competitionUniqueKey: string | null
): UseApiDataResult<Record<string, unknown>> {
  const fetcher = useMemo(
    () =>
      matchId && competitionUniqueKey
        ? async () => {
            const { fetchGameSummary } = await import('@/services/game.service')
            return fetchGameSummary(matchId, competitionUniqueKey) as Promise<Record<string, unknown>>
          }
        : null,
    [matchId, competitionUniqueKey]
  )

  return useApiData(fetcher, [matchId, competitionUniqueKey])
}

export function useActionLog(
  matchId: number | null,
  competitionId: string | null
): UseApiDataResult<Record<string, unknown>> {
  const fetcher = useMemo(
    () =>
      matchId && competitionId
        ? async () => {
            const { fetchActionLog } = await import('@/services/game.service')
            return fetchActionLog(matchId, competitionId) as Promise<Record<string, unknown>>
          }
        : null,
    [matchId, competitionId]
  )

  return useApiData(fetcher, [matchId, competitionId])
}

export function useGameEvents(
  matchId: number | null
): UseApiDataResult<Record<string, unknown>> {
  const fetcher = useMemo(
    () =>
      matchId
        ? async () => {
            const { fetchGameEvents } = await import('@/services/game.service')
            return fetchGameEvents(matchId) as Promise<Record<string, unknown>>
          }
        : null,
    [matchId]
  )

  return useApiData(fetcher, [matchId])
}
