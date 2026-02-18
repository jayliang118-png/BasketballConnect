'use client'

import { useMemo } from 'react'
import { useGameSummary } from '@/hooks/use-game'
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

interface PlayerRowProps {
  readonly player: GameSummaryPlayer
  readonly index: number
}

function PlayerRow({ player, index }: PlayerRowProps) {
  const name = `${player.firstName} ${player.lastName}`.trim() || `Player ${index + 1}`

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
}

function TeamRosterTable({ teamName, players, color }: TeamRosterTableProps) {
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
              <PlayerRow key={idx} player={player} index={idx} />
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

export function GameSummary({ matchId, competitionUniqueKey }: GameSummaryProps) {
  const { data, isLoading, error, refetch } = useGameSummary(matchId, competitionUniqueKey)

  const rosters = useMemo(() => {
    if (!data) return null
    return buildTeamRosters(data)
  }, [data])

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

      {/* Team rosters */}
      {rosters && rosters.team1Players.length > 0 && (
        <TeamRosterTable teamName={team1.name} players={rosters.team1Players} color="hoop-orange" />
      )}
      {rosters && rosters.team2Players.length > 0 && (
        <TeamRosterTable teamName={team2.name} players={rosters.team2Players} color="jersey-blue" />
      )}
    </div>
  )
}
