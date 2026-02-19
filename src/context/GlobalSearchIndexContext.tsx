'use client'

import { createContext, useCallback, useMemo, useRef, useState } from 'react'
import type { SearchableEntity, GlobalSearchIndexValue } from '@/types/global-search'
import { buildEntityKey, filterEntitiesByTerm } from '@/lib/search-index-helpers'

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

  const value = useMemo<GlobalSearchIndexValue>(
    () => ({
      register,
      search,
      entityCount: entities.size,
    }),
    [register, search, entities.size]
  )

  return (
    <GlobalSearchIndexContext.Provider value={value}>
      {children}
    </GlobalSearchIndexContext.Provider>
  )
}
