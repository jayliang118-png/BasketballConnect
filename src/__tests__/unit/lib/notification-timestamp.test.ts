import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { formatNotificationTimestamp } from '@/lib/notification-timestamp'

describe('formatNotificationTimestamp', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-02-25T14:30:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('formats today timestamp as time only', () => {
    const result = formatNotificationTimestamp('2026-02-25T14:45:00.000Z')

    // Should contain a time component but not a month
    expect(result).toMatch(/\d{1,2}:\d{2}/)
    expect(result).not.toMatch(/Feb/)
  })

  it('formats same-year, different-day as date + time', () => {
    const result = formatNotificationTimestamp('2026-02-20T10:30:00.000Z')

    // Should include month abbreviation and a time component
    expect(result).toMatch(/Feb/)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('formats different-year as full date + time', () => {
    const result = formatNotificationTimestamp('2025-06-15T09:00:00.000Z')

    // Should include the year and a month
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/Jun/)
  })

  it('returns empty string for invalid date', () => {
    const result = formatNotificationTimestamp('not-a-date')
    expect(result).toBe('')
  })

  it('returns empty string for empty string', () => {
    const result = formatNotificationTimestamp('')
    expect(result).toBe('')
  })
})
