'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'
import type { GameSummary, ActionLogResponse, GameEvent } from '@/types/game'

export function useGameSummary(
  matchId: number | null,
  competitionUniqueKey: string | null
): UseApiDataResult<GameSummary> {
  const fetcher = useMemo(
    () =>
      matchId && competitionUniqueKey
        ? async () => {
            const { fetchGameSummary } = await import('@/services/game.service')
            return fetchGameSummary(matchId, competitionUniqueKey) as Promise<GameSummary>
          }
        : null,
    [matchId, competitionUniqueKey]
  )

  return useApiData(fetcher, [matchId, competitionUniqueKey])
}

export function useActionLog(
  matchId: number | null,
  competitionId: string | null
): UseApiDataResult<ActionLogResponse> {
  const fetcher = useMemo(
    () =>
      matchId && competitionId
        ? async () => {
            const { fetchActionLog } = await import('@/services/game.service')
            return fetchActionLog(matchId, competitionId) as Promise<ActionLogResponse>
          }
        : null,
    [matchId, competitionId]
  )

  return useApiData(fetcher, [matchId, competitionId])
}

export function useGameEvents(
  matchId: number | null
): UseApiDataResult<readonly GameEvent[]> {
  const fetcher = useMemo(
    () =>
      matchId
        ? async () => {
            const { fetchGameEvents } = await import('@/services/game.service')
            return fetchGameEvents(matchId) as Promise<readonly GameEvent[]>
          }
        : null,
    [matchId]
  )

  return useApiData(fetcher, [matchId])
}

export function useScoringByPlayer(
  competitionId: number | null,
  matchId: number | null,
): UseApiDataResult<readonly Record<string, unknown>[]> {
  const fetcher = useMemo(
    () =>
      competitionId && matchId
        ? async () => {
            const { fetchScoringByPlayer } = await import('@/services/stats.service')
            return fetchScoringByPlayer(competitionId, matchId) as Promise<readonly Record<string, unknown>[]>
          }
        : null,
    [competitionId, matchId]
  )

  return useApiData(fetcher, [competitionId, matchId])
}
