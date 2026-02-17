// ---------------------------------------------------------------------------
// Competition Service - Fetches competitions from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

/**
 * Fetches competitions for a given organisation.
 * GET /livescores/competitions/list?organisationUniqueKey=X
 */
export async function fetchCompetitions(
  organisationUniqueKey: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/competitions/list', {
      organisationUniqueKey,
    })
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch competitions')
  }
}
