'use client'

import { useState, useMemo } from 'react'
import { useActionLog, useGameEvents } from '@/hooks/use-game'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameEvent } from '@/types/game'

interface ActionLogProps {
  readonly matchId: number | null
  readonly competitionId: string | null
}

function getPeriodFilterLabel(periodId: number): string {
  if (periodId >= 1 && periodId <= 4) {
    const suffix = periodId === 1 ? 'st' : periodId === 2 ? 'nd' : periodId === 3 ? 'rd' : 'th'
    return `${periodId}${suffix}`
  }
  if (periodId === 5) return 'OT'
  return `P${periodId}`
}

function isScoring(stat: GameEvent['stat']): boolean {
  return stat.type === 'P'
}

function isFoul(stat: GameEvent['stat']): boolean {
  return stat.type === 'PF' || stat.type === 'TF'
}

function formatScoreLabel(stat: GameEvent['stat'], score: string | null): string {
  if (isScoring(stat) && score) {
    return `${stat.displayName} [${score}]`
  }
  return stat.displayName
}

interface TimelineEventProps {
  readonly event: GameEvent
  readonly isTeam1: boolean
}

function TimelineEvent({ event, isTeam1 }: TimelineEventProps) {
  const playerName = event.players[0]?.name ?? ''
  const shirt = event.players[0]?.shirt ?? ''
  const scoring = isScoring(event.stat)
  const foul = isFoul(event.stat)
  const label = formatScoreLabel(event.stat, event.score)
  const playerInfo = playerName
    ? `${shirt ? `${shirt} - ` : ''}${playerName}`
    : ''

  const eventContent = (
    <>
      {foul ? (
        <div className={`flex items-center gap-1.5 ${isTeam1 ? 'justify-end' : 'justify-start'}`}>
          {isTeam1 && <span className="text-sm font-semibold text-gray-200">{label}</span>}
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block flex-shrink-0" />
          {!isTeam1 && <span className="text-sm font-semibold text-gray-200">{label}</span>}
        </div>
      ) : (
        <p className={`text-sm font-semibold text-gray-200 ${isTeam1 ? 'text-right' : 'text-left'}`}>
          {label}
        </p>
      )}
      {playerInfo && (
        <p className={`text-xs text-gray-400 mt-0.5 ${isTeam1 ? 'text-right' : 'text-left'}`}>
          {playerInfo}
        </p>
      )}
    </>
  )

  const bubbleColor = foul
    ? 'border-red-400/50 text-red-400'
    : scoring
      ? 'border-gray-500/50 text-gray-300'
      : 'border-gray-600/50 text-gray-400'

  return (
    <div className="flex items-center gap-0 relative">
      {/* Left side (team 1) */}
      <div className="flex-1 flex justify-end">
        {isTeam1 ? (
          <div className="pr-3 max-w-[260px] sm:max-w-[300px]">{eventContent}</div>
        ) : (
          <div />
        )}
      </div>

      {/* Center timeline bubble */}
      <div className="flex-shrink-0 z-10">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold bg-court-surface ${bubbleColor}`}>
          {event.minute}&apos;
        </div>
      </div>

      {/* Right side (team 2) */}
      <div className="flex-1 flex justify-start">
        {!isTeam1 ? (
          <div className="pl-3 max-w-[260px] sm:max-w-[300px]">{eventContent}</div>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

export function ActionLog({ matchId, competitionId }: ActionLogProps) {
  const [activePeriod, setActivePeriod] = useState<number | null>(null)
  const actionLog = useActionLog(matchId, competitionId)
  const eventsResult = useGameEvents(matchId)

  const isLoading = actionLog.isLoading || eventsResult.isLoading
  const error = actionLog.error || eventsResult.error
  const refetch = actionLog.refetch

  const match = actionLog.data?.result?.[0]
  const events = eventsResult.data

  const team1Id = match?.team1?.id
  const team1Name = match?.team1?.name ?? 'Team 1'
  const team2Name = match?.team2?.name ?? 'Team 2'

  // Unique period IDs sorted
  const periodIds = useMemo(() => {
    if (!events) return []
    const ids = new Set<number>()
    for (const event of events) {
      ids.add(event.period.id)
    }
    return Array.from(ids).sort((a, b) => a - b)
  }, [events])

  // Filter and sort events — newest first
  const filteredEvents = useMemo(() => {
    if (!events) return []
    const filtered = activePeriod === null
      ? [...events]
      : events.filter((e) => e.period.id === activePeriod)
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp)
  }, [events, activePeriod])

  if (isLoading) return <LoadingSpinner message="Loading action log..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!events || events.length === 0) {
    return <EmptyState message="No action log data available" />
  }

  return (
    <div className="space-y-6">
      {/* Period filter tabs */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => setActivePeriod(null)}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            activePeriod === null
              ? 'text-hoop-orange border-b-2 border-hoop-orange'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          All
        </button>
        {periodIds.map((pid) => (
          <button
            key={pid}
            type="button"
            onClick={() => setActivePeriod(pid)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              activePeriod === pid
                ? 'text-hoop-orange border-b-2 border-hoop-orange'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {getPeriodFilterLabel(pid)}
          </button>
        ))}
      </div>

      {/* Timeline heading */}
      <h3 className="text-center text-lg font-semibold text-gray-200">Timeline</h3>

      {/* Team name headers */}
      <div className="flex items-center">
        <span className="flex-1 text-right pr-14 text-sm font-semibold text-gray-300">{team1Name}</span>
        <span className="flex-1 text-left pl-14 text-sm font-semibold text-gray-300">{team2Name}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700/40 -translate-x-1/2" />

        <div className="space-y-3 py-2">
          {filteredEvents.map((event, idx) => {
            const isTeam1 = event.teamId === team1Id
            return (
              <TimelineEvent
                key={`${event.period.id}-${event.timestamp}-${idx}`}
                event={event}
                isTeam1={isTeam1}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
