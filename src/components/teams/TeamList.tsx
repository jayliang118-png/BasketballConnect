'use client'

import Link from 'next/link'
import { useTeams } from '@/hooks/use-teams'
import { useSearch } from '@/hooks/use-search'
import { useFavorites } from '@/hooks/use-favorites'
import { TeamCard } from './TeamCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

interface TeamListProps {
  readonly competitionId: number
  readonly divisionId: number
  readonly orgKey: string
  readonly compKey: string
}

export function TeamList({ competitionId, divisionId, orgKey, compKey }: TeamListProps) {
  const { data, isLoading, error, refetch } = useTeams(
    competitionId,
    divisionId,
    orgKey,
  )
  const { filterItems } = useSearch()
  const { isFavorite, toggleFavorite } = useFavorites()

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
            const teamKey = (team.teamUniqueKey as string | undefined) ?? `team-${team.id}`
            const teamUrl = `/orgs/${orgKey}/competitions/${compKey}/divisions/${divisionId}/teams/${teamKey}`

            return (
              <Link key={team.id} href={teamUrl}>
                <TeamCard
                  name={team.name}
                  teamId={team.id}
                  playersCount={team.playersCount as string | undefined}
                  organisationName={(team.linkedCompetitionOrganisation as Record<string, unknown> | undefined)?.name as string | undefined}
                  isFavorited={isFavorite('team', teamKey)}
                  onToggleFavorite={() => toggleFavorite({
                    type: 'team',
                    id: teamKey,
                    name: team.name,
                    url: teamUrl,
                  })}
                />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
