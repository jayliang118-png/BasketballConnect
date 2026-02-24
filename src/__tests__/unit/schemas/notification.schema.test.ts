import { describe, it, expect } from '@jest/globals'
import {
  NotificationSchema,
  NotificationTypeSchema,
  NotificationStorageSchema,
} from '@/schemas/notification.schema'

describe('Notification Schemas', () => {
  const validNotification = {
    id: 'test-notification-001',
    type: 'GAME_START',
    timestamp: '2026-02-25T10:00:00.000Z',
    message: 'Southern Spartans game is now LIVE',
    link: '/orgs/abc/comps/def/divs/ghi/game/123',
    read: false,
    matchId: 12345,
    expiresAt: '2026-03-04T10:00:00.000Z',
  }

  describe('NotificationTypeSchema', () => {
    it('accepts GAME_START', () => {
      const result = NotificationTypeSchema.safeParse('GAME_START')
      expect(result.success).toBe(true)
    })

    it('accepts GAME_END', () => {
      const result = NotificationTypeSchema.safeParse('GAME_END')
      expect(result.success).toBe(true)
    })

    it('accepts UPCOMING_FIXTURE', () => {
      const result = NotificationTypeSchema.safeParse('UPCOMING_FIXTURE')
      expect(result.success).toBe(true)
    })

    it('rejects invalid type string', () => {
      const result = NotificationTypeSchema.safeParse('INVALID')
      expect(result.success).toBe(false)
    })

    it('rejects lowercase type string', () => {
      const result = NotificationTypeSchema.safeParse('game_start')
      expect(result.success).toBe(false)
    })
  })

  describe('NotificationSchema', () => {
    it('accepts a valid notification with all fields', () => {
      const result = NotificationSchema.safeParse(validNotification)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('test-notification-001')
        expect(result.data.type).toBe('GAME_START')
        expect(result.data.read).toBe(false)
        expect(result.data.matchId).toBe(12345)
      }
    })

    it('accepts a notification without optional matchId', () => {
      const { matchId: _matchId, ...noMatchId } = validNotification
      const result = NotificationSchema.safeParse(noMatchId)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.matchId).toBeUndefined()
      }
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validNotification
      const result = NotificationSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing type', () => {
      const { type: _type, ...noType } = validNotification
      const result = NotificationSchema.safeParse(noType)
      expect(result.success).toBe(false)
    })

    it('rejects missing timestamp', () => {
      const { timestamp: _timestamp, ...noTimestamp } = validNotification
      const result = NotificationSchema.safeParse(noTimestamp)
      expect(result.success).toBe(false)
    })

    it('rejects missing message', () => {
      const { message: _message, ...noMessage } = validNotification
      const result = NotificationSchema.safeParse(noMessage)
      expect(result.success).toBe(false)
    })

    it('rejects missing link', () => {
      const { link: _link, ...noLink } = validNotification
      const result = NotificationSchema.safeParse(noLink)
      expect(result.success).toBe(false)
    })

    it('rejects missing read', () => {
      const { read: _read, ...noRead } = validNotification
      const result = NotificationSchema.safeParse(noRead)
      expect(result.success).toBe(false)
    })

    it('rejects missing expiresAt', () => {
      const { expiresAt: _expiresAt, ...noExpiresAt } = validNotification
      const result = NotificationSchema.safeParse(noExpiresAt)
      expect(result.success).toBe(false)
    })

    it('rejects invalid type enum value', () => {
      const result = NotificationSchema.safeParse({
        ...validNotification,
        type: 'INVALID_TYPE',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-ISO datetime for timestamp', () => {
      const result = NotificationSchema.safeParse({
        ...validNotification,
        timestamp: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-ISO datetime for expiresAt', () => {
      const result = NotificationSchema.safeParse({
        ...validNotification,
        expiresAt: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-boolean for read field', () => {
      const result = NotificationSchema.safeParse({
        ...validNotification,
        read: 'false',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer matchId', () => {
      const result = NotificationSchema.safeParse({
        ...validNotification,
        matchId: 12.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('NotificationStorageSchema', () => {
    it('accepts valid storage format', () => {
      const result = NotificationStorageSchema.safeParse({
        version: 1,
        notifications: [validNotification],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.version).toBe(1)
        expect(result.data.notifications).toHaveLength(1)
      }
    })

    it('accepts storage with empty notifications array', () => {
      const result = NotificationStorageSchema.safeParse({
        version: 1,
        notifications: [],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.notifications).toHaveLength(0)
      }
    })

    it('rejects missing version field', () => {
      const result = NotificationStorageSchema.safeParse({
        notifications: [validNotification],
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing notifications field', () => {
      const result = NotificationStorageSchema.safeParse({
        version: 1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer version', () => {
      const result = NotificationStorageSchema.safeParse({
        version: 1.5,
        notifications: [],
      })
      expect(result.success).toBe(false)
    })
  })
})
