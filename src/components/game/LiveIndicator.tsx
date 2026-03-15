'use client'

import { formatRelativeTime } from '@/lib/format-time'

interface LiveIndicatorProps {
  readonly lastUpdated?: string | null
  readonly showTimestamp?: boolean
}

/**
 * Displays a pulsing live indicator badge with optional timestamp.
 * Used to show users that game data is updating in real-time.
 */
export function LiveIndicator({
  lastUpdated,
  showTimestamp = true,
}: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-stat-red text-white text-xs font-semibold uppercase animate-pulse">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        Live
      </span>
      {showTimestamp && lastUpdated && (
        <span className="text-xs text-gray-400">
          Updated {formatRelativeTime(lastUpdated)}
        </span>
      )}
    </div>
  )
}
