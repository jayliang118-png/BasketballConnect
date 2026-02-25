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
  readonly favoriteTeamUrls: ReadonlyMap<string, string>
  readonly addNotification: AddNotificationFn
  readonly existingNotifications?: readonly { readonly matchId?: number; readonly type: string }[]
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
 * Returns true when the snapshot involves a favorited team.
 * Checks both GUID teamUniqueKey and fallback `team-{numericId}` formats,
 * since favorites may be stored in either format.
 */
function isRelevantToFavorites(
  snapshot: MatchSnapshot,
  favoriteTeamKeys: ReadonlySet<string>,
): boolean {
  if (snapshot.team1Key !== null && favoriteTeamKeys.has(snapshot.team1Key)) return true
  if (snapshot.team2Key !== null && favoriteTeamKeys.has(snapshot.team2Key)) return true
  if (snapshot.team1Id !== null && favoriteTeamKeys.has(`team-${snapshot.team1Id}`)) return true
  if (snapshot.team2Id !== null && favoriteTeamKeys.has(`team-${snapshot.team2Id}`)) return true
  return false
}

/**
 * Resolves the team fixtures page URL for a snapshot by finding the first
 * favorited team that matches the snapshot's team keys or numeric IDs.
 * Returns the team's favorites URL if found, otherwise the detector's link.
 */
function resolveTeamUrl(
  snapshot: MatchSnapshot,
  favoriteTeamUrls: ReadonlyMap<string, string>,
): string | null {
  if (snapshot.team1Key !== null && favoriteTeamUrls.has(snapshot.team1Key)) {
    return favoriteTeamUrls.get(snapshot.team1Key)!
  }
  if (snapshot.team2Key !== null && favoriteTeamUrls.has(snapshot.team2Key)) {
    return favoriteTeamUrls.get(snapshot.team2Key)!
  }
  if (snapshot.team1Id !== null && favoriteTeamUrls.has(`team-${snapshot.team1Id}`)) {
    return favoriteTeamUrls.get(`team-${snapshot.team1Id}`)!
  }
  if (snapshot.team2Id !== null && favoriteTeamUrls.has(`team-${snapshot.team2Id}`)) {
    return favoriteTeamUrls.get(`team-${snapshot.team2Id}`)!
  }
  return null
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
          team1Id: match.team1.id ?? null,
          team2Id: match.team2.id ?? null,
        }),
      ),
    )
  }

  function processDetectionResult(
    result: DetectionResult | null,
    snapshot: MatchSnapshot,
    context: PollContext,
  ): void {
    if (result === null) return
    if (firstPoll && result.type !== 'UPCOMING_FIXTURE') return
    if (deduplicator.hasSeen(result.matchId, result.type)) return

    const teamUrl = resolveTeamUrl(snapshot, context.favoriteTeamUrls)

    context.addNotification({
      type: result.type,
      timestamp: new Date().toISOString(),
      message: result.message,
      link: teamUrl ?? result.link,
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

    if (firstPoll && context.existingNotifications) {
      for (const n of context.existingNotifications) {
        if (n.matchId !== undefined) {
          deduplicator.markSeen(n.matchId, n.type as Notification['type'])
        }
      }
    }

    const relevantSnapshots = allSnapshots.filter(
      (snapshot) => isRelevantToFavorites(snapshot, context.favoriteTeamKeys),
    )

    const now = new Date()

    for (const snapshot of relevantSnapshots) {
      const previousStatus = previousStatuses.get(snapshot.matchId)

      processDetectionResult(
        detectGameStart(snapshot, previousStatus),
        snapshot,
        context,
      )
      processDetectionResult(
        detectGameEnd(snapshot, previousStatus),
        snapshot,
        context,
      )
      processDetectionResult(
        detectUpcomingFixture(snapshot, now),
        snapshot,
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
