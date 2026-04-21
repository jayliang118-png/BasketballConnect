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
  competitionKey: string,
  divisionId: number,
  organisationId: string,
): Promise<readonly TeamSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/teams/enduser/list',
    { competitionId: competitionKey, divisionId, organisationId, includeBye: 0 },
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
  competitionKey: string,
  divisionId: number,
  organisationId: string,
  teamKey: string,
): Promise<{ id: number | null; name: string; teamUniqueKey: string | null }> {
  // For real GUIDs, try to get the team from list first to get the ID
  if (!teamKey.startsWith('team-')) {
    try {
      const teams = await getTeams(competitionKey, divisionId, organisationId)
      const match = teams.find((t) => t.teamUniqueKey === teamKey)
      if (match) {
        return {
          id: match.id ?? null,
          name: match.name,
          teamUniqueKey: teamKey,
        }
      }
    } catch {
      // Fall through to detail endpoint
    }
    const name = await getTeamName(teamKey)
    return { id: null, name, teamUniqueKey: teamKey }
  }
  // For synthetic keys (team-{id}), look up from the teams list
  const numericId = Number(teamKey.replace('team-', ''))
  if (Number.isNaN(numericId)) return { id: null, name: teamKey, teamUniqueKey: null }
  try {
    const teams = await getTeams(competitionKey, divisionId, organisationId)
    const match = teams.find((t) => t.id === numericId)
    return {
      id: match?.id ?? numericId,
      name: match?.name ?? teamKey,
      teamUniqueKey: match?.teamUniqueKey ?? null,
    }
  } catch {
    return { id: numericId, name: teamKey, teamUniqueKey: null }
  }
}
