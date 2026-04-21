'use client'

import { useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTeamDetail } from '@/hooks/use-teams'
import { useFavorites } from '@/hooks/use-favorites'
import { useGlobalSearchIndex } from '@/hooks/use-global-search-index'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import { SimplifiedRoster } from '@/components/teams/SimplifiedRoster'
import { useTeamPlayerCount } from '@/hooks/use-team-player-count'
import type { SearchableEntity } from '@/types/global-search'

interface RosterContentProps {
  readonly players: readonly { readonly playerId: number; readonly firstName: string; readonly lastName: string }[]
  readonly onPlayerClick: (playerId: number) => void
}

function RosterContent({ players, onPlayerClick }: RosterContentProps) {
  if (players.length === 0) {
    return <EmptyState message="No players in this roster" icon="team" />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {players.map((player) => (
        <Card
          key={player.playerId}
          onClick={() => onPlayerClick(player.playerId)}
          className="group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-court-elevated flex items-center justify-center flex-shrink-0 border border-court-border">
              <span className="text-sm font-bold text-hoop-orange">
                {(player.firstName?.[0] ?? '') + (player.lastName?.[0] ?? '')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate group-hover:text-hoop-orange transition-colors">
                {player.firstName} {player.lastName}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

interface TeamRosterProps {
  readonly teamKey: string
  readonly teamName: string
  readonly compKey?: string
  readonly divisionId?: number
  readonly orgKey?: string
}

export function TeamRoster({
  teamKey,
  teamName,
  compKey,
  divisionId,
  orgKey,
}: TeamRosterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isFavorite, toggleFavorite, updateFavorite } = useFavorites()

  const isRealGuid = !teamKey.startsWith('team-')
  const { data, isLoading, error, refetch } = useTeamDetail(isRealGuid ? teamKey : null)
  const { register } = useGlobalSearchIndex()

  // Fallback for teams without GUID
  const teamId = !isRealGuid ? parseInt(teamKey.replace('team-', ''), 10) : null
  const {
    data: teamInfo,
    isLoading: isLoadingFallback,
    error: errorFallback,
    refetch: refetchFallback,
  } = useTeamPlayerCount(
    compKey ?? null,
    divisionId ?? null,
    orgKey ?? null,
    !Number.isNaN(teamId ?? NaN) ? teamId : null,
  )

  // Auto-update favorite name when data loads
  useEffect(() => {
    if (isRealGuid && data?.name) {
      updateFavorite({
        type: 'team',
        id: teamKey,
        name: data.name,
        url: pathname,
      })
    }
  }, [isRealGuid, teamKey, data?.name, pathname, updateFavorite])

  // Register players into the global search index when roster loads
  useEffect(() => {
    const players = data?.players
    if (!players || players.length === 0) return

    const playerEntities: SearchableEntity[] = players
      .filter((p) => p.playerId && (p.firstName || p.lastName))
      .map((player) => {
        const fullName = `${player.firstName} ${player.lastName}`.trim()
        return {
          type: 'player' as const,
          id: String(player.playerId),
          name: fullName,
          parentLabel: data?.name ?? teamName,
          targetView: 'playerProfile' as const,
          breadcrumbs: [],
          params: { playerId: player.playerId } as Record<string, string | number>,
        }
      })

    if (playerEntities.length > 0) {
      register(playerEntities)
    }
  }, [data?.players, data?.name, register, teamName])

  const handlePlayerClick = useCallback(
    (playerId: number) => {
      router.push(`/players/${playerId}`)
    },
    [router],
  )

  const displayName = data?.name ?? teamName

  const handleToggleFavorite = isRealGuid
    ? () => toggleFavorite({
        type: 'team',
        id: teamKey,
        name: displayName,
        url: pathname,
      })
    : undefined

  if (isRealGuid) {
    // Full roster flow for teams with GUID
    if (isLoading) return <LoadingSpinner message="Loading roster..." />
    if (error) return <ErrorMessage message={error} onRetry={refetch} />

    const players = data?.players ?? []

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {handleToggleFavorite && (
            <FavoriteButton isFavorited={isFavorite('team', teamKey)} onToggle={handleToggleFavorite} />
          )}
        </div>
        <RosterContent players={players} onPlayerClick={handlePlayerClick} />
      </div>
    )
  }

  // Fallback for teams without GUID
  const handleRetry = () => refetchFallback()

  return (
    <div className="space-y-4">
      <SimplifiedRoster
        teamName={teamName}
        playersCount={teamInfo?.playersCount}
        isLoading={isLoadingFallback}
        error={errorFallback}
        onRetry={handleRetry}
      />
    </div>
  )
}
