'use client'

import { useState, useCallback } from 'react'
import { useStats } from '@/hooks/use-stats'
import { StatTypeSelector } from './StatTypeSelector'
import { LeaderboardRow } from './LeaderboardRow'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

const PAGE_SIZE = 20

const STAT_VALUE_FIELD: Record<string, string> = {
  TOTALPOINTS: 'totalPts',
  AVGPOINTS: 'avgPts',
  TWOPOINTS: '2PMade',
  THREEPOINTS: '3PMade',
  FREETHROWS: 'FTMade',
  TOTALPF: 'PF',
}

function extractStatValue(item: Record<string, unknown>, statType: string): string {
  const field = STAT_VALUE_FIELD[statType]
  if (field) {
    const raw = item[field]
    if (raw !== undefined && raw !== null) {
      const num = Number(raw)
      if (!isNaN(num)) {
        return num % 1 === 0 ? String(Math.round(num)) : num.toFixed(1)
      }
      return String(raw)
    }
  }
  return '0'
}

interface LeaderboardProps {
  readonly divisionId: number
}

export function Leaderboard({ divisionId }: LeaderboardProps) {
  const [statType, setStatType] = useState('TOTALPOINTS')
  const [page, setPage] = useState(0)

  const offset = page * PAGE_SIZE

  const { data, isLoading, error, refetch } = useStats(
    statType,
    divisionId,
    offset,
    PAGE_SIZE,
  )

  const handleStatTypeChange = useCallback((type: string) => {
    setStatType(type)
    setPage(0)
  }, [])

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(0, p - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  const hasData = !isLoading && !error && Array.isArray(data) && data.length > 0
  const hasNextPage = Array.isArray(data) && data.length === PAGE_SIZE

  return (
    <div className="space-y-4">
      <StatTypeSelector selectedType={statType} onSelect={handleStatTypeChange} />

      {isLoading && <LoadingSpinner message="Loading leaderboard..." />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!isLoading && !error && data && (() => {
        if (!Array.isArray(data) || data.length === 0) {
          return <EmptyState message="No stats data available" />
        }

        return (
          <div className="card-basketball divide-y divide-court-border/30 overflow-hidden">
            {data.map((item, index) => {
              const playerName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Unknown'
              const teamName = (item.teamName as string) ?? undefined
              const rank = item.rank ? Number(item.rank) : offset + index + 1
              const value = extractStatValue(item, statType)

              return (
                <LeaderboardRow
                  key={`${item.playerId ?? index}`}
                  rank={rank}
                  playerName={playerName}
                  teamName={teamName}
                  value={value}
                />
              )
            })}
          </div>
        )
      })()}

      {/* Pagination */}
      {hasData && (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-court-elevated text-gray-300 hover:bg-court-elevated/80 hover:text-gray-100"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-court-elevated text-gray-300 hover:bg-court-elevated/80 hover:text-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
