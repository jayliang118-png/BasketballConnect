'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { PlayerStats } from './PlayerStats'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { useFavorites } from '@/hooks/use-favorites'

interface ProfileCompetition {
  readonly competitionId: number
  readonly competitionUniqueKey: string
  readonly longName: string
  readonly isPublicStats: number
}

interface PlayerProfileViewProps {
  readonly player: {
    readonly id: number
    readonly firstName: string
    readonly lastName: string
    readonly photoUrl?: string | null
    readonly teams: readonly Record<string, unknown>[]
    readonly [key: string]: unknown
  }
}

export function PlayerProfileView({ player }: PlayerProfileViewProps) {
  const firstName = player.firstName ?? ''
  const lastName = player.lastName ?? ''
  const photoUrl = player.photoUrl as string | undefined
  const dateOfBirth = player.dateOfBirth as string | undefined
  const teams = player.teams ?? []
  const userId = player.id ?? (player.userId as number | undefined)
  const pathname = usePathname()
  const { isFavorite, toggleFavorite } = useFavorites()

  const playerId = String(userId ?? player.id)
  const fullName = `${firstName} ${lastName}`.trim()

  const competitions = useMemo<readonly ProfileCompetition[]>(() => {
    const raw = (player.competitions as readonly Record<string, unknown>[]) ?? []
    return raw.map((c) => ({
      competitionId: (c.competitionId as number) ?? 0,
      competitionUniqueKey: (c.competitionUniqueKey as string) ?? '',
      longName: (c.longName as string) ?? '',
      isPublicStats: (c.isPublicStats as number) ?? 0,
    }))
  }, [player.competitions])

  return (
    <div className="space-y-6 animate-fade-up">
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
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-100">
                {firstName} {lastName}
              </h2>
              <FavoriteButton
                isFavorited={isFavorite('player', playerId)}
                onToggle={() => toggleFavorite({
                  type: 'player',
                  id: playerId,
                  name: fullName,
                  url: pathname,
                })}
              />
            </div>
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
      {userId && (
        <PlayerStats userId={userId} competitions={competitions} />
      )}
    </div>
  )
}
