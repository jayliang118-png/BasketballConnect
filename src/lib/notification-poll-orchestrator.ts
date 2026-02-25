// ---------------------------------------------------------------------------
// Notification Poll Orchestrator - Coordinates fixture fetching, detection,
// and notification generation for all favorited teams
// ---------------------------------------------------------------------------

import type { DivisionGroup } from '@/lib/favorite-url-parser'
import type { NormalizedMatchStatus } from '@/lib/match-status'
import { normalizeMatchStatus } from '@/lib/match-status'
import type { MatchSnapshot, DetectionResult } from '@/lib/notification-detector'
import {
  detectGameStart,
  detectGameEnd,
  detectUpcomingFixture,
  createDeduplicator,
} from '@/lib/notification-detector'
import type { Notification } from '@/types/notification'
import type { Match, Round } from '@/types/fixture'

type AddNotificationFn = (
  notification: Omit<Notification, 'id' | 'expiresAt' | 'read'>,
) => void

export interface PollContext {
  readonly favoriteTeamKeys: ReadonlySet<string>
  readonly addNotification: AddNotificationFn
}

interface CompetitionResolver {
  readonly resolve: (orgKey: string, compKey: string) => Promise<number | null>
}

interface PollOrchestrator {
  readonly executePoll: (
    divisions: readonly DivisionGroup[],
    context: PollContext,
  ) => Promise<void>
  readonly isFirstPoll: boolean
}

/**
 * Creates a poll orchestrator that coordinates fixture fetching, match
 * detection, and notification generation across all favorited divisions.
 *
 * First poll populates state without generating notifications (suppression).
 * Subsequent polls detect state transitions and deduplicate events.
 */
export function createPollOrchestrator(
  competitionResolver: CompetitionResolver,
): PollOrchestrator {
  const previousStatuses = new Map<number, NormalizedMatchStatus>()
  const deduplicator = createDeduplicator()
  let firstPoll = true

  async function fetchDivisionMatches(
    group: DivisionGroup,
  ): Promise<readonly MatchSnapshot[]> {
    const competitionId = await competitionResolver.resolve(
      group.orgKey,
      group.compKey,
    )

    if (competitionId === null) {
      return []
    }

    const { fetchFixtures } = await import('@/services/fixture.service')
    const rounds = (await fetchFixtures(
      competitionId,
      group.divisionId,
    )) as readonly Round[]

    if (!Array.isArray(rounds)) {
      return []
    }

    return rounds.flatMap((round: Round) =>
      round.matches.map(
        (match: Match): MatchSnapshot => ({
          matchId: match.id,
          status: normalizeMatchStatus(match.matchStatus),
          startTime: match.startTime,
          team1Name: match.team1.name,
          team2Name: match.team2.name,
          team1Score: match.team1Score,
          team2Score: match.team2Score,
          team1Key: match.team1.teamUniqueKey,
          team2Key: match.team2.teamUniqueKey,
        }),
      ),
    )
  }

  function processDetectionResult(
    result: DetectionResult | null,
    context: PollContext,
  ): void {
    if (result === null) return
    if (firstPoll && result.type !== 'UPCOMING_FIXTURE') return
    if (deduplicator.hasSeen(result.matchId, result.type)) return

    context.addNotification({
      type: result.type,
      timestamp: new Date().toISOString(),
      message: result.message,
      link: result.link,
      matchId: result.matchId,
    })

    deduplicator.markSeen(result.matchId, result.type)
  }

  async function executePoll(
    divisions: readonly DivisionGroup[],
    context: PollContext,
  ): Promise<void> {
    const results = await Promise.allSettled(
      divisions.map((group) => fetchDivisionMatches(group)),
    )

    const allSnapshots = results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    )

    const relevantSnapshots = allSnapshots.filter(
      (snapshot) =>
        (snapshot.team1Key !== null &&
          context.favoriteTeamKeys.has(snapshot.team1Key)) ||
        (snapshot.team2Key !== null &&
          context.favoriteTeamKeys.has(snapshot.team2Key)),
    )

    const now = new Date()

    for (const snapshot of relevantSnapshots) {
      const previousStatus = previousStatuses.get(snapshot.matchId)

      processDetectionResult(
        detectGameStart(snapshot, previousStatus),
        context,
      )
      processDetectionResult(
        detectGameEnd(snapshot, previousStatus),
        context,
      )
      processDetectionResult(
        detectUpcomingFixture(snapshot, now),
        context,
      )

      previousStatuses.set(snapshot.matchId, snapshot.status)
    }

    if (firstPoll) {
      firstPoll = false
    }
  }

  return {
    executePoll,
    get isFirstPoll() {
      return firstPoll
    },
  }
}
