'use client'

import { useCallback, useEffect } from 'react'
import { useTeams } from '@/hooks/use-teams'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { useFavorites } from '@/hooks/use-favorites'
import { useGlobalSearchIndex } from '@/hooks/use-global-search-index'
import { TeamCard } from './TeamCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

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
  const { isFavorite, toggleFavorite } = useFavorites()
  const { register } = useGlobalSearchIndex()

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return

    const orgLabel = state.breadcrumbs[1]?.label ?? ''
    const compLabel = state.breadcrumbs[2]?.label ?? ''
    const divLabel = state.breadcrumbs[3]?.label ?? ''
    const parentLabel = [orgLabel, compLabel, divLabel].filter(Boolean).join(' > ')

    const entities: SearchableEntity[] = data.map((team) => {
      const favoriteKey = (team.teamUniqueKey as string | undefined) ?? `team-${team.id}`
      const params = {
        ...state.params,
        teamId: team.id,
        teamName: team.name,
        teamUniqueKey: favoriteKey,
      }
      return {
        type: 'team' as const,
        id: favoriteKey,
        name: team.name ?? '',
        parentLabel,
        targetView: 'teamDetail' as const,
        breadcrumbs: [
          ...state.breadcrumbs,
          { label: team.name ?? '', view: 'teamDetail' as const, params },
        ],
        params,
      }
    })

    register(entities)
  }, [data, register, state.breadcrumbs, state.params])

  const handleTeamClick = useCallback(
    (team: { readonly id: number; readonly name: string; readonly [key: string]: unknown }) => {
      const favoriteKey = (team.teamUniqueKey as string | undefined) ?? `team-${team.id}`
      navigateTo('teamDetail', {
        ...state.params,
        teamId: team.id,
        teamName: team.name,
        teamUniqueKey: favoriteKey,
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
          {filtered.map((team) => {
            const favoriteKey = (team.teamUniqueKey as string | undefined) ?? `team-${team.id}`
            const detailParams = {
              ...state.params,
              teamId: team.id,
              teamName: team.name,
              teamUniqueKey: favoriteKey,
            }
            const detailBreadcrumbs = [
              ...state.breadcrumbs,
              { label: team.name, view: 'teamDetail' as const, params: detailParams },
            ]
            return (
              <TeamCard
                key={team.id}
                name={team.name}
                teamId={team.id}
                playersCount={team.playersCount as string | undefined}
                organisationName={(team.linkedCompetitionOrganisation as Record<string, unknown> | undefined)?.name as string | undefined}
                isFavorited={isFavorite(favoriteKey)}
                onToggleFavorite={() => toggleFavorite({
                  teamUniqueKey: favoriteKey,
                  name: team.name,
                  breadcrumbs: detailBreadcrumbs,
                  params: detailParams,
                })}
                onClick={() => handleTeamClick(team)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
