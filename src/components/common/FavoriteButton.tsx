'use client'

import { useCallback } from 'react'

interface FavoriteButtonProps {
  readonly isFavorited: boolean
  readonly onToggle: () => void
}

export function FavoriteButton({ isFavorited, onToggle }: FavoriteButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onToggle()
    },
    [onToggle],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }
    },
    [onToggle],
  )

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
        isFavorited
          ? 'text-hoop-orange hover:text-hoop-orange/80'
          : 'text-gray-600 hover:text-gray-400'
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="switch"
      aria-checked={isFavorited}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isFavorited ? 0 : 1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
