'use client'

import { useMemo } from 'react'
import { useGlobalSearchIndex } from './use-global-search-index'
import { groupSearchResults } from '@/lib/search-index-helpers'
import type { SearchResultGroup } from '@/types/global-search'

interface UseGlobalSearchResult {
  readonly results: readonly SearchResultGroup[]
  readonly totalCount: number
  readonly entityCount: number
}

/**
 * Searches the global entity index.
 * NOTE: The `term` parameter should already be debounced by the caller
 * (SearchInput debounces at 300ms before emitting).
 */
export function useGlobalSearch(term: string): UseGlobalSearchResult {
  const { search, entityCount } = useGlobalSearchIndex()

  const results = useMemo(() => {
    if (!term.trim()) return []
    const matches = search(term)
    return groupSearchResults(matches)
  }, [term, search, entityCount])

  const totalCount = useMemo(
    () => results.reduce((sum, group) => sum + group.items.length, 0),
    [results]
  )

  return { results, totalCount, entityCount }
}
