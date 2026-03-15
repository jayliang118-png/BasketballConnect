'use client'

import { useGameSummary } from '@/hooks/use-game'
import { useConditionalPolling } from '@/hooks/use-conditional-polling'

interface LiveGameBannerProps {
  readonly matchId: number
  readonly competitionUniqueKey: string
}

/**
 * Displays a prominent banner when a game is currently live.
 * Shows pulsing "LIVE" indicator with real-time status.
 */
export function LiveGameBanner({ matchId, competitionUniqueKey }: LiveGameBannerProps) {
  const pollingInterval = useConditionalPolling(null) // Will be updated by useGameSummary

  const { data } = useGameSummary(matchId, competitionUniqueKey, {
    pollingInterval: useConditionalPolling(null),
  })

  if (!data?.matchData || data.matchData.matchStatus !== 'LIVE') {
    return null
  }

  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-stat-red/10 border border-stat-red/30 flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        {/* Pulsing red dot */}
        <div className="flex gap-1 items-center">
          <span className="inline-block w-3 h-3 bg-stat-red rounded-full animate-pulse" />
          <span className="text-sm font-bold text-stat-red uppercase tracking-wider">
            Live Game in Progress
          </span>
        </div>
      </div>

      {/* Watch indicator */}
      <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-800/50 rounded">
        🔴 Watching Live
      </span>
    </div>
  )
}
