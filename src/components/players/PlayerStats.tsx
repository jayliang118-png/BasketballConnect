'use client'

import { useApiData } from '@/hooks/use-api-data'
import { useMemo } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import { StatBadge } from '@/components/common/StatBadge'

interface PlayerStatsProps {
  readonly userId: number
}

export function PlayerStats({ userId }: PlayerStatsProps) {
  const fetcher = useMemo(
    () => async () => {
      const { fetchUserScoringSummary } = await import('@/services/stats.service')
      return fetchUserScoringSummary(userId, 'CAREER', 0)
    },
    [userId]
  )

  const { data, isLoading, error, refetch } = useApiData(fetcher, [userId])

  if (isLoading) return <LoadingSpinner message="Loading stats..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <EmptyState message="No stats available" />

  const stats = data as Record<string, unknown>
  const statEntries = Array.isArray(stats)
    ? stats
    : (stats.stats as unknown[]) ?? [stats]

  if (statEntries.length === 0) {
    return <EmptyState message="No career stats recorded" />
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Career Stats</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {statEntries.map((entry, idx) => {
          const stat = entry as Record<string, unknown>
          return Object.entries(stat)
            .filter(([key]) => typeof stat[key] === 'number')
            .slice(0, 6)
            .map(([key, value]) => (
              <StatBadge
                key={`${idx}-${key}`}
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                value={value as number}
                color={key.includes('point') || key.includes('Point') ? 'orange' : 'blue'}
              />
            ))
        })}
      </div>

      {/* Raw stats fallback - development only */}
      {process.env.NODE_ENV === 'development' && (
        <details className="card-basketball p-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300">
            View raw stats
          </summary>
          <pre className="mt-3 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
