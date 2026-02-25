import { describe, it, expect } from '@jest/globals'
import {
  normalizeMatchStatus,
  isLiveStatus,
  isEndedStatus,
} from '@/lib/match-status'
import type { NormalizedMatchStatus } from '@/lib/match-status'

describe('match-status', () => {
  describe('normalizeMatchStatus', () => {
    it('normalizes SCHEDULED to SCHEDULED', () => {
      expect(normalizeMatchStatus('SCHEDULED')).toBe('SCHEDULED')
    })

    it('normalizes LIVE to LIVE', () => {
      expect(normalizeMatchStatus('LIVE')).toBe('LIVE')
    })

    it('normalizes InProgress to LIVE', () => {
      expect(normalizeMatchStatus('InProgress')).toBe('LIVE')
    })

    it('normalizes IN PROGRESS to LIVE', () => {
      expect(normalizeMatchStatus('IN PROGRESS')).toBe('LIVE')
    })

    it('normalizes ENDED to ENDED', () => {
      expect(normalizeMatchStatus('ENDED')).toBe('ENDED')
    })

    it('normalizes Final to ENDED', () => {
      expect(normalizeMatchStatus('Final')).toBe('ENDED')
    })

    it('normalizes unknown value to UNKNOWN', () => {
      expect(normalizeMatchStatus('POSTPONED')).toBe('UNKNOWN')
    })

    it('handles lowercase input (case-insensitive)', () => {
      expect(normalizeMatchStatus('live')).toBe('LIVE')
      expect(normalizeMatchStatus('final')).toBe('ENDED')
      expect(normalizeMatchStatus('scheduled')).toBe('SCHEDULED')
      expect(normalizeMatchStatus('ended')).toBe('ENDED')
    })

    it('handles mixed case input', () => {
      expect(normalizeMatchStatus('Live')).toBe('LIVE')
      expect(normalizeMatchStatus('Scheduled')).toBe('SCHEDULED')
    })
  })

  describe('isLiveStatus', () => {
    it('returns true for LIVE', () => {
      expect(isLiveStatus('LIVE')).toBe(true)
    })

    it('returns false for non-LIVE statuses', () => {
      const others: NormalizedMatchStatus[] = ['SCHEDULED', 'ENDED', 'UNKNOWN']
      others.forEach((status) => {
        expect(isLiveStatus(status)).toBe(false)
      })
    })
  })

  describe('isEndedStatus', () => {
    it('returns true for ENDED', () => {
      expect(isEndedStatus('ENDED')).toBe(true)
    })

    it('returns false for non-ENDED statuses', () => {
      const others: NormalizedMatchStatus[] = ['SCHEDULED', 'LIVE', 'UNKNOWN']
      others.forEach((status) => {
        expect(isEndedStatus(status)).toBe(false)
      })
    })
  })
})
