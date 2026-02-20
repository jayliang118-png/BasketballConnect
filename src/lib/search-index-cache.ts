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
