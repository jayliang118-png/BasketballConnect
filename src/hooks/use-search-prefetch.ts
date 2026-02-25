'use client'

import { useEffect, useRef } from 'react'
import { useGlobalSearchActions } from './use-global-search-index'
import { isCacheValid } from '@/lib/search-index-cache'
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

interface Team {
  readonly id: number
  readonly name: string
  readonly teamUniqueKey?: string
  readonly [key: string]: unknown
}

interface TeamDetail {
  readonly teamUniqueKey: string
  readonly name: string
  readonly players: readonly {
    readonly playerId: number
    readonly firstName: string
    readonly lastName: string
  }[]
}

/**
 * Background pre-fetches all entity types (organisations, competitions,
 * divisions, teams, players) and registers them into the global search index.
 *
 * Fetches are throttled with delays to avoid flooding the API.
 */
export function useSearchPrefetch(organisations: readonly Organisation[] | null) {
  const { register } = useGlobalSearchActions()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!organisations || organisations.length === 0) return
    if (hasFetched.current) return
    hasFetched.current = true

    // Skip network prefetch if we already have a valid cached index
    if (isCacheValid()) return

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
  // Register organisations immediately
  const orgEntities: SearchableEntity[] = orgs
    .filter((o) => o.organisationUniqueKey && o.name)
    .map((org) => ({
      type: 'organisation' as const,
      id: org.organisationUniqueKey,
      name: org.name,
      targetView: 'competitions' as const,
      breadcrumbs: [
        { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
        { label: org.name, view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } },
      ],
      params: { organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number>,
    }))

  if (orgEntities.length > 0) {
    register(orgEntities)
  }

  const { fetchCompetitions } = await import('@/services/competition.service')
  const { fetchDivisions } = await import('@/services/division.service')
  const { fetchTeams } = await import('@/services/team.service')
  const { fetchTeamDetail } = await import('@/services/team.service')
  const { extractArray } = await import('@/lib/utils')

  for (const org of orgs) {
    if (signal.aborted) return

    try {
      const rawComps = await fetchCompetitions(org.organisationUniqueKey)
      const comps = extractArray(rawComps) as readonly Competition[]

      if (signal.aborted) return

      const compEntities: SearchableEntity[] = comps
        .filter((c) => c.uniqueKey && c.name)
        .map((comp) => ({
          type: 'competition' as const,
          id: comp.uniqueKey,
          name: comp.name ?? '',
          parentLabel: org.name ?? '',
          targetView: 'divisions' as const,
          breadcrumbs: [
            { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
            { label: org.name ?? '', view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
            { label: comp.name ?? '', view: 'divisions' as const, params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
          ],
          params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number>,
        }))

      if (compEntities.length > 0) {
        register(compEntities)
      }

      // Fetch divisions for each competition
      for (const comp of comps) {
        if (signal.aborted) return
        if (!comp.uniqueKey) continue

        try {
          const rawDivs = await fetchDivisions(comp.uniqueKey)
          const divs = extractArray(rawDivs) as readonly Division[]

          if (signal.aborted) return

          const divEntities: SearchableEntity[] = divs
            .filter((d) => d.id && d.name)
            .map((div) => ({
              type: 'division' as const,
              id: String(div.id),
              name: div.name ?? '',
              parentLabel: [org.name, comp.name].filter(Boolean).join(' > '),
              targetView: 'divisionDetail' as const,
              breadcrumbs: [
                { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
                { label: org.name ?? '', view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
                { label: comp.name ?? '', view: 'divisions' as const, params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number> },
                { label: div.name ?? '', view: 'divisionDetail' as const, params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey, divisionId: div.id, divisionName: div.name } as Record<string, string | number> },
              ],
              params: { competitionKey: comp.uniqueKey, competitionId: comp.id, organisationUniqueKey: org.organisationUniqueKey, divisionId: div.id, divisionName: div.name } as Record<string, string | number>,
            }))

          if (divEntities.length > 0) {
            register(divEntities)
          }

          // Fetch teams for each division
          for (const div of divs) {
            if (signal.aborted) return
            if (!div.id) continue

            try {
              const rawTeams = await fetchTeams(comp.id, div.id, org.organisationUniqueKey)
              const teams = extractArray(rawTeams) as readonly Team[]

              if (signal.aborted) return

              const teamEntities: SearchableEntity[] = teams
                .filter((t) => t.name)
                .map((team) => {
                  const teamKey = team.teamUniqueKey ?? `team-${team.id}`
                  return {
                    type: 'team' as const,
                    id: teamKey,
                    name: team.name ?? '',
                    parentLabel: [org.name, comp.name, div.name].filter(Boolean).join(' > '),
                    targetView: 'teamDetail' as const,
                    breadcrumbs: [],
                    params: {
                      organisationUniqueKey: org.organisationUniqueKey,
                      competitionKey: comp.uniqueKey,
                      competitionId: comp.id,
                      divisionId: div.id,
                      teamUniqueKey: teamKey,
                    } as Record<string, string | number>,
                  }
                })

              if (teamEntities.length > 0) {
                register(teamEntities)
              }

              // Fetch players from team detail for teams with real GUIDs
              for (const team of teams) {
                if (signal.aborted) return
                const teamKey = team.teamUniqueKey
                if (!teamKey || teamKey.startsWith('team-')) continue

                try {
                  const detail = (await fetchTeamDetail(teamKey)) as TeamDetail
                  const players = detail?.players

                  if (signal.aborted) return

                  if (players && players.length > 0) {
                    const parentLabel = [org.name, comp.name, div.name, team.name].filter(Boolean).join(' > ')
                    const playerEntities: SearchableEntity[] = players
                      .filter((p) => p.playerId && (p.firstName || p.lastName))
                      .map((player) => {
                        const fullName = `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim()
                        return {
                          type: 'player' as const,
                          id: String(player.playerId),
                          name: fullName,
                          parentLabel,
                          targetView: 'playerProfile' as const,
                          breadcrumbs: [],
                          params: { playerId: player.playerId } as Record<string, string | number>,
                        }
                      })

                    if (playerEntities.length > 0) {
                      register(playerEntities)
                    }
                  }
                } catch {
                  // Silently skip failed team detail fetches
                }

                await delay(100, signal)
              }
            } catch {
              // Silently skip failed team fetches
            }

            await delay(75, signal)
          }
        } catch {
          // Silently skip failed division fetches
        }

        await delay(50, signal)
      }
    } catch {
      // Silently skip failed competition fetches
    }

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
