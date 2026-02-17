// ---------------------------------------------------------------------------
// Fixture Service - Fetches fixture/match schedule from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

/**
 * Fetches fixtures (round matches) for a competition and division.
 * GET /livescores/round/matches?competitionId=X&divisionId=X
 */
export async function fetchFixtures(
  competitionId: number,
  divisionId: number,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/round/matches', {
      competitionId,
      divisionId,
    })
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch fixtures')
  }
}
