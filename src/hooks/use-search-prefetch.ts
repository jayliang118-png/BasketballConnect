'use client'

import { useEffect, useRef } from 'react'
import { useGlobalSearchIndex } from './use-global-search-index'
import type { SearchableEntity } from '@/types/global-search'

interface Organisation {
  readonly organisationUniqueKey: string
  readonly name: string
}

interface Competition {
  readonly id: number
  readonly uniqueKey: string
  readonly name: string
  readonly [key: string]: unknown
}

interface Division {
  readonly id: number
  readonly name: string
  readonly [key: string]: unknown
}

/**
 * Background pre-fetches competitions and divisions for all loaded organisations,
 * registering them into the global search index so search results span all entity types.
 *
 * Fetches are throttled (small batches with delays) to avoid flooding the API.
 */
export function useSearchPrefetch(organisations: readonly Organisation[] | null) {
  const { register } = useGlobalSearchIndex()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!organisations || organisations.length === 0) return
    if (hasFetched.current) return
    hasFetched.current = true

    const controller = new AbortController()

    prefetchAll(organisations, register, controller.signal)

    return () => {
      controller.abort()
    }
  }, [organisations, register])
}

async function prefetchAll(
  orgs: readonly Organisation[],
  register: (entities: readonly SearchableEntity[]) => void,
  signal: AbortSignal,
) {
  const { fetchCompetitions } = await import('@/services/competition.service')
  const { fetchDivisions } = await import('@/services/division.service')
  const { extractArray } = await import('@/lib/utils')

  for (const org of orgs) {
    if (signal.aborted) return

    try {
      const rawComps = await fetchCompetitions(org.organisationUniqueKey)
      const comps = extractArray(rawComps) as readonly Competition[]

      if (signal.aborted) return

      const compEntities: SearchableEntity[] = comps
        .filter((c) => c.uniqueKey && c.name)
        .map((comp) => {
          const params: Record<string, string | number> = {
            competitionKey: comp.uniqueKey,
            competitionId: comp.id,
            organisationUniqueKey: org.organisationUniqueKey,
          }
          return {
            type: 'competition' as const,
            id: comp.uniqueKey,
            name: comp.name ?? '',
            parentLabel: org.name ?? '',
            targetView: 'divisions' as const,
            breadcrumbs: [
              { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
              { label: org.name ?? '', view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } },
              { label: comp.name ?? '', view: 'divisions' as const, params },
            ],
            params,
          }
        })

      if (compEntities.length > 0) {
        register(compEntities)
      }

      // Pre-fetch divisions for each competition
      for (const comp of comps) {
        if (signal.aborted) return
        if (!comp.uniqueKey) continue

        try {
          const rawDivs = await fetchDivisions(comp.uniqueKey)
          const divs = extractArray(rawDivs) as readonly Division[]

          if (signal.aborted) return

          const divEntities: SearchableEntity[] = divs
            .filter((d) => d.id && d.name)
            .map((div) => {
              const divParams: Record<string, string | number> = {
                competitionKey: comp.uniqueKey,
                competitionId: comp.id,
                organisationUniqueKey: org.organisationUniqueKey,
                divisionId: div.id,
                divisionName: div.name,
              }
              return {
                type: 'division' as const,
                id: String(div.id),
                name: div.name ?? '',
                parentLabel: [org.name, comp.name].filter(Boolean).join(' > '),
                targetView: 'divisionDetail' as const,
                breadcrumbs: [
                  { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
                  { label: org.name ?? '', view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
                  { label: comp.name ?? '', view: 'divisions' as const, params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
                  { label: div.name ?? '', view: 'divisionDetail' as const, params: divParams },
                ],
                params: divParams,
              }
            })

          if (divEntities.length > 0) {
            register(divEntities)
          }
        } catch {
          // Silently skip failed division fetches
        }

        // Small delay between division fetches to avoid flooding
        await delay(50, signal)
      }
    } catch {
      // Silently skip failed competition fetches
    }

    // Delay between org fetches
    await delay(100, signal)
  }
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
  })
}
