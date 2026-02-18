'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useFavorites } from '@/hooks/use-favorites'
import { useNavigation } from '@/hooks/use-navigation'
import type { FavoriteTeam } from '@/types/favorites'
import type { Guid } from '@/types/common'

interface FavoritesDropdownProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function FavoritesDropdown({ isOpen, onClose }: FavoritesDropdownProps) {
  const { state, removeFavorite } = useFavorites()
  const { navigateTo, restoreState } = useNavigation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleTeamClick = useCallback(
    (team: FavoriteTeam) => {
      if (team.breadcrumbs && team.params) {
        restoreState({
          currentView: 'teamDetail',
          breadcrumbs: team.breadcrumbs,
          params: team.params,
        })
      } else {
        navigateTo('teamDetail', {
          teamUniqueKey: team.teamUniqueKey,
          teamName: team.name,
        }, team.name)
      }
      onClose()
    },
    [navigateTo, restoreState, onClose],
  )

  const handleRemove = useCallback(
    (teamUniqueKey: Guid) => (e: React.MouseEvent) => {
      e.stopPropagation()
      removeFavorite(teamUniqueKey)
    },
    [removeFavorite],
  )

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-court-surface border border-court-border rounded-xl shadow-2xl animate-fade-up z-50"
      role="menu"
      aria-label="Favorite teams"
    >
      {state.teams.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-sm text-gray-500">No favorite teams yet</p>
          <p className="text-xs text-gray-600 mt-1">Tap the heart on any team to add it here</p>
        </div>
      ) : (
        <div className="py-2">
          <div className="px-4 py-2 border-b border-court-border">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Favorite Teams ({state.teams.length})
            </h3>
          </div>
          {state.teams.map((team) => (
            <div
              key={team.teamUniqueKey}
              onClick={() => handleTeamClick(team)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTeamClick(team) } }}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-court-elevated transition-colors cursor-pointer"
              role="menuitem"
              tabIndex={0}
            >
              <span className="text-sm text-gray-200 truncate flex-1 mr-2">{team.name}</span>
              <button
                onClick={handleRemove(team.teamUniqueKey)}
                type="button"
                className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                aria-label={`Remove ${team.name} from favorites`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
