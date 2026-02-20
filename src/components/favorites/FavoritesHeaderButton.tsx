'use client'

import { useCallback, useState } from 'react'
import { useFavorites } from '@/hooks/use-favorites'
import { FavoritesDropdown } from './FavoritesDropdown'

export function FavoritesHeaderButton() {
  const { favoritesCount, state } = useFavorites()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleToggle}
        type="button"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
          isOpen
            ? 'border-hoop-orange/50 bg-court-elevated text-hoop-orange'
            : 'border-court-border bg-court-surface text-gray-400 hover:text-gray-200 hover:border-gray-600'
        }`}
        aria-label={`Favorites (${favoritesCount})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={favoritesCount > 0 ? 'currentColor' : 'none'}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={favoritesCount > 0 ? 0 : 1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {state.isHydrated && favoritesCount > 0 && (
          <span className="text-xs font-semibold text-hoop-orange">
            {favoritesCount}
          </span>
        )}
      </button>
      <FavoritesDropdown isOpen={isOpen} onClose={handleClose} />
    </div>
  )
}
