'use client'

import { useState, useCallback } from 'react'
import { useStats } from '@/hooks/use-stats'
import { useNavigation } from '@/hooks/use-navigation'
import { StatTypeSelector } from './StatTypeSelector'
import { LeaderboardRow } from './LeaderboardRow'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

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

export function Leaderboard() {
  const { state } = useNavigation()
  const divisionId = state.params.divisionId as number | undefined
  const [statType, setStatType] = useState('TOTALPOINTS')

  const { data, isLoading, error, refetch } = useStats(
    statType,
    divisionId ?? null,
    0,
    20
  )

  const handleStatTypeChange = useCallback((type: string) => {
    setStatType(type)
  }, [])

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
              const rank = item.rank ? Number(item.rank) : index + 1
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
    </div>
  )
}
