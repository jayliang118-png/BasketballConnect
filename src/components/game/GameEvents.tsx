'use client'

import { useGameEvents } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameEvent } from '@/types/game'

interface GameEventsProps {
  readonly matchId: number | null
}

function getPeriodLabel(periodId: number): string {
  if (periodId >= 1 && periodId <= 4) return `Q${periodId}`
  if (periodId === 5) return 'OT'
  return `P${periodId}`
}

function getEventIcon(statType: string): string {
  switch (statType) {
    case 'P':
      return '\u{1F3C0}' // basketball
    case 'PF':
      return '\u26A0\uFE0F' // warning (foul)
    default:
      return '\u25CF' // bullet
  }
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

function groupByPeriod(events: readonly GameEvent[]): Map<number, GameEvent[]> {
  const map = new Map<number, GameEvent[]>()

  // Sort oldest first for timeline view
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp)

  for (const event of sorted) {
    const pid = event.period.id
    const existing = map.get(pid)
    if (existing) {
      existing.push(event)
    } else {
      map.set(pid, [event])
    }
  }

  return map
}

export function GameEvents({ matchId }: GameEventsProps) {
  const { data, isLoading, error, refetch } = useGameEvents(matchId)

  if (isLoading) return <LoadingSpinner message="Loading events..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No events recorded for this game" />

  const grouped = groupByPeriod(data)
  const periods = Array.from(grouped.entries()).sort(([a], [b]) => a - b)

  return (
    <div className="space-y-6">
      {periods.map(([periodId, events]) => (
        <div key={periodId}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-hoop-orange uppercase bg-hoop-orange/10 px-2 py-1 rounded">
              {getPeriodLabel(periodId)}
            </span>
            <span className="text-xs text-gray-500">{events.length} events</span>
            <div className="flex-1 h-px bg-court-border" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-court-border" />

            <div className="space-y-2">
              {events.map((event, index) => {
                const playerName = event.players[0]?.name ?? ''
                const shirt = event.players[0]?.shirt ?? ''

                return (
                  <div key={`${periodId}-${index}`} className="relative flex items-start gap-4 pl-8">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-hoop-orange border-2 border-court-dark" />

                    <div className="card-basketball p-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {event.minute}&apos; &middot; {formatTimestamp(event.timestamp)}
                        </span>
                        {event.score && (
                          <span className="text-xs font-mono font-semibold text-hoop-orange">
                            {event.score}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{getEventIcon(event.stat.type)}</span>
                        <span className="text-sm text-gray-300">
                          <span className="font-semibold text-gray-200">{event.stat.displayName}</span>
                          {playerName && (
                            <span className="text-gray-400">
                              {' — '}
                              {playerName}
                              {shirt && <span className="text-gray-500"> #{shirt}</span>}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
