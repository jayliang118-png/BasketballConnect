// ---------------------------------------------------------------------------
// Player Service - Fetches player profiles from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

/**
 * Fetches a player's public profile by playerId.
 * GET /livescores/users/public/userProfile?playerId=X
 */
export async function fetchPlayer(
  playerId: number,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/users/public/userProfile', {
      playerId,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch player')
  }
}

/**
 * Fetches a player's public profile by userId.
 * GET /livescores/users/public/userProfile?userId=X
 */
export async function fetchPlayerByUserId(
  userId: number,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/users/public/userProfile', {
      userId,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch player')
  }
}
