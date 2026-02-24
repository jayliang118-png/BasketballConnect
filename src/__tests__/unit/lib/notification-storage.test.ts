import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  loadNotifications,
  saveNotifications,
  STORAGE_KEY,
} from '@/lib/notification-storage'
import type { Notification } from '@/types/notification'

function validNotification(
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id: 'test-001',
    type: 'GAME_START',
    timestamp: '2026-02-25T10:00:00.000Z',
    message: 'Game started',
    link: '/game/123',
    read: false,
    matchId: 123,
    expiresAt: '2026-03-04T10:00:00.000Z',
    ...overrides,
  }
}

describe('notification-storage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers({
      now: new Date('2026-02-25T12:00:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('loadNotifications', () => {
    it('returns empty array when localStorage key is missing', () => {
      const result = loadNotifications()
      expect(result).toEqual([])
    })

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json{')
      const result = loadNotifications()
      expect(result).toEqual([])
    })

    it('returns empty array when stored data has no version field', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ notifications: [] }),
      )
      const result = loadNotifications()
      expect(result).toEqual([])
    })

    it('returns empty array when stored data has wrong version', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 999, notifications: [] }),
      )
      const result = loadNotifications()
      expect(result).toEqual([])
    })

    it('returns empty array when notifications field is not an array', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, notifications: 'string' }),
      )
      const result = loadNotifications()
      expect(result).toEqual([])
    })

    it('returns valid notifications from well-formed storage', () => {
      const notification = validNotification()
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, notifications: [notification] }),
      )

      const result = loadNotifications()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'test-001',
          type: 'GAME_START',
          message: 'Game started',
          link: '/game/123',
          read: false,
          matchId: 123,
        }),
      )
    })

    it('filters out invalid notifications while keeping valid ones', () => {
      const valid = validNotification()
      const invalid = { id: 'bad-001', type: 'GAME_START' } // missing required fields

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          notifications: [valid, invalid],
        }),
      )

      const result = loadNotifications()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(expect.objectContaining({ id: 'test-001' }))
    })

    it('filters out expired notifications', () => {
      const expired = validNotification({
        id: 'expired-001',
        expiresAt: '2026-02-24T10:00:00.000Z',
      })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, notifications: [expired] }),
      )

      const result = loadNotifications()

      expect(result).toEqual([])
    })

    it('keeps non-expired notifications', () => {
      const future = validNotification({
        id: 'future-001',
        expiresAt: '2026-03-04T10:00:00.000Z',
      })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, notifications: [future] }),
      )

      const result = loadNotifications()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(expect.objectContaining({ id: 'future-001' }))
    })

    it('handles localStorage.getItem throwing an error', () => {
      jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage unavailable')
        })

      const result = loadNotifications()

      expect(result).toEqual([])
    })
  })

  describe('saveNotifications', () => {
    it('writes correct JSON structure with version field', () => {
      const notification = validNotification()

      saveNotifications([notification])

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(1)
      expect(parsed.notifications).toHaveLength(1)
      expect(parsed.notifications[0].id).toBe('test-001')
    })

    it('writes empty array correctly', () => {
      saveNotifications([])

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(1)
      expect(parsed.notifications).toEqual([])
    })

    it('handles localStorage quota exceeded gracefully', () => {
      jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new DOMException('QuotaExceededError')
        })

      expect(() => saveNotifications([validNotification()])).not.toThrow()
    })

    it('does not mutate the input array', () => {
      const notifications: readonly Notification[] = [validNotification()]
      const original = JSON.stringify(notifications)

      saveNotifications(notifications)

      expect(JSON.stringify(notifications)).toBe(original)
    })
  })
})
