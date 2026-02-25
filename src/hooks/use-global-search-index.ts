'use client'

import { useContext } from 'react'
import {
  GlobalSearchIndexContext,
  GlobalSearchActionsContext,
} from '@/context/GlobalSearchIndexContext'
import type { GlobalSearchIndexValue } from '@/types/global-search'

export function useGlobalSearchIndex(): GlobalSearchIndexValue {
  const ctx = useContext(GlobalSearchIndexContext)

  if (!ctx) {
    throw new Error('useGlobalSearchIndex must be used within a GlobalSearchIndexProvider')
  }

  return ctx
}

/**
 * Returns only the stable `register` and `search` functions.
 * Unlike useGlobalSearchIndex(), this hook does NOT re-render when
 * entityCount changes — making it safe for use in effects that call
 * register without triggering infinite loops.
 */
export function useGlobalSearchActions(): Pick<GlobalSearchIndexValue, 'register' | 'search'> {
  const ctx = useContext(GlobalSearchActionsContext)

  if (!ctx) {
    throw new Error('useGlobalSearchActions must be used within a GlobalSearchIndexProvider')
  }

  return ctx
}
