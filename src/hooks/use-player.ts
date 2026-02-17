'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

export function usePlayer(
  playerId: number | null
): UseApiDataResult<Record<string, unknown>> {
  const fetcher = useMemo(
    () =>
      playerId
        ? async () => {
            const { fetchPlayer } = await import('@/services/player.service')
            return fetchPlayer(playerId) as Promise<Record<string, unknown>>
          }
        : null,
    [playerId]
  )

  return useApiData(fetcher, [playerId])
}
