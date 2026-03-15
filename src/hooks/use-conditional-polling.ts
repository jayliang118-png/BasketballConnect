'use client'

import { useMemo } from 'react'
import { normalizeMatchStatus, isLiveStatus } from '@/lib/match-status'

/**
 * Hook that determines whether to enable polling based on match status.
 *
 * Returns polling interval (ms) when game is LIVE, null otherwise.
 * This allows components to conditionally poll data only for live games.
 *
 * @param matchStatus - Raw status string from API (e.g., 'LIVE', 'ENDED', 'SCHEDULED')
 * @param livePollingInterval - Polling interval in ms when game is LIVE (default: 5000ms)
 * @returns Polling interval in ms for useApiData hook, or null to disable polling
 */
export function useConditionalPolling(
  matchStatus: string | null | undefined,
  livePollingInterval: number = 5000,
): number | null {
  const normalizedStatus = useMemo(
    () => normalizeMatchStatus(matchStatus),
    [matchStatus],
  )

  return useMemo(
    () => (isLiveStatus(normalizedStatus) ? livePollingInterval : null),
    [normalizedStatus, livePollingInterval],
  )
}
