'use client'

import { useEffect } from 'react'
import { useGlobalSearchIndex } from '@/hooks/use-global-search-index'
import type { SearchableEntity } from '@/types/global-search'

interface SearchIndexRegistrarProps {
  readonly entities: readonly SearchableEntity[]
}

export function SearchIndexRegistrar({ entities }: SearchIndexRegistrarProps) {
  const { register } = useGlobalSearchIndex()

  useEffect(() => {
    if (entities.length > 0) {
      register(entities)
    }
  }, [entities, register])

  return null
}
