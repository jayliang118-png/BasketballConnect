'use client'

import { useMemo } from 'react'
import { useApiData } from './use-api-data'
import type { LadderEntry, LadderAdjustment } from '@/types/ladder'

interface ApiAdjustment {
  readonly value: number
  readonly teamName: string
  readonly adjustmentReason: string
  readonly teamLadderTypeRefId: number
}

interface ApiLadderEntry {
  readonly id: number
  readonly teamUniqueKey: string | null
  readonly name: string
  readonly hasAdjustments: number | null
  readonly adjustments: readonly ApiAdjustment[] | null
  readonly rk: string
  readonly P: string
  readonly W: string
  readonly L: string
  readonly D: string
  readonly F: string
  readonly A: string
  readonly FW: string
  readonly FL: string
  readonly B: string
  readonly PTS: string
  readonly win: string
  readonly goalDifference: string
  readonly isHidden: string | null
  readonly [key: string]: unknown
}

const LADDER_TYPE_LABELS: Record<number, string> = {
  27: 'rank/s',
  28: 'goals for due to',
  29: 'goals against due to',
  30: 'Win/s (W)',
  32: 'Loss/s (L)',
}

function parseNum(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val) || 0
  return 0
}

function mapApiToLadderEntry(raw: ApiLadderEntry): LadderEntry {
  return {
    rank: parseNum(raw.rk),
    teamId: raw.id,
    teamName: raw.name,
    teamUniqueKey: raw.teamUniqueKey,
    hasAdjustments: raw.hasAdjustments === 1,
    played: parseNum(raw.P),
    wins: parseNum(raw.W),
    losses: parseNum(raw.L),
    draws: parseNum(raw.D),
    byes: parseNum(raw.B),
    forfeitWins: parseNum(raw.FW),
    forfeitLosses: parseNum(raw.FL),
    pointsFor: parseNum(raw.F),
    pointsAgainst: parseNum(raw.A),
    competitionPoints: parseNum(raw.PTS),
    winPercentage: parseFloat(String(raw.win)) || 0,
    goalDifference: parseNum(raw.goalDifference),
  }
}

function formatAdjustmentNote(adj: ApiAdjustment): string {
  const absVal = Math.abs(adj.value)
  const label = LADDER_TYPE_LABELS[adj.teamLadderTypeRefId] ?? `stat (ref ${adj.teamLadderTypeRefId})`
  const action = adj.teamLadderTypeRefId === 27 ? 'moved up' : 'deducted'
  return `${adj.teamName} ${action} ${absVal} ${label} ${adj.adjustmentReason}*`
}

function collectAdjustments(ladders: readonly ApiLadderEntry[]): readonly LadderAdjustment[] {
  const notes: LadderAdjustment[] = []
  for (const team of ladders) {
    const adjs = team.adjustments ?? []
    for (const adj of adjs) {
      notes.push({
        teamName: team.name,
        description: formatAdjustmentNote(adj),
      })
    }
  }
  return notes
}

interface UseLadderResult {
  readonly entries: readonly LadderEntry[]
  readonly adjustments: readonly LadderAdjustment[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly refetch: () => void
}

export function useLadder(
  divisionId: number | null,
  compKey: string,
): UseLadderResult {
  const fetcher = useMemo(() => {
    if (!divisionId || !compKey) return null
    return async () => {
      const { fetchLadder } = await import('@/services/ladder.service')
      return fetchLadder(divisionId, compKey)
    }
  }, [divisionId, compKey])

  const { data, isLoading, error, refetch } = useApiData(fetcher, [divisionId, compKey], {
    pollingInterval: 30_000,
  })

  const { entries, adjustments } = useMemo(() => {
    if (!data) return { entries: [] as LadderEntry[], adjustments: [] as LadderAdjustment[] }
    const response = data as { ladders?: readonly ApiLadderEntry[] }
    const ladders = Array.isArray(response.ladders) ? response.ladders : []
    const visible = ladders.filter((t) => t.isHidden !== '1')
    return {
      entries: visible.map(mapApiToLadderEntry).sort((a, b) => a.rank - b.rank),
      adjustments: collectAdjustments(visible),
    }
  }, [data])

  return { entries, adjustments, isLoading, error, refetch }
}
