// ---------------------------------------------------------------------------
// Ladder Service - Fetches ladder/standings from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'

const client = createApiClient(config.apiBaseUrl)

/**
 * Fetches ladder standings for a division.
 * GET /livescores/teams/ladder/v2?divisionIds=X&competitionKey=X&filteredOutCompStatuses=1&showForm=1&sportRefId=2
 */
export async function fetchLadder(
  divisionId: number,
  competitionKey: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/teams/ladder/v2', {
      divisionIds: divisionId,
      competitionKey,
      filteredOutCompStatuses: 1,
      showForm: 1,
      sportRefId: 2,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch ladder')
  }
}
