'use client'

import { useCallback } from 'react'
import { useTeams } from '@/hooks/use-teams'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { TeamCard } from './TeamCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

export function TeamList() {
  const { state, navigateTo } = useNavigation()
  const competitionId = state.params.competitionId as number | undefined
  const divisionId = state.params.divisionId as number | undefined
  const organisationUniqueKey = state.params.organisationUniqueKey as string | undefined

  const { data, isLoading, error, refetch } = useTeams(
    competitionId ?? null,
    divisionId ?? null,
    organisationUniqueKey ?? null
  )
  const { filterItems } = useSearch()

  const handleTeamClick = useCallback(
    (team: { readonly id: number; readonly name: string }) => {
      navigateTo('teamDetail', {
        ...state.params,
        teamId: team.id,
        teamName: team.name,
      }, team.name)
    },
    [navigateTo, state.params]
  )

  if (isLoading) return <LoadingSpinner message="Loading teams..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState message="No teams found" icon="team" />

  const filtered = filterItems(data, (t) => t.name ?? '')

  return (
    <div className="space-y-3">
      {filtered.length === 0 ? (
        <EmptyState message="No teams match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((team) => (
            <TeamCard
              key={team.id}
              name={team.name}
              teamId={team.id}
              playersCount={team.playersCount as string | undefined}
              organisationName={(team.linkedCompetitionOrganisation as Record<string, unknown> | undefined)?.name as string | undefined}
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
