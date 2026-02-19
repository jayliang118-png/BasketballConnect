'use client'

import type { SearchableEntity, SearchResultGroup } from '@/types/global-search'
import { GlobalSearchResultItem } from './GlobalSearchResultItem'

interface GlobalSearchResultGroupProps {
  readonly group: SearchResultGroup
  readonly searchTerm: string
  readonly highlightedIndex: number
  readonly startIndex: number
  readonly onSelect: (entity: SearchableEntity) => void
}

export function GlobalSearchResultGroup({
  group,
  searchTerm,
  highlightedIndex,
  startIndex,
  onSelect,
}: GlobalSearchResultGroupProps) {
  return (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-court-dark/50">
        {group.label}
      </div>
      {group.items.map((entity, i) => (
        <GlobalSearchResultItem
          key={`${entity.type}:${entity.id}`}
          entity={entity}
          searchTerm={searchTerm}
          isHighlighted={highlightedIndex === startIndex + i}
          onClick={() => onSelect(entity)}
        />
      ))}
    </div>
  )
}
