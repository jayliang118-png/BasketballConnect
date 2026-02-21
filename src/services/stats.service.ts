// ---------------------------------------------------------------------------
// Stats Service - Fetches scoring stats from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl)

const SPORT_REF_ID_BASKETBALL = 2

/**
 * Fetches scoring stats by grade/division.
 * GET /livescores/stats/public/scoringStatsByGrade?statType=X&divisionId=X&offset=X&limit=X&sportRefId=2
 */
export async function fetchScoringStatsByGrade(
  statType: string,
  divisionId: number,
  offset?: number,
  limit?: number,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/livescores/stats/public/scoringStatsByGrade',
      {
        statType,
        divisionId,
        offset,
        limit,
        sportRefId: SPORT_REF_ID_BASKETBALL,
      },
    )
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch scoring stats by grade')
  }
}

/**
 * Fetches per-player scoring breakdown for a match.
 * GET /livescores/stats/public/v2/scoringByPlayer?competitionId=X&matchId=X&aggregate=ALL&sportRefId=2
 */
export async function fetchScoringByPlayer(
  competitionId: number,
  matchId: number,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/livescores/stats/public/v2/scoringByPlayer',
      {
        competitionId,
        matchId,
        aggregate: 'ALL',
        sportRefId: SPORT_REF_ID_BASKETBALL,
      },
    )
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch scoring by player')
  }
}

/**
 * Fetches a user's scoring summary (season or match-by-match).
 * GET /livescores/stats/v2/summaryScoringByUser?userId=X&aggregate=X&sportRefId=2&competitionUniqueKey=X
 */
export async function fetchUserScoringSummary(
  userId: number,
  aggregate: 'CAREER' | 'MATCH',
  competitionUniqueKey: string,
  playerId?: number | null,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/livescores/stats/v2/summaryScoringByUser',
      {
        userId,
        playerId: playerId ?? '',
        aggregate,
        sportRefId: SPORT_REF_ID_BASKETBALL,
        competitionUniqueKey,
      },
    )
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch user scoring summary')
  }
}
