// ---------------------------------------------------------------------------
// Notification Detector - Detects game start, game end, and upcoming fixture
// events by comparing current match snapshots against previous state
// ---------------------------------------------------------------------------

import type { NormalizedMatchStatus } from '@/lib/match-status'
import type { NotificationType } from '@/types/notification'

export interface MatchSnapshot {
  readonly matchId: number
  readonly status: NormalizedMatchStatus
  readonly startTime: string
  readonly team1Name: string
  readonly team2Name: string
  readonly team1Score: number
  readonly team2Score: number
  readonly team1Key: string | null
  readonly team2Key: string | null
  readonly team1Id: number | null
  readonly team2Id: number | null
}

export interface DetectionResult {
  readonly type: NotificationType
  readonly matchId: number
  readonly message: string
  readonly link: string
}

const TWENTY_FOUR_HOURS_MS = 86_400_000

/**
 * Detects a game start event when a match transitions from SCHEDULED to LIVE.
 * Returns null if no transition detected.
 */
export function detectGameStart(
  current: MatchSnapshot,
  previousStatus: NormalizedMatchStatus | undefined,
): DetectionResult | null {
  if (previousStatus !== 'SCHEDULED' || current.status !== 'LIVE') {
    return null
  }

  return {
    type: 'GAME_START',
    matchId: current.matchId,
    message: `${current.team1Name} vs ${current.team2Name} is now live!`,
    link: `/games/${current.matchId}`,
  }
}

/**
 * Detects a game end event when a match transitions from LIVE to ENDED.
 * Includes the final score in the notification message.
 * Returns null if no transition detected.
 */
export function detectGameEnd(
  current: MatchSnapshot,
  previousStatus: NormalizedMatchStatus | undefined,
): DetectionResult | null {
  if (previousStatus !== 'LIVE' || current.status !== 'ENDED') {
    return null
  }

  return {
    type: 'GAME_END',
    matchId: current.matchId,
    message: `${current.team1Name} ${current.team1Score} - ${current.team2Name} ${current.team2Score} — Final`,
    link: `/games/${current.matchId}`,
  }
}

/**
 * Detects an upcoming fixture event when a scheduled match starts within 24 hours.
 * Returns null if the match is not scheduled, already past, or more than 24 hours away.
 */
export function detectUpcomingFixture(
  current: MatchSnapshot,
  now: Date,
): DetectionResult | null {
  if (current.status !== 'SCHEDULED') {
    return null
  }

  const startDate = new Date(current.startTime)
  const timeUntilStart = startDate.getTime() - now.getTime()

  if (timeUntilStart <= 0 || timeUntilStart > TWENTY_FOUR_HOURS_MS) {
    return null
  }

  const formattedTime = startDate.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    type: 'UPCOMING_FIXTURE',
    matchId: current.matchId,
    message: `${current.team1Name} vs ${current.team2Name} starts at ${formattedTime}`,
    link: `/games/${current.matchId}`,
  }
}

interface Deduplicator {
  readonly hasSeen: (matchId: number, type: NotificationType) => boolean
  readonly markSeen: (matchId: number, type: NotificationType) => void
  readonly clear: () => void
}

/**
 * Creates a deduplicator that tracks seen notification events by matchId:type key.
 * Prevents the same event from generating duplicate notifications across polling cycles.
 */
export function createDeduplicator(): Deduplicator {
  const seen = new Set<string>()

  function makeKey(matchId: number, type: NotificationType): string {
    return `${matchId}:${type}`
  }

  return {
    hasSeen(matchId: number, type: NotificationType): boolean {
      return seen.has(makeKey(matchId, type))
    },
    markSeen(matchId: number, type: NotificationType): void {
      seen.add(makeKey(matchId, type))
    },
    clear(): void {
      seen.clear()
    },
  }
}
