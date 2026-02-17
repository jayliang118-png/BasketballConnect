'use client'

import { Card } from '@/components/common/Card'

interface MatchTeamInfo {
  readonly teamName?: string
  readonly score?: number
}

interface MatchCardProps {
  readonly team1: MatchTeamInfo
  readonly team2: MatchTeamInfo
  readonly startTime?: string
  readonly venueName?: string
  readonly onClick: () => void
}

function formatMatchTime(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timeStr
  }
}

export function MatchCard({ team1, team2, startTime, venueName, onClick }: MatchCardProps) {
  const hasScores = team1.score !== undefined && team2.score !== undefined
  const team1Won = hasScores && (team1.score ?? 0) > (team2.score ?? 0)
  const team2Won = hasScores && (team2.score ?? 0) > (team1.score ?? 0)

  return (
    <Card onClick={onClick} className="group">
      <div className="space-y-3">
        {/* Teams and scores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium truncate ${team1Won ? 'text-stat-green' : 'text-gray-200'}`}>
              {team1.teamName ?? 'TBD'}
            </span>
            {hasScores && (
              <span className={`font-mono text-lg font-bold ${team1Won ? 'text-stat-green' : 'text-gray-400'}`}>
                {team1.score}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium truncate ${team2Won ? 'text-stat-green' : 'text-gray-200'}`}>
              {team2.teamName ?? 'TBD'}
            </span>
            {hasScores && (
              <span className={`font-mono text-lg font-bold ${team2Won ? 'text-stat-green' : 'text-gray-400'}`}>
                {team2.score}
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-court-border/50 pt-2">
          {startTime && <span>{formatMatchTime(startTime)}</span>}
          {venueName && <span className="truncate">{venueName}</span>}
        </div>
      </div>
    </Card>
  )
}
