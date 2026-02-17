'use client'

import { useActionLog } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

interface ActionLogProps {
  readonly matchId: number | null
  readonly competitionId: string | null
}

export function ActionLog({ matchId, competitionId }: ActionLogProps) {
  const { data, isLoading, error, refetch } = useActionLog(matchId, competitionId)

  if (isLoading) return <LoadingSpinner message="Loading play-by-play..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No play-by-play data available" />

  const actions = Array.isArray(data) ? data : (data.actions as unknown[]) ?? []

  if (actions.length === 0) {
    return <EmptyState message="No actions recorded for this game" />
  }

  return (
    <div className="space-y-1">
      {actions.map((action, index) => {
        const entry = action as Record<string, unknown>
        const period = entry.period ?? entry.quarter ?? ''
        const time = entry.time ?? entry.gameTime ?? ''
        const description = entry.description ?? entry.action ?? entry.text ?? JSON.stringify(entry)
        const teamName = entry.teamName ?? ''
        const isTeam1 = (entry.teamId as number) === 1 || (entry.isHome as boolean)

        return (
          <div
            key={index}
            className={`flex items-start gap-3 px-4 py-2 rounded-lg text-sm ${
              isTeam1
                ? 'bg-hoop-orange/5 border-l-2 border-hoop-orange/30'
                : 'bg-jersey-blue/5 border-l-2 border-jersey-blue/30'
            }`}
          >
            <div className="flex-shrink-0 w-16 text-right">
              <span className="text-xs text-gray-500 font-mono">
                {period ? `Q${period} ` : ''}{String(time)}
              </span>
            </div>
            <div className="min-w-0">
              {teamName && (
                <span className="text-xs font-semibold text-gray-400 mr-2">
                  {String(teamName)}
                </span>
              )}
              <span className="text-gray-300">{String(description)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
