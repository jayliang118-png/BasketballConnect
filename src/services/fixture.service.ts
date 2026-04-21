// ---------------------------------------------------------------------------
// Fixture Service - Fetches fixture/match schedule from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl)

/**
 * Fetches fixtures (round matches) for a competition and division.
 * GET /livescores/round/matches?competitionId=X&divisionId=X
 *
 * @param competitionId - Can be either UUID (for division-wide fixtures) or numeric ID (for team-specific)
 * @param divisionId - The division ID
 * @param teamIds - Optional array of team IDs to filter fixtures for specific teams
 * @param ignoreStatuses - Optional array of status codes to ignore
 */
export async function fetchFixtures(
  competitionId: string | number,
  divisionId: number,
  teamIds?: number[],
  ignoreStatuses?: number[],
): Promise<unknown> {
  try {
    const params: Record<string, string | number> = {
      competitionId: String(competitionId),
      divisionId,
    }

    if (teamIds && teamIds.length > 0) {
      params.teamIds = `[${teamIds.join(',')}]`
    }

    if (ignoreStatuses && ignoreStatuses.length > 0) {
      params.ignoreStatuses = `[${ignoreStatuses.join(',')}]`
    }

    const data = await client.get('/livescores/round/matches', params)
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch fixtures')
  }
}
