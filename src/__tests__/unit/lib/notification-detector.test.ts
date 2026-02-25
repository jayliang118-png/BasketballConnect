import { describe, it, expect } from '@jest/globals'
import {
  detectGameStart,
  detectGameEnd,
  detectUpcomingFixture,
  createDeduplicator,
} from '@/lib/notification-detector'
import type { MatchSnapshot } from '@/lib/notification-detector'

function makeSnapshot(overrides: Partial<MatchSnapshot> = {}): MatchSnapshot {
  return {
    matchId: 1001,
    status: 'SCHEDULED',
    startTime: '2026-02-25T18:00:00.000Z',
    team1Name: 'Eagles',
    team2Name: 'Hawks',
    team1Score: 0,
    team2Score: 0,
    team1Key: 'team-eagles-key',
    team2Key: 'team-hawks-key',
    team1Id: 1,
    team2Id: 2,
    ...overrides,
  }
}

describe('notification-detector', () => {
  describe('detectGameStart', () => {
    it('returns result when previous is SCHEDULED and current is LIVE', () => {
      const snapshot = makeSnapshot({ status: 'LIVE' })
      const result = detectGameStart(snapshot, 'SCHEDULED')

      expect(result).not.toBeNull()
      expect(result!.type).toBe('GAME_START')
    })

    it('returns null when previous is SCHEDULED and current is SCHEDULED', () => {
      const snapshot = makeSnapshot({ status: 'SCHEDULED' })
      const result = detectGameStart(snapshot, 'SCHEDULED')

      expect(result).toBeNull()
    })

    it('returns null when previous is undefined and current is LIVE', () => {
      const snapshot = makeSnapshot({ status: 'LIVE' })
      const result = detectGameStart(snapshot, undefined)

      expect(result).toBeNull()
    })

    it('returns null when previous is LIVE and current is LIVE', () => {
      const snapshot = makeSnapshot({ status: 'LIVE' })
      const result = detectGameStart(snapshot, 'LIVE')

      expect(result).toBeNull()
    })

    it('message includes both team names', () => {
      const snapshot = makeSnapshot({
        status: 'LIVE',
        team1Name: 'Celtics',
        team2Name: 'Lakers',
      })
      const result = detectGameStart(snapshot, 'SCHEDULED')

      expect(result!.message).toBe('Celtics vs Lakers is now live!')
    })

    it('link is /games/{matchId}', () => {
      const snapshot = makeSnapshot({ status: 'LIVE', matchId: 42 })
      const result = detectGameStart(snapshot, 'SCHEDULED')

      expect(result!.link).toBe('/games/42')
    })
  })

  describe('detectGameEnd', () => {
    it('returns result when previous is LIVE and current is ENDED', () => {
      const snapshot = makeSnapshot({
        status: 'ENDED',
        team1Score: 88,
        team2Score: 76,
      })
      const result = detectGameEnd(snapshot, 'LIVE')

      expect(result).not.toBeNull()
      expect(result!.type).toBe('GAME_END')
    })

    it('returns null when previous is ENDED and current is ENDED', () => {
      const snapshot = makeSnapshot({ status: 'ENDED' })
      const result = detectGameEnd(snapshot, 'ENDED')

      expect(result).toBeNull()
    })

    it('returns null when previous is SCHEDULED and current is ENDED', () => {
      const snapshot = makeSnapshot({ status: 'ENDED' })
      const result = detectGameEnd(snapshot, 'SCHEDULED')

      expect(result).toBeNull()
    })

    it('message includes both team names and final score', () => {
      const snapshot = makeSnapshot({
        status: 'ENDED',
        team1Name: 'Bulls',
        team2Name: 'Nets',
        team1Score: 102,
        team2Score: 98,
      })
      const result = detectGameEnd(snapshot, 'LIVE')

      expect(result!.message).toContain('Bulls')
      expect(result!.message).toContain('Nets')
      expect(result!.message).toContain('102')
      expect(result!.message).toContain('98')
      expect(result!.message).toContain('Final')
    })

    it('link is /games/{matchId}', () => {
      const snapshot = makeSnapshot({ status: 'ENDED', matchId: 55 })
      const result = detectGameEnd(snapshot, 'LIVE')

      expect(result!.link).toBe('/games/55')
    })
  })

  describe('detectUpcomingFixture', () => {
    it('returns result when match is SCHEDULED and starts in 12 hours', () => {
      const now = new Date('2026-02-25T06:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).not.toBeNull()
      expect(result!.type).toBe('UPCOMING_FIXTURE')
    })

    it('returns result when match is SCHEDULED and starts in 1 hour', () => {
      const now = new Date('2026-02-25T17:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).not.toBeNull()
      expect(result!.type).toBe('UPCOMING_FIXTURE')
    })

    it('returns null when match starts in 36 hours', () => {
      const now = new Date('2026-02-24T06:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).toBeNull()
    })

    it('returns null when match start time is in the past', () => {
      const now = new Date('2026-02-25T20:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).toBeNull()
    })

    it('returns null when match status is LIVE', () => {
      const now = new Date('2026-02-25T17:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'LIVE',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).toBeNull()
    })

    it('returns null when match status is ENDED', () => {
      const now = new Date('2026-02-25T17:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'ENDED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result).toBeNull()
    })

    it('message includes formatted start time', () => {
      const now = new Date('2026-02-25T06:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result!.message).toContain('Eagles vs Hawks starts at')
    })

    it('link is /games/{matchId}', () => {
      const now = new Date('2026-02-25T06:00:00.000Z')
      const snapshot = makeSnapshot({
        status: 'SCHEDULED',
        matchId: 77,
        startTime: '2026-02-25T18:00:00.000Z',
      })
      const result = detectUpcomingFixture(snapshot, now)

      expect(result!.link).toBe('/games/77')
    })
  })

  describe('createDeduplicator', () => {
    it('hasSeen returns false for unseen event', () => {
      const dedup = createDeduplicator()

      expect(dedup.hasSeen(100, 'GAME_START')).toBe(false)
    })

    it('hasSeen returns true after markSeen', () => {
      const dedup = createDeduplicator()

      dedup.markSeen(100, 'GAME_START')

      expect(dedup.hasSeen(100, 'GAME_START')).toBe(true)
    })

    it('different event types for same matchId are independent', () => {
      const dedup = createDeduplicator()

      dedup.markSeen(100, 'GAME_START')

      expect(dedup.hasSeen(100, 'GAME_START')).toBe(true)
      expect(dedup.hasSeen(100, 'GAME_END')).toBe(false)
      expect(dedup.hasSeen(100, 'UPCOMING_FIXTURE')).toBe(false)
    })

    it('clear resets all seen events', () => {
      const dedup = createDeduplicator()

      dedup.markSeen(100, 'GAME_START')
      dedup.markSeen(200, 'GAME_END')
      dedup.clear()

      expect(dedup.hasSeen(100, 'GAME_START')).toBe(false)
      expect(dedup.hasSeen(200, 'GAME_END')).toBe(false)
    })
  })
})
