'use client'

import { useEffect } from 'react'
import { useGlobalSearchActions } from '@/hooks/use-global-search-index'
import type { SearchableEntity } from '@/types/global-search'

interface SearchIndexRegistrarProps {
  readonly entities: readonly SearchableEntity[]
}

export function SearchIndexRegistrar({ entities }: SearchIndexRegistrarProps) {
  const { register } = useGlobalSearchActions()

  useEffect(() => {
    if (entities.length > 0) {
      register(entities)
    }
  }, [entities, register])

  return null
}
