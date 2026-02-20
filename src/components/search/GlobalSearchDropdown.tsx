'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalSearch } from '@/hooks/use-global-search'
import { GlobalSearchResultGroup } from './GlobalSearchResultGroup'
import type { SearchableEntity } from '@/types/global-search'

interface GlobalSearchDropdownProps {
  readonly searchTerm: string
  readonly onClose: () => void
  readonly containerRef: React.RefObject<HTMLDivElement | null>
}

export function GlobalSearchDropdown({ searchTerm, onClose, containerRef }: GlobalSearchDropdownProps) {
  const { results, totalCount, entityCount } = useGlobalSearch(searchTerm)
  const router = useRouter()
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const trimmed = searchTerm.trim()

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [results])

  // Close on click outside (excluding the search container which holds the input)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const isInsideDropdown = dropdownRef.current?.contains(target)
      const isInsideContainer = containerRef.current?.contains(target)
      if (!isInsideDropdown && !isInsideContainer) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, containerRef])

  // Flatten results for keyboard navigation
  const flatItems: SearchableEntity[] = results.flatMap((g) => [...g.items])

  const handleSelect = useCallback(
    (entity: SearchableEntity) => {
      const p = entity.params
      const orgKey = p.organisationUniqueKey as string | undefined
      const compKey = p.competitionKey as string | undefined
      const divId = p.divisionId as number | undefined
      const teamKey = p.teamUniqueKey as string | undefined

      let url = '/orgs'

      switch (entity.targetView) {
        case 'competitions':
          if (orgKey) url = `/orgs/${orgKey}/competitions`
          break
        case 'divisions':
          if (orgKey && compKey) url = `/orgs/${orgKey}/competitions/${compKey}/divisions`
          break
        case 'divisionDetail':
          if (orgKey && compKey && divId) url = `/orgs/${orgKey}/competitions/${compKey}/divisions/${divId}`
          break
        case 'teamDetail':
          if (orgKey && compKey && divId && teamKey) {
            url = `/orgs/${orgKey}/competitions/${compKey}/divisions/${divId}/teams/${teamKey}`
          }
          break
        case 'playerProfile':
          if (p.playerId) url = `/players/${p.playerId}`
          break
        default:
          break
      }

      router.push(url)
      onClose()
    },
    [router, onClose],
  )

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : 0
        )
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : flatItems.length - 1
        )
        return
      }

      if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
        e.preventDefault()
        handleSelect(flatItems[highlightedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [flatItems, highlightedIndex, handleSelect, onClose])

  if (!trimmed) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-court-surface border border-court-border rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto"
    >
      {totalCount === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400">No results found</p>
          <p className="text-xs text-gray-600 mt-1">
            Searching {entityCount} indexed entities
          </p>
        </div>
      ) : (
        <>
          {results.map((group) => {
            const startIndex = flatItems.indexOf(group.items[0])
            return (
              <GlobalSearchResultGroup
                key={group.type}
                group={group}
                searchTerm={trimmed}
                highlightedIndex={highlightedIndex}
                startIndex={startIndex}
                onSelect={handleSelect}
              />
            )
          })}
          <div className="px-3 py-1.5 text-xs text-gray-600 border-t border-court-border">
            {totalCount} result{totalCount !== 1 ? 's' : ''} from {entityCount} indexed entities
          </div>
        </>
      )}
    </div>
  )
}
