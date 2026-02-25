// ---------------------------------------------------------------------------
// Favorite URL Parser - Extracts route segments from team favorite URLs
// and groups favorites by division for efficient polling
// ---------------------------------------------------------------------------

import type { FavoriteItem } from '@/types/favorites'

export interface ParsedFavoriteUrl {
  readonly orgKey: string
  readonly compKey: string
  readonly divisionId: number
  readonly teamKey: string
}

export interface DivisionGroup {
  readonly orgKey: string
  readonly compKey: string
  readonly divisionId: number
  readonly teamKeys: readonly string[]
}

const TEAM_URL_PATTERN =
  /^\/orgs\/([^/]+)\/competitions\/([^/]+)\/divisions\/(\d+)\/teams\/([^/]+)$/

/**
 * Extracts orgKey, compKey, divisionId, and teamKey from a team favorite URL.
 * Returns null if the URL does not match the expected pattern.
 */
export function parseFavoriteTeamUrl(
  url: string,
): ParsedFavoriteUrl | null {
  const match = TEAM_URL_PATTERN.exec(url)
  if (!match) return null

  return {
    orgKey: match[1],
    compKey: match[2],
    divisionId: Number(match[3]),
    teamKey: match[4],
  }
}

/**
 * Groups team favorites by division, producing one DivisionGroup per unique
 * (orgKey, compKey, divisionId) combination. Non-team items and items
 * without URLs are filtered out.
 */
export function groupFavoritesByDivision(
  items: readonly FavoriteItem[],
): readonly DivisionGroup[] {
  const grouped = items
    .filter(
      (item): item is FavoriteItem & { url: string } =>
        item.type === 'team' && Boolean(item.url),
    )
    .reduce<Record<string, DivisionGroup>>((acc, item) => {
      const parsed = parseFavoriteTeamUrl(item.url)
      if (!parsed) return acc

      const key = `${parsed.orgKey}:${parsed.compKey}:${parsed.divisionId}`
      const existing = acc[key]

      if (existing) {
        const alreadyIncluded = existing.teamKeys.includes(parsed.teamKey)
        if (alreadyIncluded) return acc

        return {
          ...acc,
          [key]: {
            ...existing,
            teamKeys: [...existing.teamKeys, parsed.teamKey],
          },
        }
      }

      return {
        ...acc,
        [key]: {
          orgKey: parsed.orgKey,
          compKey: parsed.compKey,
          divisionId: parsed.divisionId,
          teamKeys: [parsed.teamKey],
        },
      }
    }, {})

  return Object.values(grouped)
}
