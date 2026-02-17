// ---------------------------------------------------------------------------
// Organisation Service - Fetches organisations from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

/**
 * Fetches all organisations.
 * GET /users/api/organisations/all
 */
export async function fetchOrganisations(): Promise<unknown> {
  try {
    const data = await client.get('/users/api/organisations/all')
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch organisations')
  }
}
