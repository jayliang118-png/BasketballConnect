'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

interface TeamInfo {
  readonly id: number
  readonly name: string
  readonly playersCount: string
}

type TeamPlayerCountResult = TeamInfo | null

/**
 * Fetches player count for a specific team from the teams list.
 * Useful for teams without full GUID details where only player count is available.
 *
 * @param competitionId - Competition ID to filter teams by
 * @param divisionId - Division ID to filter teams by
 * @param organisationId - Organisation ID to filter teams by
 * @param teamId - The team ID to find and return player count for
 * @returns Hook result with team info (id, name, playersCount) or null
 */
export function useTeamPlayerCount(
  competitionId: number | null,
  divisionId: number | null,
  organisationId: string | null,
  teamId: number | null,
): UseApiDataResult<TeamPlayerCountResult> {
  const fetcher = useMemo(
    () =>
      competitionId && divisionId && organisationId && teamId
        ? async () => {
            const { fetchTeams } = await import('@/services/team.service')
            const teams = (await fetchTeams(competitionId, divisionId, organisationId)) as Array<{
              id: number
              name: string
              playersCount: string
            }>
            const team = teams.find((t) => t.id === teamId)
            return team ?? null
          }
        : null,
    [competitionId, divisionId, organisationId, teamId],
  )

  return useApiData(fetcher, [competitionId, divisionId, organisationId, teamId])
}
