'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGameSummary, useGameEvents } from '@/hooks/use-game'
import { useNavigation } from '@/hooks/use-navigation'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameSummary as GameSummaryType, GameSummaryPlayer, GameEvent } from '@/types/game'

interface GameSummaryProps {
  readonly matchId: number | null
  readonly competitionUniqueKey: string | null
}

interface PlayerGameStats {
  readonly pts: number
  readonly ft: number
  readonly twoPt: number
  readonly threePt: number
  readonly pf: number
  readonly tf: number
}

const EMPTY_STATS: PlayerGameStats = { pts: 0, ft: 0, twoPt: 0, threePt: 0, pf: 0, tf: 0 }

type PlayerStatsMap = ReadonlyMap<string, PlayerGameStats>

function buildPlayerStatsKey(shirt: string, teamId: number): string {
  return `${teamId}:${shirt}`
}

/**
 * Aggregates game events into per-player stat totals keyed by "teamId:shirt".
 * Stat displayName values observed: "2 Points Made", "3 Points Made",
 * "Free Throw Made", "2 Points Missed", "3 Points Missed", "Free Throw Missed"
 * Stat type: "P" = scoring, "PF" = personal foul, "TF" = technical foul
 */
function aggregatePlayerStats(events: readonly GameEvent[]): PlayerStatsMap {
  const map = new Map<string, { pts: number; ft: number; twoPt: number; threePt: number; pf: number; tf: number }>()

  for (const event of events) {
    const player = event.players[0]
    if (!player) continue

    const key = buildPlayerStatsKey(player.shirt, event.teamId)
    const current = map.get(key) ?? { pts: 0, ft: 0, twoPt: 0, threePt: 0, pf: 0, tf: 0 }

    const display = event.stat.displayName.toLowerCase()
    const statType = event.stat.type

    if (display.includes('2 points') && display.includes('made')) {
      map.set(key, { ...current, twoPt: current.twoPt + 1, pts: current.pts + 2 })
    } else if (display.includes('3 points') && display.includes('made')) {
      map.set(key, { ...current, threePt: current.threePt + 1, pts: current.pts + 3 })
    } else if (display.includes('free throw') && display.includes('made')) {
      map.set(key, { ...current, ft: current.ft + 1, pts: current.pts + 1 })
    } else if (statType === 'TF') {
      map.set(key, { ...current, tf: current.tf + 1 })
    } else if (statType === 'PF') {
      map.set(key, { ...current, pf: current.pf + 1 })
    }
  }

  return map
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
  readonly teamId: number
  readonly stats: PlayerStatsMap
  readonly userIdLookup: UserIdLookup
  readonly onPlayerClick: (userId: number, firstName: string, lastName: string) => void
}

function PlayerRow({ player, index, teamId, stats, userIdLookup, onPlayerClick }: PlayerRowProps) {
  const firstName = player.firstName ?? ''
  const lastName = player.lastName ?? ''
  const name = `${firstName} ${lastName}`.trim() || `Player ${index + 1}`
  const nameKey = buildNameKey(firstName, lastName)
  const userId = userIdLookup.get(nameKey)
  const s = stats.get(buildPlayerStatsKey(player.shirt, teamId)) ?? EMPTY_STATS

  const nameCell = userId ? (
    <button
      type="button"
      onClick={() => onPlayerClick(userId, firstName, lastName)}
      className="text-hoop-orange hover:text-hoop-orange-dark hover:underline transition-colors text-left"
    >
      {name}
    </button>
  ) : (
    <span className="text-gray-200">{name}</span>
  )

  return (
    <tr className="border-b border-court-border/50 hover:bg-court-elevated/50">
      <td className="px-2 py-2 text-gray-300 font-mono text-xs w-8 text-center">{player.shirt}</td>
      <td className="px-2 py-2">{nameCell}</td>
      <td className="px-1 py-2 text-center text-hoop-orange font-mono font-semibold text-xs">{s.pts}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{s.ft}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{s.twoPt}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{s.threePt}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{s.pf}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{s.tf}</td>
    </tr>
  )
}

interface TeamRosterTableProps {
  readonly teamName: string
  readonly teamId: number
  readonly players: readonly GameSummaryPlayer[]
  readonly color: 'hoop-orange' | 'jersey-blue'
  readonly stats: PlayerStatsMap
  readonly userIdLookup: UserIdLookup
  readonly onPlayerClick: (userId: number, firstName: string, lastName: string) => void
}

function TeamRosterTable({ teamName, teamId, players, color, stats, userIdLookup, onPlayerClick }: TeamRosterTableProps) {
  return (
    <div className="card-basketball overflow-hidden">
      <div className="px-4 py-3 border-b border-court-border">
        <h3 className={`text-sm font-semibold text-${color}`}>{teamName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-court-border text-gray-500 text-xs uppercase">
              <th className="text-center px-2 py-2 w-8">No.</th>
              <th className="text-left px-2 py-2">Player</th>
              <th className="text-center px-1 py-2">PTS</th>
              <th className="text-center px-1 py-2">FT</th>
              <th className="text-center px-1 py-2">2P</th>
              <th className="text-center px-1 py-2">3P</th>
              <th className="text-center px-1 py-2">PF</th>
              <th className="text-center px-1 py-2">TF</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <PlayerRow
                key={idx}
                player={player}
                index={idx}
                teamId={teamId}
                stats={stats}
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
  const { data: events } = useGameEvents(matchId)
  const { navigateTo, state } = useNavigation()

  const rosters = useMemo(() => {
    if (!data) return null
    return buildTeamRosters(data)
  }, [data])

  const playerStats = useMemo<PlayerStatsMap>(
    () => (events ? aggregatePlayerStats(events) : new Map()),
    [events],
  )

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rosters.team1Players.length > 0 && (
            <TeamRosterTable
              teamName={team1.name}
              teamId={team1.id}
              players={rosters.team1Players}
              color="hoop-orange"
              stats={playerStats}
              userIdLookup={userIdLookup}
              onPlayerClick={handlePlayerClick}
            />
          )}
          {rosters.team2Players.length > 0 && (
            <TeamRosterTable
              teamName={team2.name}
              teamId={team2.id}
              players={rosters.team2Players}
              color="jersey-blue"
              stats={playerStats}
              userIdLookup={userIdLookup}
              onPlayerClick={handlePlayerClick}
            />
          )}
        </div>
      )}
    </div>
  )
}
