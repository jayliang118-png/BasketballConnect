'use client'

import Link from 'next/link'
import type { LadderEntry } from '@/types/ladder'

interface LadderRowProps {
  readonly entry: LadderEntry
  readonly orgKey: string
  readonly compKey: string
  readonly divisionId: number
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'text-hoop-orange font-bold'
  if (rank <= 4) return 'text-stat-green font-semibold'
  return 'text-gray-400'
}

function formatWinPercentage(pct: number): string {
  return `${(pct * 100).toFixed(0)}%`
}

export function LadderRow({ entry, orgKey, compKey, divisionId }: LadderRowProps) {
  const teamHref = entry.teamUniqueKey
    ? `/orgs/${orgKey}/competitions/${compKey}/divisions/${divisionId}/teams/${entry.teamUniqueKey}`
    : null

  return (
    <tr className="border-b border-court-border/30 hover:bg-court-elevated/50 transition-colors">
      <td className="px-3 py-2.5 text-center whitespace-nowrap">
        <span className={getRankStyle(entry.rank)}>{entry.rank}</span>
      </td>
      <td className="px-3 py-2.5 text-left">
        {teamHref ? (
          <Link
            href={teamHref}
            className="text-sm font-medium text-gray-200 hover:text-hoop-orange transition-colors"
          >
            {entry.teamName}{entry.hasAdjustments && <span className="text-stat-red">*</span>}
          </Link>
        ) : (
          <span className="text-sm font-medium text-gray-200">
            {entry.teamName}{entry.hasAdjustments && <span className="text-stat-red">*</span>}
          </span>
        )}
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
