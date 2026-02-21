'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useGameSummary, useScoringByPlayer } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameSummary as GameSummaryType, GameSummaryPlayer } from '@/types/game'

interface GameSummaryProps {
  readonly matchId: number | null
  readonly competitionUniqueKey: string | null
  readonly competitionId: number | null
}

interface ShotStat {
  readonly made: number
  readonly attempted: number
}

interface PlayerGameStats {
  readonly playerId: number
  readonly pts: number
  readonly ft: ShotStat
  readonly twoPt: ShotStat
  readonly threePt: ShotStat
  readonly pf: number
  readonly tf: number
}

const EMPTY_SHOT: ShotStat = { made: 0, attempted: 0 }
const EMPTY_STATS: PlayerGameStats = { playerId: 0, pts: 0, ft: EMPTY_SHOT, twoPt: EMPTY_SHOT, threePt: EMPTY_SHOT, pf: 0, tf: 0 }

type PlayerStatsMap = ReadonlyMap<string, PlayerGameStats>

function buildPlayerStatsKey(shirt: string, teamId: number): string {
  return `${teamId}:${shirt}`
}

/**
 * Maps the scoringByPlayer API response into a PlayerStatsMap keyed by "teamId:shirt".
 * API fields: totalPts, FTMade, FTMiss, 2PMade, 2PMiss, 3PMade, 3PMiss, PF, TF, shirt, teamId
 */
function mapScoringByPlayer(rows: readonly Record<string, unknown>[]): PlayerStatsMap {
  const map = new Map<string, PlayerGameStats>()

  for (const row of rows) {
    const shirt = String(row.shirt ?? '')
    const teamId = Number(row.teamId ?? 0)
    if (!shirt || !teamId) continue

    const key = buildPlayerStatsKey(shirt, teamId)

    const ftMade = Number(row.FTMade ?? 0)
    const ftMiss = Number(row.FTMiss ?? 0)
    const twoPMade = Number(row['2PMade'] ?? 0)
    const twoPMiss = Number(row['2PMiss'] ?? 0)
    const threePMade = Number(row['3PMade'] ?? 0)
    const threePMiss = Number(row['3PMiss'] ?? 0)

    map.set(key, {
      playerId: Number(row.playerId ?? 0),
      pts: Number(row.totalPts ?? 0),
      ft: { made: ftMade, attempted: ftMade + ftMiss },
      twoPt: { made: twoPMade, attempted: twoPMade + twoPMiss },
      threePt: { made: threePMade, attempted: threePMade + threePMiss },
      pf: Number(row.PF ?? 0),
      tf: Number(row.TF ?? 0),
    })
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

interface PlayerRowProps {
  readonly player: GameSummaryPlayer
  readonly index: number
  readonly teamId: number
  readonly stats: PlayerStatsMap
  readonly competitionUniqueKey: string | null
}

function formatShot(shot: ShotStat): string {
  return `${shot.made} - ${shot.attempted}`
}

function PlayerRow({ player, index, teamId, stats, competitionUniqueKey }: PlayerRowProps) {
  const firstName = player.firstName ?? ''
  const lastName = player.lastName ?? ''
  const name = `${firstName} ${lastName}`.trim() || `Player ${index + 1}`

  const s = stats.get(buildPlayerStatsKey(player.shirt, teamId)) ?? EMPTY_STATS

  // playerId comes directly from the scoringByPlayer API response
  const playerHref = s.playerId
    ? `/players/${s.playerId}${competitionUniqueKey ? `?compKey=${encodeURIComponent(competitionUniqueKey)}` : ''}`
    : undefined

  const nameCell = playerHref ? (
    <Link
      href={playerHref}
      className="text-hoop-orange hover:text-hoop-orange-dark hover:underline transition-colors"
    >
      {name}
    </Link>
  ) : (
    <span className="text-gray-200">{name}</span>
  )

  return (
    <tr className="border-b border-court-border/50 hover:bg-court-elevated/50">
      <td className="px-2 py-2 text-gray-300 font-mono text-xs w-8 text-center">{player.shirt}</td>
      <td className="px-2 py-2">{nameCell}</td>
      <td className="px-1 py-2 text-center text-hoop-orange font-mono font-semibold text-xs">{s.pts}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{formatShot(s.ft)}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{formatShot(s.twoPt)}</td>
      <td className="px-1 py-2 text-center text-gray-300 font-mono text-xs">{formatShot(s.threePt)}</td>
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
  readonly competitionUniqueKey: string | null
}

function TeamRosterTable({ teamName, teamId, players, color, stats, competitionUniqueKey }: TeamRosterTableProps) {
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
                competitionUniqueKey={competitionUniqueKey}
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

export function GameSummary({ matchId, competitionUniqueKey, competitionId }: GameSummaryProps) {
  const { data, isLoading, error, refetch } = useGameSummary(matchId, competitionUniqueKey)
  const { data: scoringRows } = useScoringByPlayer(competitionId, matchId)

  const rosters = useMemo(() => {
    if (!data) return null
    return buildTeamRosters(data)
  }, [data])

  const playerStats = useMemo<PlayerStatsMap>(
    () => (scoringRows ? mapScoringByPlayer(scoringRows) : new Map()),
    [scoringRows],
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
              competitionUniqueKey={competitionUniqueKey}
            />
          )}
          {rosters.team2Players.length > 0 && (
            <TeamRosterTable
              teamName={team2.name}
              teamId={team2.id}
              players={rosters.team2Players}
              color="jersey-blue"
              stats={playerStats}
              competitionUniqueKey={competitionUniqueKey}
            />
          )}
        </div>
      )}
    </div>
  )
}
