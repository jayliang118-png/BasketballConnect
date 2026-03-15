import { formatRelativeTime } from '@/lib/format-time'

describe('formatRelativeTime', () => {
  const baseTime = new Date('2024-01-15T10:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(baseTime)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns "just now" for very recent timestamps', () => {
    const recent = new Date(baseTime.getTime() - 100) // 100ms ago
    expect(formatRelativeTime(recent)).toBe('just now')
  })

  it('formats seconds ago correctly (singular)', () => {
    const oneSecondAgo = new Date(baseTime.getTime() - 1000)
    expect(formatRelativeTime(oneSecondAgo)).toBe('1 second ago')
  })

  it('formats seconds ago correctly (plural)', () => {
    const thirtySecondsAgo = new Date(baseTime.getTime() - 30000)
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('30 seconds ago')
  })

  it('formats minutes ago correctly (singular)', () => {
    const oneMinuteAgo = new Date(baseTime.getTime() - 60000)
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
  })

  it('formats minutes ago correctly (plural)', () => {
    const fiveMinutesAgo = new Date(baseTime.getTime() - 300000)
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
  })

  it('formats hours ago correctly (singular)', () => {
    const oneHourAgo = new Date(baseTime.getTime() - 3600000)
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
  })

  it('formats hours ago correctly (plural)', () => {
    const twoHoursAgo = new Date(baseTime.getTime() - 7200000)
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('formats days ago correctly (singular)', () => {
    const oneDayAgo = new Date(baseTime.getTime() - 86400000)
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
  })

  it('formats days ago correctly (plural)', () => {
    const threeDaysAgo = new Date(baseTime.getTime() - 3 * 86400000)
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('accepts ISO string format', () => {
    const result = formatRelativeTime('2024-01-15T09:59:00Z')
    expect(result).toContain('minute ago') // Should be about 1 minute ago
  })

  it('handles string and Date object equivalently', () => {
    const date = new Date(baseTime.getTime() - 60000)
    const isoString = date.toISOString()

    expect(formatRelativeTime(date)).toBe(formatRelativeTime(isoString))
  })

  it('handles future timestamps (negative time difference)', () => {
    const future = new Date(baseTime.getTime() + 1000)
    expect(formatRelativeTime(future)).toBe('now')
  })

  it('rounds down to prevent over-reporting', () => {
    // 59 seconds should still say "59 seconds ago", not "1 minute ago"
    const almost60SecondsAgo = new Date(baseTime.getTime() - 59000)
    expect(formatRelativeTime(almost60SecondsAgo)).toBe('59 seconds ago')
  })

  it('transitions correctly at boundaries', () => {
    // Right at 60 seconds (should be 1 minute)
    const exactly60SecondsAgo = new Date(baseTime.getTime() - 60000)
    expect(formatRelativeTime(exactly60SecondsAgo)).toBe('1 minute ago')

    // Right at 60 minutes (should be 1 hour)
    const exactly60MinutesAgo = new Date(baseTime.getTime() - 3600000)
    expect(formatRelativeTime(exactly60MinutesAgo)).toBe('1 hour ago')

    // Right at 24 hours (should be 1 day)
    const exactly24HoursAgo = new Date(baseTime.getTime() - 86400000)
    expect(formatRelativeTime(exactly24HoursAgo)).toBe('1 day ago')
  })
})
