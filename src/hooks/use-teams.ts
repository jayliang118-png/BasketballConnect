'use client'

import { useMemo } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

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

export function useTeams(
  competitionId: number | null,
  divisionId: number | null,
  organisationId: string | null
): UseApiDataResult<readonly Team[]> {
  const fetcher = useMemo(
    () =>
      competitionId && divisionId && organisationId
        ? async () => {
            const { fetchTeams } = await import('@/services/team.service')
            return fetchTeams(competitionId, divisionId, organisationId) as Promise<readonly Team[]>
          }
        : null,
    [competitionId, divisionId, organisationId]
  )

  return useApiData(fetcher, [competitionId, divisionId, organisationId])
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
