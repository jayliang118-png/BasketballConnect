'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { FavoriteItem, FavoriteType, FavoritesState } from '@/types/favorites'
import {
  migrateLegacyTeamFavorites,
  removeLegacyStorage,
} from '@/lib/favorites-migration'

const STORAGE_KEY = 'basketball-hub-favorites'

const INITIAL_STATE: FavoritesState = {
  items: [],
  isHydrated: false,
}

function matchesItem(a: FavoriteItem, type: FavoriteType, id: string): boolean {
  return a.type === type && a.id === id
}

export interface FavoritesContextValue {
  readonly state: FavoritesState
  readonly addFavorite: (item: FavoriteItem) => void
  readonly removeFavorite: (type: FavoriteType, id: string) => void
  readonly updateFavorite: (item: FavoriteItem) => void
  readonly isFavorite: (type: FavoriteType, id: string) => boolean
  readonly toggleFavorite: (item: FavoriteItem) => void
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
      const existingItems: readonly FavoriteItem[] = stored
        ? JSON.parse(stored)
        : []

      if (existingItems.length > 0) {
        setState({ items: existingItems, isHydrated: true })
      } else {
        const legacyItems = migrateLegacyTeamFavorites()
        setState({ items: legacyItems, isHydrated: true })
        if (legacyItems.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyItems))
          removeLegacyStorage()
        }
      }
    } catch {
      setState({ items: [], isHydrated: true })
    }
  }, [])

  useEffect(() => {
    if (!state.isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // localStorage full or unavailable
    }
  }, [state.items, state.isHydrated])

  const addFavorite = useCallback((item: FavoriteItem) => {
    setState((prev) => {
      if (prev.items.some((i) => matchesItem(i, item.type, item.id)))
        return prev
      return { ...prev, items: [...prev.items, item] }
    })
  }, [])

  const removeFavorite = useCallback((type: FavoriteType, id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => !matchesItem(i, type, id)),
    }))
  }, [])

  const updateFavorite = useCallback((item: FavoriteItem) => {
    setState((prev) => {
      const existing = prev.items.find((i) =>
        matchesItem(i, item.type, item.id),
      )
      if (!existing) return prev
      const merged = { ...existing, ...item }
      if (existing.name === merged.name && existing.url === merged.url) {
        return prev
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          matchesItem(i, item.type, item.id) ? merged : i,
        ),
      }
    })
  }, [])

  const isFavorite = useCallback(
    (type: FavoriteType, id: string): boolean =>
      state.items.some((i) => matchesItem(i, type, id)),
    [state.items],
  )

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setState((prev) => {
      const exists = prev.items.some((i) =>
        matchesItem(i, item.type, item.id),
      )
      if (exists) {
        return {
          ...prev,
          items: prev.items.filter((i) => !matchesItem(i, item.type, item.id)),
        }
      }
      return { ...prev, items: [...prev.items, item] }
    })
  }, [])

  const favoritesCount = state.items.length

  const value = useMemo<FavoritesContextValue>(
    () => ({
      state,
      addFavorite,
      removeFavorite,
      updateFavorite,
      isFavorite,
      toggleFavorite,
      favoritesCount,
    }),
    [
      state,
      addFavorite,
      removeFavorite,
      updateFavorite,
      isFavorite,
      toggleFavorite,
      favoritesCount,
    ],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
