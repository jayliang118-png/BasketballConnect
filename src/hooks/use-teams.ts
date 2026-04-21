'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'
import { useFixtures } from './use-fixtures'

interface Team {
  readonly id: number
  readonly name: string
  readonly [key: string]: unknown
}

interface TeamDetail {
  readonly teamUniqueKey: string
  readonly name: string
  readonly players: readonly { readonly playerId: number; readonly firstName: string; readonly lastName: string }[]
}

/**
 * Extract unique teams from fixtures data as a fallback when teams API is not available
 */
function extractTeamsFromFixtures(fixturesData: unknown): readonly Team[] {
  if (!fixturesData || typeof fixturesData !== 'object') return []

  const rounds = (fixturesData as { rounds?: unknown[] }).rounds
  if (!Array.isArray(rounds)) return []

  const teamsMap = new Map<number, Team>()

  for (const round of rounds) {
    const matches = (round as { matches?: unknown[] }).matches
    if (!Array.isArray(matches)) continue

    for (const match of matches) {
      const matchObj = match as {
        team1?: { id?: number; name?: string; teamUniqueKey?: string; logoUrl?: string }
        team2?: { id?: number; name?: string; teamUniqueKey?: string; logoUrl?: string }
      }

      const team1 = matchObj.team1
      const team2 = matchObj.team2

      if (team1?.id && team1.name) {
        teamsMap.set(team1.id, {
          id: team1.id,
          name: team1.name,
          teamUniqueKey: team1.teamUniqueKey,
          logoUrl: team1.logoUrl,
        })
      }

      if (team2?.id && team2.name) {
        teamsMap.set(team2.id, {
          id: team2.id,
          name: team2.name,
          teamUniqueKey: team2.teamUniqueKey,
          logoUrl: team2.logoUrl,
        })
      }
    }
  }

  return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function useTeams(
  competitionKey: string | null,
  divisionId: number | null,
  organisationId: string | null
): UseApiDataResult<readonly Team[]> {
  const fetcher = useMemo(
    () =>
      competitionKey && divisionId && organisationId
        ? async () => {
            const { fetchTeams } = await import('@/services/team.service')
            return fetchTeams(competitionKey, divisionId, organisationId) as Promise<readonly Team[]>
          }
        : null,
    [competitionKey, divisionId, organisationId]
  )

  return useApiData(fetcher, [competitionKey, divisionId, organisationId])
}

export function useTeamDetail(teamUniqueKey: string | null): UseApiDataResult<TeamDetail> {
  const fetcher = useMemo(
    () =>
      teamUniqueKey
        ? async () => {
            const { fetchTeamDetail } = await import('@/services/team.service')
            return fetchTeamDetail(teamUniqueKey) as Promise<TeamDetail>
          }
        : null,
    [teamUniqueKey]
  )

  return useApiData(fetcher, [teamUniqueKey])
}
