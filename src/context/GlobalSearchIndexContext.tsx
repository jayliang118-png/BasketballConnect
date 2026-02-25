'use client'

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SearchableEntity, GlobalSearchIndexValue } from '@/types/global-search'
import { buildEntityKey, filterEntitiesByTerm } from '@/lib/search-index-helpers'
import { loadCachedIndex, saveCachedIndex } from '@/lib/search-index-cache'

/**
 * Holds stable function references (register, search) that never change identity.
 * Consumers that only need to call register/search subscribe here and avoid
 * re-rendering when entityCount changes.
 */
export const GlobalSearchActionsContext = createContext<Pick<
  GlobalSearchIndexValue,
  'register' | 'search'
> | null>(null)

/**
 * Holds the changing entityCount value. Only components that display the count
 * subscribe to this context, keeping re-renders minimal.
 */
export const GlobalSearchDataContext = createContext<{ entityCount: number } | null>(null)

/**
 * Combined context kept for backwards-compat with useGlobalSearchIndex().
 */
export const GlobalSearchIndexContext = createContext<GlobalSearchIndexValue | null>(null)

interface GlobalSearchIndexProviderProps {
  readonly children: React.ReactNode
}

export function GlobalSearchIndexProvider({ children }: GlobalSearchIndexProviderProps) {
  const [entities, setEntities] = useState<ReadonlyMap<string, SearchableEntity>>(
    () => new Map()
  )
  const entitiesRef = useRef(entities)
  entitiesRef.current = entities
  const cacheLoaded = useRef(false)

  // Load cached index on mount (client-side only)
  useEffect(() => {
    if (cacheLoaded.current) return
    cacheLoaded.current = true

    const cached = loadCachedIndex()
    if (cached.size > 0) {
      setEntities(cached)
    }
  }, [])

  // Persist index to localStorage when it changes
  useEffect(() => {
    if (entities.size === 0) return
    saveCachedIndex(entities)
  }, [entities])

  const register = useCallback((newEntities: readonly SearchableEntity[]) => {
    if (newEntities.length === 0) return

    setEntities((prev) => {
      let hasNew = false

      for (const entity of newEntities) {
        const key = buildEntityKey(entity.type, entity.id)
        if (!prev.has(key)) {
          hasNew = true
          break
        }
      }

      if (!hasNew) return prev

      const next = new Map(prev)
      for (const entity of newEntities) {
        const key = buildEntityKey(entity.type, entity.id)
        if (!next.has(key)) {
          next.set(key, entity)
        }
      }
      return next
    })
  }, [])

  const search = useCallback(
    (term: string): readonly SearchableEntity[] => {
      return filterEntitiesByTerm(entitiesRef.current, term)
    },
    []
  )

  // Stable actions object — register and search never change identity
  const actions = useMemo(() => ({ register, search }), [register, search])

  // Changing data object — only entityCount triggers re-renders for subscribers
  const data = useMemo(() => ({ entityCount: entities.size }), [entities.size])

  // Combined value for backwards-compat
  const value = useMemo<GlobalSearchIndexValue>(
    () => ({
      register,
      search,
      entityCount: entities.size,
    }),
    [register, search, entities.size]
  )

  return (
    <GlobalSearchActionsContext.Provider value={actions}>
      <GlobalSearchDataContext.Provider value={data}>
        <GlobalSearchIndexContext.Provider value={value}>
          {children}
        </GlobalSearchIndexContext.Provider>
      </GlobalSearchDataContext.Provider>
    </GlobalSearchActionsContext.Provider>
  )
}
