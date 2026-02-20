// ---------------------------------------------------------------------------
// Division Service - Fetches divisions from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl)

/**
 * Fetches divisions for a given competition.
 * GET /livescores/division?competitionKey=X
 */
export async function fetchDivisions(
  competitionKey: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/division', {
      competitionKey,
    })
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch divisions')
  }
}
