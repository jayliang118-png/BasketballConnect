'use client'

import { useMemo } from 'react'
import { useFixtures } from './use-fixtures'
import { computeLadder } from '@/lib/ladder-calculator'
import type { LadderEntry } from '@/types/ladder'

interface UseLadderResult {
  readonly entries: readonly LadderEntry[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly refetch: () => void
}

export function useLadder(
  competitionId: number | null,
  divisionId: number | null,
): UseLadderResult {
  const { data, isLoading, error, refetch } = useFixtures(competitionId, divisionId)

  const entries = useMemo(() => {
    if (!data || !Array.isArray(data) || divisionId === null) return []
    return computeLadder(data, divisionId)
  }, [data, divisionId])

  return { entries, isLoading, error, refetch }
}
