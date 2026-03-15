'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'
import type { GameSummary, ActionLogResponse, GameEvent } from '@/types/game'

interface ApiDataOptions {
  readonly pollingInterval?: number | null
}

export function useGameSummary(
  matchId: number | null,
  competitionUniqueKey: string | null,
  options?: ApiDataOptions,
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

  return useApiData(fetcher, [matchId, competitionUniqueKey], options)
}

export function useActionLog(
  matchId: number | null,
  competitionId: string | null,
  options?: ApiDataOptions,
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

  return useApiData(fetcher, [matchId, competitionId], options)
}

export function useGameEvents(
  matchId: number | null,
  options?: ApiDataOptions,
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

  return useApiData(fetcher, [matchId], options)
}

export function useScoringByPlayer(
  competitionId: number | null,
  matchId: number | null,
  options?: ApiDataOptions,
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

  return useApiData(fetcher, [competitionId, matchId], options)
}
