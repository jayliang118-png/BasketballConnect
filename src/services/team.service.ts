// ---------------------------------------------------------------------------
// Team Service - Fetches team data from the Squadi API
// ---------------------------------------------------------------------------

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { extractArray } from '@/lib/utils'

const client = createApiClient(config.apiBaseUrl, config.apiToken)

/**
 * Fetches teams for a given competition and division.
 * GET /livescores/teams/list?competitionId=X&divisionId=X&organisationId=X&includeBye=0
 */
export async function fetchTeams(
  competitionId: number,
  divisionId: number,
  organisationId: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/teams/list', {
      competitionId,
      divisionId,
      organisationId,
      includeBye: 0,
    })
    return extractArray(data)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch teams')
  }
}

/**
 * Fetches detailed team info by unique key.
 * GET /competition/participantGrading/teamViewPublic/team?teamUniqueKey=X
 */
export async function fetchTeamDetail(
  teamUniqueKey: string,
): Promise<unknown> {
  try {
    const data = await client.get(
      '/competition/participantGrading/teamViewPublic/team',
      { teamUniqueKey },
    )
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch team detail')
  }
}
