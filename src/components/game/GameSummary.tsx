'use client'

import { useGameSummary } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import { StatBadge } from '@/components/common/StatBadge'

interface GameSummaryProps {
  readonly matchId: number | null
  readonly competitionUniqueKey: string | null
}

export function GameSummary({ matchId, competitionUniqueKey }: GameSummaryProps) {
  const { data, isLoading, error, refetch } = useGameSummary(matchId, competitionUniqueKey)

  if (isLoading) return <LoadingSpinner message="Loading game summary..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No game summary available" />

  const team1Name = (data.team1Name as string) ?? 'Team 1'
  const team2Name = (data.team2Name as string) ?? 'Team 2'
  const team1Score = (data.team1Score as number) ?? 0
  const team2Score = (data.team2Score as number) ?? 0

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="card-basketball p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-sm text-gray-400 mb-1">{team1Name}</p>
            <p className="font-mono text-4xl font-bold text-hoop-orange animate-score-pop">
              {team1Score}
            </p>
          </div>
          <div className="px-4">
            <span className="text-sm font-bold text-gray-600">VS</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-sm text-gray-400 mb-1">{team2Name}</p>
            <p className="font-mono text-4xl font-bold text-jersey-blue animate-score-pop">
              {team2Score}
            </p>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <StatBadge label="FG%" value={data.team1FgPct as string ?? '-'} color="orange" />
        <StatBadge label="3PT" value={data.team1ThreePointers as number ?? 0} color="blue" />
        <StatBadge label="FT" value={data.team1FreeThrows as number ?? 0} color="green" />
        <StatBadge label="FG%" value={data.team2FgPct as string ?? '-'} color="orange" />
        <StatBadge label="3PT" value={data.team2ThreePointers as number ?? 0} color="blue" />
        <StatBadge label="FT" value={data.team2FreeThrows as number ?? 0} color="green" />
      </div>

      {/* Raw data display for unmapped fields - development only */}
      {process.env.NODE_ENV === 'development' && Object.keys(data).length > 0 && (
        <details className="card-basketball p-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300">
            View raw data
          </summary>
          <pre className="mt-3 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
