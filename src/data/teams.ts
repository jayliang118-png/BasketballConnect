// ---------------------------------------------------------------------------
// Server-side data fetching for teams
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import { TeamsResponseSchema, TeamDetailSchema } from '@/schemas/team.schema'
import type {
  TeamSchemaType,
  TeamDetailSchemaType,
} from '@/schemas/team.schema'

const REVALIDATE_LIST = 900
const REVALIDATE_DETAIL = 600

export async function getTeams(
  competitionId: number,
  divisionId: number,
  organisationId: string,
): Promise<readonly TeamSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/teams/list',
    { competitionId, divisionId, organisationId, includeBye: 0 },
    REVALIDATE_LIST,
  )
  const items = extractArray(raw)
  return TeamsResponseSchema.parse(items)
}

export async function getTeamDetail(
  teamUniqueKey: string,
): Promise<TeamDetailSchemaType> {
  const raw = await serverFetch(
    '/competition/participantGrading/teamViewPublic/team',
    { teamUniqueKey },
    REVALIDATE_DETAIL,
  )
  return TeamDetailSchema.parse(raw)
}

export async function getTeamName(
  teamUniqueKey: string,
): Promise<string> {
  try {
    const detail = await getTeamDetail(teamUniqueKey)
    return detail.name
  } catch {
    return teamUniqueKey
  }
}

export async function resolveTeamFromList(
  competitionId: number,
  divisionId: number,
  organisationId: string,
  teamKey: string,
): Promise<{ name: string; teamUniqueKey: string | null }> {
  // For real GUIDs, use the detail endpoint
  if (!teamKey.startsWith('team-')) {
    const name = await getTeamName(teamKey)
    return { name, teamUniqueKey: teamKey }
  }
  // For synthetic keys (team-{id}), look up from the teams list
  const numericId = Number(teamKey.replace('team-', ''))
  if (Number.isNaN(numericId)) return { name: teamKey, teamUniqueKey: null }
  try {
    const teams = await getTeams(competitionId, divisionId, organisationId)
    const match = teams.find((t) => t.id === numericId)
    return {
      name: match?.name ?? teamKey,
      teamUniqueKey: match?.teamUniqueKey ?? null,
    }
  } catch {
    return { name: teamKey, teamUniqueKey: null }
  }
}
