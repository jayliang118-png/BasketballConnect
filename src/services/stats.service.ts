// ---------------------------------------------------------------------------
// Stats Service - Fetches scoring stats from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

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
 * Fetches a user's scoring summary.
 * GET /livescores/stats/v2/summaryScoringByUser?userId=X&aggregate=X&sportRefId=2&competitionId=X
 */
export async function fetchUserScoringSummary(
  userId: number,
  aggregate: string,
  competitionId: number,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/livescores/stats/v2/summaryScoringByUser',
      {
        userId,
        aggregate,
        sportRefId: SPORT_REF_ID_BASKETBALL,
        competitionId,
      },
    )
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch user scoring summary')
  }
}
