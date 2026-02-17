'use client'

interface LeaderboardRowProps {
  readonly rank: number
  readonly playerName: string
  readonly teamName?: string
  readonly value: number | string
}

export function LeaderboardRow({ rank, playerName, teamName, value }: LeaderboardRowProps) {
  const isTopThree = rank <= 3

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-court-elevated/50 ${
      isTopThree ? 'bg-court-elevated/30' : ''
    }`}>
      {/* Rank */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
        rank === 1
          ? 'bg-stat-gold/20 text-stat-gold'
          : rank === 2
            ? 'bg-gray-400/20 text-gray-400'
            : rank === 3
              ? 'bg-hoop-orange-dark/20 text-hoop-orange'
              : 'bg-court-border/30 text-gray-500'
      }`}>
        {rank}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{playerName}</p>
        {teamName && (
          <p className="text-xs text-gray-500 truncate">{teamName}</p>
        )}
      </div>

      {/* Stat value */}
      <div className={`font-mono text-lg font-bold flex-shrink-0 ${
        isTopThree ? 'text-hoop-orange' : 'text-gray-300'
      }`}>
        {value}
      </div>
    </div>
  )
}
