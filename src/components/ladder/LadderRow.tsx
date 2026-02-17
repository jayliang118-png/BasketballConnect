'use client'

import type { LadderEntry } from '@/types/ladder'

interface LadderRowProps {
  readonly entry: LadderEntry
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'text-hoop-orange font-bold'
  if (rank <= 4) return 'text-stat-green font-semibold'
  return 'text-gray-400'
}

function formatWinPercentage(pct: number): string {
  return `${(pct * 100).toFixed(0)}%`
}

export function LadderRow({ entry }: LadderRowProps) {
  return (
    <tr className="border-b border-court-border/30 hover:bg-court-elevated/50 transition-colors">
      <td className="px-3 py-2.5 text-center whitespace-nowrap">
        <span className={getRankStyle(entry.rank)}>{entry.rank}</span>
      </td>
      <td className="px-3 py-2.5 text-left whitespace-nowrap">
        <span className="text-sm font-medium text-gray-200 truncate max-w-[180px] inline-block">
          {entry.teamName}
        </span>
      </td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-300">{entry.played}</td>
      <td className="px-2 py-2.5 text-center text-sm text-stat-green">{entry.wins}</td>
      <td className="px-2 py-2.5 text-center text-sm text-stat-red">{entry.losses}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-400">{entry.draws}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-400">{entry.byes}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-400">{entry.forfeitWins}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-400">{entry.forfeitLosses}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-300">{entry.pointsFor}</td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-300">{entry.pointsAgainst}</td>
      <td className="px-2 py-2.5 text-center text-sm font-bold text-hoop-orange">
        {entry.competitionPoints}
      </td>
      <td className="px-2 py-2.5 text-center text-sm text-gray-300">
        {formatWinPercentage(entry.winPercentage)}
      </td>
      <td className="px-2 py-2.5 text-center text-sm">
        <span className={entry.goalDifference > 0 ? 'text-stat-green' : entry.goalDifference < 0 ? 'text-stat-red' : 'text-gray-400'}>
          {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
        </span>
      </td>
    </tr>
  )
}
