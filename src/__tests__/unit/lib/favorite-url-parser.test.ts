import { describe, it, expect } from '@jest/globals'
import {
  parseFavoriteTeamUrl,
  groupFavoritesByDivision,
} from '@/lib/favorite-url-parser'
import type { FavoriteItem } from '@/types/favorites'

function teamItem(overrides: Partial<FavoriteItem> = {}): FavoriteItem {
  return {
    type: 'team',
    id: 'team-1',
    name: 'Sydney Kings',
    url: '/orgs/bca/competitions/abc-123/divisions/101/teams/sydney-kings',
    ...overrides,
  }
}

describe('favorite-url-parser', () => {
  describe('parseFavoriteTeamUrl', () => {
    it('extracts all four segments from a valid team URL', () => {
      const result = parseFavoriteTeamUrl(
        '/orgs/bca/competitions/abc-123/divisions/101/teams/sydney-kings',
      )

      expect(result).toEqual({
        orgKey: 'bca',
        compKey: 'abc-123',
        divisionId: 101,
        teamKey: 'sydney-kings',
      })
    })

    it('returns divisionId as a number type', () => {
      const result = parseFavoriteTeamUrl(
        '/orgs/bca/competitions/abc-123/divisions/42/teams/team-x',
      )

      expect(result).not.toBeNull()
      expect(typeof result!.divisionId).toBe('number')
    })

    it('returns null for an empty string', () => {
      expect(parseFavoriteTeamUrl('')).toBeNull()
    })

    it('returns null for a URL missing segments', () => {
      expect(
        parseFavoriteTeamUrl('/orgs/bca/competitions/abc'),
      ).toBeNull()
    })

    it('returns null for a non-team URL (division level)', () => {
      expect(
        parseFavoriteTeamUrl(
          '/orgs/bca/competitions/abc-123/divisions/101',
        ),
      ).toBeNull()
    })

    it('returns null for a URL with non-numeric divisionId', () => {
      expect(
        parseFavoriteTeamUrl(
          '/orgs/bca/competitions/abc-123/divisions/abc/teams/team-x',
        ),
      ).toBeNull()
    })

    it('returns null for a URL with trailing slash', () => {
      expect(
        parseFavoriteTeamUrl(
          '/orgs/bca/competitions/abc-123/divisions/101/teams/sydney-kings/',
        ),
      ).toBeNull()
    })

    it('returns null for a URL with extra path segments', () => {
      expect(
        parseFavoriteTeamUrl(
          '/orgs/bca/competitions/abc-123/divisions/101/teams/sydney-kings/extra',
        ),
      ).toBeNull()
    })
  })

  describe('groupFavoritesByDivision', () => {
    it('returns empty array for empty input', () => {
      expect(groupFavoritesByDivision([])).toEqual([])
    })

    it('filters out non-team favorites', () => {
      const items: readonly FavoriteItem[] = [
        {
          type: 'player',
          id: 'player-1',
          name: 'John Doe',
          url: '/orgs/bca/competitions/abc-123/divisions/101/teams/sydney-kings',
        },
        {
          type: 'division',
          id: 'div-1',
          name: 'Division A',
          url: '/orgs/bca/competitions/abc-123/divisions/101',
        },
        {
          type: 'organisation',
          id: 'org-1',
          name: 'BCA',
        },
      ]

      expect(groupFavoritesByDivision(items)).toEqual([])
    })

    it('filters out team favorites without a url', () => {
      const items: readonly FavoriteItem[] = [
        { type: 'team', id: 'team-1', name: 'No URL Team' },
      ]

      expect(groupFavoritesByDivision(items)).toEqual([])
    })

    it('groups two teams in the same division into one group', () => {
      const items: readonly FavoriteItem[] = [
        teamItem({ id: 'team-1', name: 'Team A', url: '/orgs/bca/competitions/abc-123/divisions/101/teams/team-a' }),
        teamItem({ id: 'team-2', name: 'Team B', url: '/orgs/bca/competitions/abc-123/divisions/101/teams/team-b' }),
      ]

      const result = groupFavoritesByDivision(items)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        orgKey: 'bca',
        compKey: 'abc-123',
        divisionId: 101,
        teamKeys: ['team-a', 'team-b'],
      })
    })

    it('creates separate groups for teams in different divisions', () => {
      const items: readonly FavoriteItem[] = [
        teamItem({ id: 'team-1', url: '/orgs/bca/competitions/abc-123/divisions/101/teams/team-a' }),
        teamItem({ id: 'team-2', url: '/orgs/bca/competitions/abc-123/divisions/202/teams/team-b' }),
      ]

      const result = groupFavoritesByDivision(items)

      expect(result).toHaveLength(2)

      const div101 = result.find((g) => g.divisionId === 101)
      const div202 = result.find((g) => g.divisionId === 202)

      expect(div101).toBeDefined()
      expect(div101!.teamKeys).toEqual(['team-a'])
      expect(div202).toBeDefined()
      expect(div202!.teamKeys).toEqual(['team-b'])
    })

    it('handles a single team correctly', () => {
      const items: readonly FavoriteItem[] = [teamItem()]

      const result = groupFavoritesByDivision(items)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        orgKey: 'bca',
        compKey: 'abc-123',
        divisionId: 101,
        teamKeys: ['sydney-kings'],
      })
    })

    it('deduplicates the same team appearing twice', () => {
      const items: readonly FavoriteItem[] = [
        teamItem({ id: 'team-1' }),
        teamItem({ id: 'team-1-dupe' }),
      ]

      const result = groupFavoritesByDivision(items)

      expect(result).toHaveLength(1)
      expect(result[0].teamKeys).toEqual(['sydney-kings'])
    })

    it('creates separate groups for different competitions', () => {
      const items: readonly FavoriteItem[] = [
        teamItem({ id: 'team-1', url: '/orgs/bca/competitions/comp-a/divisions/101/teams/team-x' }),
        teamItem({ id: 'team-2', url: '/orgs/bca/competitions/comp-b/divisions/101/teams/team-y' }),
      ]

      const result = groupFavoritesByDivision(items)

      expect(result).toHaveLength(2)
    })
  })
})
