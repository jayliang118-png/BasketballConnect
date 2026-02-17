'use client'

import { useGameEvents } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

interface GameEventsProps {
  readonly matchId: number | null
}

export function GameEvents({ matchId }: GameEventsProps) {
  const { data, isLoading, error, refetch } = useGameEvents(matchId)

  if (isLoading) return <LoadingSpinner message="Loading events..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No events available" />

  const events = Array.isArray(data) ? data : (data.events as unknown[]) ?? []

  if (events.length === 0) {
    return <EmptyState message="No events recorded for this game" />
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-court-border" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const entry = event as Record<string, unknown>
          const type = entry.type ?? entry.eventType ?? 'Event'
          const description = entry.description ?? entry.text ?? ''
          const time = entry.time ?? entry.gameTime ?? ''

          return (
            <div key={index} className="relative flex items-start gap-4 pl-8">
              {/* Timeline dot */}
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-hoop-orange border-2 border-court-dark" />

              <div className="card-basketball p-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-hoop-orange uppercase">
                    {String(type)}
                  </span>
                  {time && (
                    <span className="text-xs text-gray-500 font-mono">{String(time)}</span>
                  )}
                </div>
                {description && (
                  <p className="text-sm text-gray-300">{String(description)}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
