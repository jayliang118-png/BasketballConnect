import type { SearchableEntity } from '@/types/global-search'

const CACHE_KEY = 'basketball-hub:search-index'
const CACHE_VERSION = 1
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CachedIndex {
  readonly version: number
  readonly timestamp: number
  readonly entries: readonly SearchableEntity[]
}

export function loadCachedIndex(): ReadonlyMap<string, SearchableEntity> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return new Map()

    const parsed: CachedIndex = JSON.parse(raw)

    if (parsed.version !== CACHE_VERSION) return new Map()
    if (Date.now() - parsed.timestamp > CACHE_MAX_AGE_MS) return new Map()
    if (!Array.isArray(parsed.entries)) return new Map()

    const map = new Map<string, SearchableEntity>()
    for (const entity of parsed.entries) {
      map.set(`${entity.type}:${entity.id}`, entity)
    }
    return map
  } catch {
    return new Map()
  }
}

/**
 * Lightweight check: returns true when a non-expired cache with at least one
 * entry exists in localStorage. Does NOT deserialise the full entry list so
 * it is cheap to call during render / effects.
 */
export function isCacheValid(): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return false

    const parsed: CachedIndex = JSON.parse(raw)

    if (parsed.version !== CACHE_VERSION) return false
    if (Date.now() - parsed.timestamp > CACHE_MAX_AGE_MS) return false
    if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) return false

    return true
  } catch {
    return false
  }
}

export function saveCachedIndex(entities: ReadonlyMap<string, SearchableEntity>): void {
  try {
    const payload: CachedIndex = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      entries: Array.from(entities.values()),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}
