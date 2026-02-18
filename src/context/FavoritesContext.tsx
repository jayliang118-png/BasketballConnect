'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { FavoriteTeam, FavoritesState } from '@/types/favorites'
import type { Guid } from '@/types/common'

const STORAGE_KEY = 'basketball-hub-favorite-teams'

const INITIAL_STATE: FavoritesState = {
  teams: [],
  isHydrated: false,
}

export interface FavoritesContextValue {
  readonly state: FavoritesState
  readonly addFavorite: (team: FavoriteTeam) => void
  readonly removeFavorite: (teamUniqueKey: Guid) => void
  readonly updateFavorite: (team: FavoriteTeam) => void
  readonly isFavorite: (teamUniqueKey: Guid) => boolean
  readonly toggleFavorite: (team: FavoriteTeam) => void
  readonly favoritesCount: number
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

interface FavoritesProviderProps {
  readonly children: React.ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [state, setState] = useState<FavoritesState>(INITIAL_STATE)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const teams: readonly FavoriteTeam[] = stored ? JSON.parse(stored) : []
      setState({ teams, isHydrated: true })
    } catch {
      setState({ teams: [], isHydrated: true })
    }
  }, [])

  useEffect(() => {
    if (!state.isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.teams))
    } catch {
      // localStorage full or unavailable
    }
  }, [state.teams, state.isHydrated])

  const addFavorite = useCallback((team: FavoriteTeam) => {
    setState((prev) => {
      if (prev.teams.some((t) => t.teamUniqueKey === team.teamUniqueKey)) return prev
      return { ...prev, teams: [...prev.teams, team] }
    })
  }, [])

  const removeFavorite = useCallback((teamUniqueKey: Guid) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.teamUniqueKey !== teamUniqueKey),
    }))
  }, [])

  const updateFavorite = useCallback((team: FavoriteTeam) => {
    setState((prev) => {
      const existing = prev.teams.find((t) => t.teamUniqueKey === team.teamUniqueKey)
      if (!existing) return prev
      const merged = { ...existing, ...team }
      if (
        existing.name === merged.name &&
        JSON.stringify(existing.breadcrumbs) === JSON.stringify(merged.breadcrumbs) &&
        JSON.stringify(existing.params) === JSON.stringify(merged.params)
      ) {
        return prev
      }
      const updated = prev.teams.map((t) =>
        t.teamUniqueKey === team.teamUniqueKey ? merged : t
      )
      return { ...prev, teams: updated }
    })
  }, [])

  const isFavorite = useCallback(
    (teamUniqueKey: Guid): boolean =>
      state.teams.some((t) => t.teamUniqueKey === teamUniqueKey),
    [state.teams],
  )

  const toggleFavorite = useCallback((team: FavoriteTeam) => {
    setState((prev) => {
      const exists = prev.teams.some((t) => t.teamUniqueKey === team.teamUniqueKey)
      if (exists) {
        return { ...prev, teams: prev.teams.filter((t) => t.teamUniqueKey !== team.teamUniqueKey) }
      }
      return { ...prev, teams: [...prev.teams, team] }
    })
  }, [])

  const favoritesCount = state.teams.length

  const value = useMemo<FavoritesContextValue>(
    () => ({ state, addFavorite, removeFavorite, updateFavorite, isFavorite, toggleFavorite, favoritesCount }),
    [state, addFavorite, removeFavorite, updateFavorite, isFavorite, toggleFavorite, favoritesCount],
  )

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  )
}
