'use client'

import type { SearchableEntity } from '@/types/global-search'

interface GlobalSearchResultItemProps {
  readonly entity: SearchableEntity
  readonly searchTerm: string
  readonly isHighlighted: boolean
  readonly onClick: () => void
}

function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text

  const lower = text.toLowerCase()
  const idx = lower.indexOf(term.toLowerCase())

  if (idx === -1) return text

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + term.length)
  const after = text.slice(idx + term.length)

  return (
    <>
      {before}
      <span className="text-hoop-orange font-semibold">{match}</span>
      {after}
    </>
  )
}

const ENTITY_ICONS: Record<string, string> = {
  organisation: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  competition: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  division: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  team: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  player: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
}

export function GlobalSearchResultItem({
  entity,
  searchTerm,
  isHighlighted,
  onClick,
}: GlobalSearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
        isHighlighted
          ? 'bg-court-elevated text-gray-100'
          : 'text-gray-300 hover:bg-court-elevated/50'
      }`}
      type="button"
    >
      <svg
        className="w-4 h-4 flex-shrink-0 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d={ENTITY_ICONS[entity.type] ?? ENTITY_ICONS.team}
        />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">
          {highlightMatch(entity.name, searchTerm)}
        </p>
        {entity.parentLabel && (
          <p className="text-xs text-gray-500 truncate">{entity.parentLabel}</p>
        )}
      </div>
    </button>
  )
}
