'use client'

import { useGameSummary } from '@/hooks/use-game'

interface GameDetailHeaderProps {
  readonly matchId: number
  readonly competitionUniqueKey: string
}

/**
 * Header that dynamically updates to show live status.
 * Shows pulsing indicator when game is LIVE.
 */
export function GameDetailHeader({ matchId, competitionUniqueKey }: GameDetailHeaderProps) {
  const { data } = useGameSummary(matchId, competitionUniqueKey)

  const isLive = data?.matchData.matchStatus === 'LIVE'

  return (
    <div className="flex items-center gap-3">
      {isLive && (
        <>
          <span className="inline-block w-2.5 h-2.5 bg-stat-red rounded-full animate-pulse" />
          <span className="text-xs font-bold text-stat-red uppercase tracking-widest animate-pulse">
            Live
          </span>
        </>
      )}
      <h2 className="text-xl font-bold text-gray-100">Game Detail</h2>
    </div>
  )
}
