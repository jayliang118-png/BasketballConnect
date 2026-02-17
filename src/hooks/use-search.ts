'use client'

import { useContext } from 'react'
import { SearchContext, type SearchContextValue } from '@/context/SearchContext'

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
