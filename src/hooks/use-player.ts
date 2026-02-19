'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

/**
 * Fetches a player profile by playerId (from roster) or userId (from team detail participants).
 * Prefers playerId if both are provided.
 */
export function usePlayer(
  playerId: number | null,
  userId?: number | null,
): UseApiDataResult<Record<string, unknown>> {
  const fetcher = useMemo(
    () => {
      if (playerId) {
        return async () => {
          const { fetchPlayer } = await import('@/services/player.service')
          return fetchPlayer(playerId) as Promise<Record<string, unknown>>
        }
      }
      if (userId) {
        return async () => {
          const { fetchPlayerByUserId } = await import('@/services/player.service')
          return fetchPlayerByUserId(userId) as Promise<Record<string, unknown>>
        }
      }
      return null
    },
    [playerId, userId],
  )

  return useApiData(fetcher, [playerId, userId])
}
