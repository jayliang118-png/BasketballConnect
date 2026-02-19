'use client'

import { useMemo } from 'react'
import { usePlayer } from '@/hooks/use-player'
import { useNavigation } from '@/hooks/use-navigation'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import { PlayerStats } from './PlayerStats'

interface ProfileCompetition {
  readonly competitionId: number
  readonly competitionUniqueKey: string
  readonly longName: string
  readonly isPublicStats: number
}

export function PlayerProfile() {
  const { state } = useNavigation()
  const playerId = state.params.playerId as number | undefined
  const userId = state.params.userId as number | undefined
  const { data, isLoading, error, refetch } = usePlayer(playerId ?? null, userId ?? null)

  const competitions = useMemo<readonly ProfileCompetition[]>(() => {
    if (!data) return []
    const raw = (data.competitions as readonly Record<string, unknown>[]) ?? []
    return raw.map((c) => ({
      competitionId: (c.competitionId as number) ?? 0,
      competitionUniqueKey: (c.competitionUniqueKey as string) ?? '',
      longName: (c.longName as string) ?? '',
      isPublicStats: (c.isPublicStats as number) ?? 0,
    }))
  }, [data])

  if (isLoading) return <LoadingSpinner message="Loading player profile..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="Player not found" />

  const firstName = (data.firstName as string) ?? ''
  const lastName = (data.lastName as string) ?? ''
  const photoUrl = data.photoUrl as string | undefined
  const dateOfBirth = data.dateOfBirth as string | undefined
  const teams = (data.teams as readonly Record<string, unknown>[]) ?? []
  const resolvedUserId = (data.id as number) ?? (data.userId as number) ?? playerId

  return (
    <div className="space-y-6">
      {/* Player header */}
      <div className="card-basketball p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-hoop-orange/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-hoop-orange/30 to-jersey-blue/30 flex items-center justify-center border-2 border-hoop-orange/30 shadow-lg">
                <span className="text-2xl font-bold text-hoop-orange">
                  {`${firstName[0] ?? ''}${lastName[0] ?? ''}`}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-100">
              {firstName} {lastName}
            </h2>
            {dateOfBirth && (
              <p className="text-sm text-gray-500 mt-1">Born: {dateOfBirth}</p>
            )}
            {teams.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {teams.map((team, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-jersey-blue/10 text-jersey-blue px-2 py-1 rounded-full border border-jersey-blue/20"
                  >
                    {(team.teamName as string) ?? 'Unknown Team'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats section */}
      {resolvedUserId && (
        <PlayerStats userId={resolvedUserId} competitions={competitions} />
      )}
    </div>
  )
}
