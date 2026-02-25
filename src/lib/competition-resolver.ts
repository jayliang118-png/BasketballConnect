// ---------------------------------------------------------------------------
// Competition Resolver - Maps compKey to numeric competitionId with caching
// ---------------------------------------------------------------------------

interface Competition {
  readonly id: number
  readonly uniqueKey: string
}

interface CompetitionResolver {
  readonly resolve: (orgKey: string, compKey: string) => Promise<number | null>
  readonly clearCache: () => void
}

/**
 * Creates a competition resolver that caches API responses by orgKey.
 * Concurrent calls for the same orgKey share a single in-flight request.
 * Errors return null without crashing and evict the failed cache entry.
 */
export function createCompetitionResolver(): CompetitionResolver {
  const cache = new Map<string, Promise<unknown>>()

  async function resolve(
    orgKey: string,
    compKey: string,
  ): Promise<number | null> {
    try {
      if (!cache.has(orgKey)) {
        const { fetchCompetitions } = await import(
          '@/services/competition.service'
        )
        cache.set(orgKey, fetchCompetitions(orgKey))
      }

      const data = await cache.get(orgKey)

      if (!Array.isArray(data)) return null

      const match = data.find(
        (c: Competition) => c.uniqueKey === compKey,
      )

      return match ? match.id : null
    } catch {
      cache.delete(orgKey)
      return null
    }
  }

  function clearCache(): void {
    cache.clear()
  }

  return { resolve, clearCache }
}
