'use client'

import { useContext } from 'react'
import { GlobalSearchIndexContext } from '@/context/GlobalSearchIndexContext'
import type { GlobalSearchIndexValue } from '@/types/global-search'

export function useGlobalSearchIndex(): GlobalSearchIndexValue {
  const ctx = useContext(GlobalSearchIndexContext)

  if (!ctx) {
    throw new Error('useGlobalSearchIndex must be used within a GlobalSearchIndexProvider')
  }

  return ctx
}
