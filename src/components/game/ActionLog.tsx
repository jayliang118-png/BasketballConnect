'use client'

import { useActionLog } from '@/hooks/use-game'
import { useGameEvents } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameEvent } from '@/types/game'

interface ActionLogProps {
  readonly matchId: number | null
  readonly competitionId: string | null
}

function getPeriodLabel(periodId: number): string {
  if (periodId >= 1 && periodId <= 4) return `Q${periodId}`
  if (periodId === 5) return 'OT'
  return `P${periodId}`
}

function isScoring(stat: GameEvent['stat']): boolean {
  return stat.type === 'P'
}

export function ActionLog({ matchId, competitionId }: ActionLogProps) {
  const actionLog = useActionLog(matchId, competitionId)
  const eventsResult = useGameEvents(matchId)

  const isLoading = actionLog.isLoading || eventsResult.isLoading
  const error = actionLog.error || eventsResult.error
  const refetch = actionLog.refetch

  if (isLoading) return <LoadingSpinner message="Loading play-by-play..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const match = actionLog.data?.result?.[0]
  const events = eventsResult.data

  if (!events || events.length === 0) {
    return <EmptyState message="No play-by-play data available" />
  }

  const team1Id = match?.team1?.id
  const team1Name = match?.team1?.name ?? 'Team 1'
  const team2Name = match?.team2?.name ?? 'Team 2'

  // Events come in reverse chronological order from the API — show newest first
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp)

  // Group events by period
  const periodGroups: { periodId: number; events: GameEvent[] }[] = []
  let currentPeriodId: number | null = null

  for (const event of sortedEvents) {
    if (event.period.id !== currentPeriodId) {
      currentPeriodId = event.period.id
      periodGroups.push({ periodId: event.period.id, events: [] })
    }
    periodGroups[periodGroups.length - 1].events.push(event)
  }

  return (
    <div className="space-y-6">
      {/* Score header from actionLog */}
      {match && (
        <div className="card-basketball p-4 flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">{team1Name}</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-hoop-orange">{match.team1Score}</span>
            <span className="text-gray-600">-</span>
            <span className="font-mono text-xl font-bold text-jersey-blue">{match.team2Score}</span>
          </div>
          <span className="text-gray-300 font-medium">{team2Name}</span>
        </div>
      )}

      {/* Events by period */}
      {periodGroups.map((group) => (
        <div key={group.periodId}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-hoop-orange uppercase bg-hoop-orange/10 px-2 py-1 rounded">
              {getPeriodLabel(group.periodId)}
            </span>
            <div className="flex-1 h-px bg-court-border" />
          </div>

          <div className="space-y-1">
            {group.events.map((event, idx) => {
              const isTeam1 = event.teamId === team1Id
              const teamName = isTeam1 ? team1Name : team2Name
              const playerName = event.players[0]?.name ?? ''
              const scoring = isScoring(event.stat)

              return (
                <div
                  key={`${group.periodId}-${idx}`}
                  className={`flex items-start gap-3 px-4 py-2 rounded-lg text-sm ${
                    isTeam1
                      ? 'bg-hoop-orange/5 border-l-2 border-hoop-orange/30'
                      : 'bg-jersey-blue/5 border-l-2 border-jersey-blue/30'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 text-right">
                    <span className="text-xs text-gray-500 font-mono">{event.minute}&apos;</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-gray-400 mr-2">{teamName}</span>
                    <span className="text-gray-300">
                      {playerName && <span className="font-medium">{playerName}</span>}
                      {playerName && ' — '}
                      {event.stat.displayName}
                    </span>
                  </div>
                  {scoring && event.score && (
                    <span className="flex-shrink-0 text-xs font-mono text-gray-400">
                      {event.score}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
