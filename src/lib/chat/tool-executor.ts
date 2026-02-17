// ---------------------------------------------------------------------------
// Tool Executor - Dispatches LLM tool calls to Squadi service functions
// ---------------------------------------------------------------------------

import { fetchOrganisations } from '@/services/organisation.service'
import { fetchCompetitions } from '@/services/competition.service'
import { fetchDivisions } from '@/services/division.service'
import { fetchTeams, fetchTeamDetail } from '@/services/team.service'
import { fetchPlayer } from '@/services/player.service'
import { fetchFixtures } from '@/services/fixture.service'
import { fetchGameSummary, fetchActionLog } from '@/services/game.service'
import { fetchScoringStatsByGrade } from '@/services/stats.service'

const MAX_ITEMS_FOR_LLM = 50

export interface ToolCallResult {
  readonly toolCallId: string
  readonly name: string
  readonly result: unknown
  readonly error?: string
}

export async function executeToolCall(
  toolCallId: string,
  functionName: string,
  args: Record<string, unknown>,
): Promise<ToolCallResult> {
  try {
    const result = await dispatchFunction(functionName, args)
    const truncated = truncateForLLM(result)
    return { toolCallId, name: functionName, result: truncated }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return { toolCallId, name: functionName, result: null, error: message }
  }
}

function truncateForLLM(data: unknown): unknown {
  if (!Array.isArray(data)) {
    return data
  }
  if (data.length <= MAX_ITEMS_FOR_LLM) {
    return data
  }
  return data.slice(0, MAX_ITEMS_FOR_LLM)
}

async function dispatchFunction(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case 'search_organisations':
      return fetchOrganisations()

    case 'get_competitions':
      return fetchCompetitions(args.organisationUniqueKey as string)

    case 'get_divisions':
      return fetchDivisions(args.competitionKey as string)

    case 'get_teams':
      return fetchTeams(
        args.competitionId as number,
        args.divisionId as number,
        args.organisationId as string,
      )

    case 'get_team_detail':
      return fetchTeamDetail(args.teamUniqueKey as string)

    case 'get_player_profile':
      return fetchPlayer(args.playerId as number)

    case 'get_fixtures':
      return fetchFixtures(
        args.competitionId as number,
        args.divisionId as number,
      )

    case 'get_game_summary':
      return fetchGameSummary(
        args.matchId as number,
        args.competitionUniqueKey as string,
      )

    case 'get_scoring_stats':
      return fetchScoringStatsByGrade(
        args.statType as string,
        args.divisionId as number,
        0,
        typeof args.limit === 'number' ? args.limit : 20,
      )

    case 'get_game_action_log':
      return fetchActionLog(
        args.matchId as number,
        args.competitionId as string,
      )

    default:
      throw new Error(`Unknown tool function: ${name}`)
  }
}
