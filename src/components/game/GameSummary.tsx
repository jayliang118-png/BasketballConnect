'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGameSummary } from '@/hooks/use-game'
import { useNavigation } from '@/hooks/use-navigation'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameSummary as GameSummaryType, GameSummaryPlayer } from '@/types/game'

interface GameSummaryProps {
  readonly matchId: number | null
  readonly competitionUniqueKey: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ENDED':
      return 'Final'
    case 'LIVE':
      return 'Live'
    case 'SCHEDULED':
      return 'Scheduled'
    default:
      return status
  }
}

type UserIdLookup = ReadonlyMap<string, number>

function buildNameKey(firstName: string, lastName: string): string {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}`
}

interface PlayerRowProps {
  readonly player: GameSummaryPlayer
  readonly index: number
  readonly userIdLookup: UserIdLookup
  readonly onPlayerClick: (userId: number, firstName: string, lastName: string) => void
}

function PlayerRow({ player, index, userIdLookup, onPlayerClick }: PlayerRowProps) {
  const firstName = player.firstName ?? ''
  const lastName = player.lastName ?? ''
  const name = `${firstName} ${lastName}`.trim() || `Player ${index + 1}`
  const nameKey = buildNameKey(firstName, lastName)
  const userId = userIdLookup.get(nameKey)

  if (userId) {
    return (
      <tr className="border-b border-court-border/50 hover:bg-court-elevated/50">
        <td className="px-4 py-2 text-gray-300 font-mono text-xs w-10">{player.shirt}</td>
        <td className="px-4 py-2">
          <button
            type="button"
            onClick={() => onPlayerClick(userId, firstName, lastName)}
            className="text-hoop-orange hover:text-hoop-orange-dark hover:underline transition-colors text-left"
          >
            {name}
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-court-border/50 hover:bg-court-elevated/50">
      <td className="px-4 py-2 text-gray-300 font-mono text-xs w-10">{player.shirt}</td>
      <td className="px-4 py-2 text-gray-200">{name}</td>
    </tr>
  )
}

interface TeamRosterTableProps {
  readonly teamName: string
  readonly players: readonly GameSummaryPlayer[]
  readonly color: 'hoop-orange' | 'jersey-blue'
  readonly userIdLookup: UserIdLookup
  readonly onPlayerClick: (userId: number, firstName: string, lastName: string) => void
}

function TeamRosterTable({ teamName, players, color, userIdLookup, onPlayerClick }: TeamRosterTableProps) {
  return (
    <div className="card-basketball overflow-hidden">
      <div className="px-4 py-3 border-b border-court-border">
        <h3 className={`text-sm font-semibold text-${color}`}>{teamName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-court-border text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Player</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <PlayerRow
                key={idx}
                player={player}
                index={idx}
                userIdLookup={userIdLookup}
                onPlayerClick={onPlayerClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function buildTeamRosters(data: GameSummaryType) {
  const team1Id = data.teamData.team1.id
  const team1Players: GameSummaryPlayer[] = []
  const team2Players: GameSummaryPlayer[] = []

  for (const player of data.playing) {
    if (player.teamId === team1Id) {
      team1Players.push(player)
    } else {
      team2Players.push(player)
    }
  }

  return { team1Players, team2Players }
}

/**
 * Fetches team rosters for both teams and builds a name→userId lookup map.
 * Uses the team detail API which returns participants with user.id (userId).
 */
function useUserIdLookup(
  team1Key: string | null,
  team2Key: string | null,
): UserIdLookup {
  const [lookup, setLookup] = useState<UserIdLookup>(new Map())

  useEffect(() => {
    if (!team1Key && !team2Key) return

    const controller = new AbortController()

    async function fetchRosters() {
      const { fetchTeamDetail } = await import('@/services/team.service')
      const results = new Map<string, number>()

      const keys = [team1Key, team2Key].filter(Boolean) as string[]

      for (const key of keys) {
        if (controller.signal.aborted) return
        try {
          const raw = await fetchTeamDetail(key) as Record<string, unknown>
          const participants = (raw.participants ?? raw.players) as readonly Record<string, unknown>[] | undefined
          if (!participants) continue

          for (const p of participants) {
            const user = p.user as Record<string, unknown> | undefined
            if (user) {
              const id = user.id as number | undefined
              const firstName = (user.firstName as string) ?? ''
              const lastName = (user.lastName as string) ?? ''
              if (id && (firstName || lastName)) {
                results.set(buildNameKey(firstName, lastName), id)
              }
            } else {
              // Fallback: check for playerId/firstName/lastName directly
              const id = (p.playerId ?? p.id) as number | undefined
              const firstName = (p.firstName as string) ?? ''
              const lastName = (p.lastName as string) ?? ''
              if (id && (firstName || lastName)) {
                results.set(buildNameKey(firstName, lastName), id)
              }
            }
          }
        } catch {
          // Silently skip failed roster fetches
        }
      }

      if (!controller.signal.aborted) {
        setLookup(results)
      }
    }

    fetchRosters()

    return () => {
      controller.abort()
    }
  }, [team1Key, team2Key])

  return lookup
}

export function GameSummary({ matchId, competitionUniqueKey }: GameSummaryProps) {
  const { data, isLoading, error, refetch } = useGameSummary(matchId, competitionUniqueKey)
  const { navigateTo, state } = useNavigation()

  const rosters = useMemo(() => {
    if (!data) return null
    return buildTeamRosters(data)
  }, [data])

  const team1Key = data?.teamData?.team1?.teamUniqueKey ?? null
  const team2Key = data?.teamData?.team2?.teamUniqueKey ?? null
  const userIdLookup = useUserIdLookup(team1Key, team2Key)

  const handlePlayerClick = useCallback(
    (userId: number, firstName: string, lastName: string) => {
      navigateTo('playerProfile', {
        ...state.params,
        userId,
      }, `${firstName} ${lastName}`)
    },
    [navigateTo, state.params],
  )

  if (isLoading) return <LoadingSpinner message="Loading game summary..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No game summary available" />

  const { teamData, matchData } = data
  const { team1, team2 } = teamData

  return (
    <div className="space-y-6">
      {/* Match info */}
      <div className="card-basketball p-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
        <span className={`font-semibold uppercase ${matchData.matchStatus === 'LIVE' ? 'text-stat-red' : 'text-stat-green'}`}>
          {getStatusLabel(matchData.matchStatus)}
        </span>
        {matchData.competitionName && <span>{matchData.competitionName}</span>}
        {matchData.startTime && <span>{formatDate(matchData.startTime)}</span>}
        {matchData.venueName && (
          <span>
            {matchData.venueName}
            {matchData.venueCourtName ? ` — ${matchData.venueCourtName}` : ''}
          </span>
        )}
      </div>

      {/* Score header */}
      <div className="card-basketball p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-sm text-gray-400 mb-1">{team1.name}</p>
            <p className="font-mono text-4xl font-bold text-hoop-orange animate-score-pop">
              {matchData.team1Score}
            </p>
          </div>
          <div className="px-4">
            <span className="text-sm font-bold text-gray-600">VS</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-sm text-gray-400 mb-1">{team2.name}</p>
            <p className="font-mono text-4xl font-bold text-jersey-blue animate-score-pop">
              {matchData.team2Score}
            </p>
          </div>
        </div>
      </div>

      {/* Team rosters — side by side */}
      {rosters && (rosters.team1Players.length > 0 || rosters.team2Players.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rosters.team1Players.length > 0 && (
            <TeamRosterTable
              teamName={team1.name}
              players={rosters.team1Players}
              color="hoop-orange"
              userIdLookup={userIdLookup}
              onPlayerClick={handlePlayerClick}
            />
          )}
          {rosters.team2Players.length > 0 && (
            <TeamRosterTable
              teamName={team2.name}
              players={rosters.team2Players}
              color="jersey-blue"
              userIdLookup={userIdLookup}
              onPlayerClick={handlePlayerClick}
            />
          )}
        </div>
      )}
    </div>
  )
}
