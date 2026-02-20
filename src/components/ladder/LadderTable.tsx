'use client'

import { useLadder } from '@/hooks/use-ladder'
import { LadderRow } from './LadderRow'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

const COLUMN_HEADERS = [
  { key: 'rank', label: '#', title: 'Rank' },
  { key: 'team', label: 'Team', title: 'Team' },
  { key: 'played', label: 'P', title: 'Played' },
  { key: 'wins', label: 'W', title: 'Wins' },
  { key: 'losses', label: 'L', title: 'Losses' },
  { key: 'draws', label: 'D', title: 'Draws' },
  { key: 'byes', label: 'B', title: 'Byes' },
  { key: 'forfeitWins', label: 'FW', title: 'Forfeit Wins' },
  { key: 'forfeitLosses', label: 'FL', title: 'Forfeit Losses' },
  { key: 'pointsFor', label: 'F', title: 'Points For' },
  { key: 'pointsAgainst', label: 'A', title: 'Points Against' },
  { key: 'pts', label: 'PTS', title: 'Competition Points' },
  { key: 'winPct', label: 'W%', title: 'Win Percentage' },
  { key: 'gd', label: 'GD', title: 'Goal Difference' },
] as const

interface LadderTableProps {
  readonly competitionId: number
  readonly divisionId: number
  readonly orgKey: string
  readonly compKey: string
}

export function LadderTable({ competitionId, divisionId, orgKey, compKey }: LadderTableProps) {
  const { entries, isLoading, error, refetch } = useLadder(
    competitionId,
    divisionId,
  )

  if (isLoading) return <LoadingSpinner message="Loading ladder..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (entries.length === 0) return <EmptyState message="No ladder data available" />

  return (
    <div className="card-basketball overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-court-elevated/80 border-b border-court-border">
              {COLUMN_HEADERS.map((col) => (
                <th
                  key={col.key}
                  title={col.title}
                  className={`px-2 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                    col.key === 'team' ? 'text-left px-3' : 'text-center'
                  } ${col.key === 'rank' ? 'px-3' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <LadderRow
                key={entry.teamId}
                entry={entry}
                orgKey={orgKey}
                compKey={compKey}
                divisionId={divisionId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
