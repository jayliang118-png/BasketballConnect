import type { FavoriteItem } from '@/types/favorites'

const LEGACY_STORAGE_KEY = 'basketball-hub-favorite-teams'

interface LegacyFavoriteTeam {
  readonly teamUniqueKey: string
  readonly name: string
  readonly url?: string
}

export function migrateLegacyTeamFavorites(): readonly FavoriteItem[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is LegacyFavoriteTeam =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.teamUniqueKey === 'string' &&
          typeof item.name === 'string',
      )
      .map(
        (item): FavoriteItem => ({
          type: 'team',
          id: item.teamUniqueKey,
          name: item.name,
          url: item.url,
        }),
      )
  } catch {
    return []
  }
}

export function removeLegacyStorage(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // localStorage unavailable
  }
}
