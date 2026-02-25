'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useFavorites } from '@/hooks/use-favorites'
import { useNotifications } from '@/hooks/use-notifications'
import { groupFavoritesByDivision } from '@/lib/favorite-url-parser'
import { createPollOrchestrator } from '@/lib/notification-poll-orchestrator'
import { createCompetitionResolver } from '@/lib/competition-resolver'

const DEFAULT_POLL_INTERVAL = 60_000

interface UseNotificationPollerOptions {
  readonly pollingInterval?: number
}

/**
 * Side-effect-only hook that runs centralized polling for all favorited teams.
 * Coordinates fixture fetching, detection, and notification generation.
 *
 * Does nothing when no team favorites exist or contexts are not hydrated.
 * Polls on visibility change and at the configured interval.
 */
export function useNotificationPoller(
  options?: UseNotificationPollerOptions,
): void {
  const pollingInterval = options?.pollingInterval ?? DEFAULT_POLL_INTERVAL

  const { state } = useFavorites()
  const { addNotification, isHydrated: notifHydrated, state: notifState } = useNotifications()

  const resolverRef = useRef(createCompetitionResolver())
  const orchestratorRef = useRef(
    createPollOrchestrator(resolverRef.current),
  )

  const addNotificationRef = useRef(addNotification)
  addNotificationRef.current = addNotification

  const notifStateRef = useRef(notifState)
  notifStateRef.current = notifState

  const executePoll = useCallback(() => {
    const teamItems = state.items.filter((item) => item.type === 'team')

    const divisions = groupFavoritesByDivision(state.items)
    if (divisions.length === 0) return

    const favoriteTeamKeys = new Set(
      teamItems.map((item) => item.id),
    )

    const favoriteTeamUrls = new Map(
      teamItems
        .filter((item) => item.url)
        .map((item) => [item.id, item.url!]),
    )

    orchestratorRef.current
      .executePoll(divisions, {
        favoriteTeamKeys,
        favoriteTeamUrls,
        addNotification: addNotificationRef.current,
        existingNotifications: notifStateRef.current.notifications,
      })
      .catch(() => {
        // Poll errors are non-fatal; next cycle will retry
      })
  }, [state.items])

  useEffect(() => {
    if (!state.isHydrated || !notifHydrated) return

    const hasTeamFavorites = state.items.some((item) => item.type === 'team')
    if (!hasTeamFavorites) return

    executePoll()

    const intervalId = setInterval(executePoll, pollingInterval)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executePoll()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [pollingInterval, state.items, state.isHydrated, notifHydrated, executePoll])
}
