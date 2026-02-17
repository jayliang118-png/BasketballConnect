'use client'

import { useCallback } from 'react'
import { useTeamDetail } from '@/hooks/use-teams'
import { useNavigation } from '@/hooks/use-navigation'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

function TeamInfoCard({ name }: { readonly name: string }) {
  return (
    <div className="space-y-4">
      <div className="card-basketball p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-jersey-blue/20 to-stat-green/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-jersey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">{name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Detailed roster information is not available for this team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamRoster() {
  const { state, navigateTo } = useNavigation()
  const teamUniqueKey = state.params.teamUniqueKey as string | undefined
  const teamName = state.params.teamName as string | undefined

  const { data, isLoading, error, refetch } = useTeamDetail(teamUniqueKey ?? null)

  const handlePlayerClick = useCallback(
    (playerId: number, firstName: string, lastName: string) => {
      navigateTo('playerProfile', {
        ...state.params,
        playerId,
      }, `${firstName} ${lastName}`)
    },
    [navigateTo, state.params]
  )

  if (!teamUniqueKey) {
    return <TeamInfoCard name={teamName ?? 'Unknown Team'} />
  }

  if (isLoading) return <LoadingSpinner message="Loading team roster..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No team data found" icon="team" />

  const players = data.players ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">{data.name ?? 'Team Roster'}</h2>
        <span className="text-xs text-gray-500">{players.length} players</span>
      </div>

      {players.length === 0 ? (
        <EmptyState message="No players in this roster" icon="team" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((player) => (
            <Card
              key={player.playerId}
              onClick={() => handlePlayerClick(player.playerId, player.firstName, player.lastName)}
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
      )}
    </div>
  )
}
