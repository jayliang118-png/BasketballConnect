// ---------------------------------------------------------------------------
// Response Formatter - Maps tool call results to typed ChatResultBlocks
// ---------------------------------------------------------------------------

import type { ChatResultBlock, ChatResultType } from '@/types/chat'

const TOOL_TO_RESULT_TYPE: Readonly<Record<string, ChatResultType>> = {
  search_organisations: 'organisations',
  get_competitions: 'competitions',
  get_divisions: 'divisions',
  get_teams: 'teams',
  get_team_detail: 'teamDetail',
  get_player_profile: 'playerProfile',
  get_fixtures: 'fixtures',
  get_game_summary: 'gameSummary',
  get_scoring_stats: 'stats',
  get_game_action_log: 'gameSummary',
}

interface ToolResult {
  readonly name: string
  readonly result: unknown
  readonly error?: string
}

export function buildResultBlocks(
  toolResults: readonly ToolResult[],
): readonly ChatResultBlock[] {
  return toolResults
    .filter((tr) => tr.result !== null && !tr.error)
    .map((tr) => ({
      type: TOOL_TO_RESULT_TYPE[tr.name] ?? 'text',
      data: tr.result,
    }))
}
