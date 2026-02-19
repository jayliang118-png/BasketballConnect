'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTeamDetail } from '@/hooks/use-teams'
import { useNavigation } from '@/hooks/use-navigation'
import { useFavorites } from '@/hooks/use-favorites'
import { useGlobalSearchIndex } from '@/hooks/use-global-search-index'
import { FavoriteButton } from './FavoriteButton'
import { TeamFixtures } from './TeamFixtures'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

type TeamTab = 'fixtures' | 'roster'

const TABS: readonly { readonly key: TeamTab; readonly label: string }[] = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'roster', label: 'Roster' },
]

interface TeamContextInfo {
  readonly organisation?: string
  readonly competition?: string
  readonly division?: string
}

function extractTeamContext(breadcrumbs: readonly { readonly label: string }[]): TeamContextInfo {
  // Breadcrumb order: Home(0) > Org(1) > Competition(2) > Division(3) > Team(4)
  return {
    organisation: breadcrumbs[1]?.label,
    competition: breadcrumbs[2]?.label,
    division: breadcrumbs[3]?.label,
  }
}

interface TeamHeaderProps {
  readonly name: string
  readonly teamUniqueKey?: string
  readonly isFavorited: boolean
  readonly onToggleFavorite?: () => void
  readonly context: TeamContextInfo
}

function TeamHeader({ name, teamUniqueKey, isFavorited, onToggleFavorite, context }: TeamHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-100">{name}</h2>
        {teamUniqueKey && onToggleFavorite && (
          <FavoriteButton isFavorited={isFavorited} onToggle={onToggleFavorite} />
        )}
      </div>
      {(context.organisation || context.competition || context.division) && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {context.organisation && (
            <span className="text-xs text-gray-400">{context.organisation}</span>
          )}
          {context.organisation && context.competition && (
            <span className="text-xs text-gray-600">/</span>
          )}
          {context.competition && (
            <span className="text-xs text-gray-400">{context.competition}</span>
          )}
          {context.competition && context.division && (
            <span className="text-xs text-gray-600">/</span>
          )}
          {context.division && (
            <span className="text-xs text-gray-400">{context.division}</span>
          )}
        </div>
      )}
    </div>
  )
}

interface RosterContentProps {
  readonly players: readonly { readonly playerId: number; readonly firstName: string; readonly lastName: string }[]
  readonly onPlayerClick: (playerId: number, firstName: string, lastName: string) => void
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
          onClick={() => onPlayerClick(player.playerId, player.firstName, player.lastName)}
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

export function TeamRoster() {
  const [activeTab, setActiveTab] = useState<TeamTab>('fixtures')
  const { state, navigateTo } = useNavigation()
  const teamUniqueKey = state.params.teamUniqueKey as string | undefined
  const teamName = state.params.teamName as string | undefined
  const { isFavorite, toggleFavorite, updateFavorite } = useFavorites()
  const teamContext = extractTeamContext(state.breadcrumbs)

  // Auto-update favorite with full context when visiting through hierarchy
  // updateFavorite is a no-op if the team isn't a favorite, so no need for isFavorite check
  const hasFullContext = state.params.competitionId !== undefined && state.params.divisionId !== undefined
  useEffect(() => {
    if (teamUniqueKey && hasFullContext) {
      updateFavorite({
        teamUniqueKey,
        name: teamName ?? 'Unknown',
        breadcrumbs: state.breadcrumbs,
        params: state.params,
      })
    }
  }, [teamUniqueKey, hasFullContext, updateFavorite, teamName, state.breadcrumbs, state.params])

  // Only fetch detail when we have a real GUID (not a fallback team-<id> key)
  const isRealGuid = teamUniqueKey ? !teamUniqueKey.startsWith('team-') : false
  const { data, isLoading, error, refetch } = useTeamDetail(isRealGuid ? (teamUniqueKey ?? null) : null)
  const { register } = useGlobalSearchIndex()

  // Register players into the global search index when roster loads
  useEffect(() => {
    const players = data?.players
    if (!players || players.length === 0) return

    const orgLabel = state.breadcrumbs[1]?.label ?? ''
    const compLabel = state.breadcrumbs[2]?.label ?? ''
    const divLabel = state.breadcrumbs[3]?.label ?? ''
    const teamLabel = state.breadcrumbs[4]?.label ?? teamName ?? ''
    const parentLabel = [orgLabel, compLabel, divLabel, teamLabel].filter(Boolean).join(' > ')

    const entities: SearchableEntity[] = players.map((player) => {
      const fullName = `${player.firstName} ${player.lastName}`.trim()
      const params = {
        ...state.params,
        playerId: player.playerId,
      }
      return {
        type: 'player' as const,
        id: String(player.playerId),
        name: fullName,
        parentLabel,
        targetView: 'playerProfile' as const,
        breadcrumbs: [
          ...state.breadcrumbs,
          { label: fullName, view: 'playerProfile' as const, params },
        ],
        params,
      }
    })

    register(entities)
  }, [data?.players, register, state.breadcrumbs, state.params, teamName])

  const handlePlayerClick = useCallback(
    (playerId: number, firstName: string, lastName: string) => {
      navigateTo('playerProfile', {
        ...state.params,
        playerId,
      }, `${firstName} ${lastName}`)
    },
    [navigateTo, state.params]
  )

  const handleToggleFavorite = teamUniqueKey
    ? () => toggleFavorite({
        teamUniqueKey,
        name: data?.name ?? teamName ?? 'Unknown',
        breadcrumbs: state.breadcrumbs,
        params: state.params,
      })
    : undefined

  const displayName = data?.name ?? teamName ?? 'Unknown Team'
  const players = data?.players ?? []

  return (
    <div className="space-y-4">
      <TeamHeader
        name={displayName}
        teamUniqueKey={teamUniqueKey}
        isFavorited={teamUniqueKey ? isFavorite(teamUniqueKey) : false}
        onToggleFavorite={handleToggleFavorite}
        context={teamContext}
      />

      {/* Tab bar */}
      <div className="flex border-b border-court-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-hoop-orange'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            type="button"
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hoop-orange rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-up">
        {activeTab === 'fixtures' && <TeamFixtures />}
        {activeTab === 'roster' && (
          isLoading ? <LoadingSpinner message="Loading roster..." /> :
          error ? <ErrorMessage message={error} onRetry={refetch} /> :
          !isRealGuid ? <EmptyState message="Detailed roster information is not available for this team" icon="team" /> :
          <RosterContent players={players} onPlayerClick={handlePlayerClick} />
        )}
      </div>
    </div>
  )
}
