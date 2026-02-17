'use client'

import { createContext, useCallback, useMemo, useState } from 'react'

export interface SearchContextValue {
  readonly searchTerm: string
  readonly setSearchTerm: (term: string) => void
  readonly filterItems: <T>(
    items: readonly T[],
    getSearchableText: (item: T) => string,
  ) => readonly T[]
}

export const SearchContext = createContext<SearchContextValue | null>(null)

interface SearchProviderProps {
  readonly children: React.ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchTerm, setSearchTermState] = useState('')

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term)
  }, [])

  const filterItems = useCallback(
    <T,>(items: readonly T[], getSearchableText: (item: T) => string): readonly T[] => {
      if (!searchTerm.trim()) return items
      const lower = searchTerm.toLowerCase()
      return items.filter((item) =>
        getSearchableText(item).toLowerCase().includes(lower),
      )
    },
    [searchTerm],
  )

  const value = useMemo<SearchContextValue>(
    () => ({ searchTerm, setSearchTerm, filterItems }),
    [searchTerm, setSearchTerm, filterItems],
  )

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
