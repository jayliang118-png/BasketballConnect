// ---------------------------------------------------------------------------
// Game Service - Fetches game details from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'

const client = createApiClient(config.apiBaseUrl)

/**
 * Fetches the game summary for a match.
 * GET /livescores/matches/public/gameSummary?matchId=X&competitionUniqueKey=X
 */
export async function fetchGameSummary(
  matchId: number,
  competitionUniqueKey: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/matches/public/gameSummary', {
      matchId,
      competitionUniqueKey,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch game summary')
  }
}

/**
 * Fetches the action log for a match.
 * GET /livescores/web/matches/public/actionLog?matchId=X&competitionId=X
 */
export async function fetchActionLog(
  matchId: number,
  competitionId: string,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/livescores/web/matches/public/actionLog',
      { matchId, competitionId },
    )
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch action log')
  }
}

/**
 * Fetches game events for a match.
 * GET /livescores/matches/public/events?matchId=X
 */
export async function fetchGameEvents(
  matchId: number,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/matches/public/events', {
      matchId,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch game events')
  }
}
