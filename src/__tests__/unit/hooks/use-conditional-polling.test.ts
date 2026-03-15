import { renderHook } from '@testing-library/react'
import { useConditionalPolling } from '@/hooks/use-conditional-polling'

describe('useConditionalPolling', () => {
  it('returns 5000 when status is LIVE', () => {
    const { result } = renderHook(() => useConditionalPolling('LIVE'))
    expect(result.current).toBe(5000)
  })

  it('returns 5000 when status is INPROGRESS (normalized to LIVE)', () => {
    const { result } = renderHook(() => useConditionalPolling('INPROGRESS'))
    expect(result.current).toBe(5000)
  })

  it('returns 5000 when status is IN PROGRESS (normalized to LIVE)', () => {
    const { result } = renderHook(() => useConditionalPolling('IN PROGRESS'))
    expect(result.current).toBe(5000)
  })

  it('returns null when status is ENDED', () => {
    const { result } = renderHook(() => useConditionalPolling('ENDED'))
    expect(result.current).toBeNull()
  })

  it('returns null when status is FINAL (normalized to ENDED)', () => {
    const { result } = renderHook(() => useConditionalPolling('FINAL'))
    expect(result.current).toBeNull()
  })

  it('returns null when status is SCHEDULED', () => {
    const { result } = renderHook(() => useConditionalPolling('SCHEDULED'))
    expect(result.current).toBeNull()
  })

  it('returns null when status is null', () => {
    const { result } = renderHook(() => useConditionalPolling(null))
    expect(result.current).toBeNull()
  })

  it('returns null when status is undefined', () => {
    const { result } = renderHook(() => useConditionalPolling(undefined))
    expect(result.current).toBeNull()
  })

  it('returns null when status is empty string', () => {
    const { result } = renderHook(() => useConditionalPolling(''))
    expect(result.current).toBeNull()
  })

  it('returns null when status is unknown value', () => {
    const { result } = renderHook(() => useConditionalPolling('UNKNOWN_STATUS'))
    expect(result.current).toBeNull()
  })

  it('uses custom polling interval when provided', () => {
    const { result } = renderHook(() => useConditionalPolling('LIVE', 10000))
    expect(result.current).toBe(10000)
  })

  it('returns null for custom interval when not live', () => {
    const { result } = renderHook(() => useConditionalPolling('ENDED', 10000))
    expect(result.current).toBeNull()
  })

  it('handles status changes (SCHEDULED -> LIVE)', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useConditionalPolling(status),
      { initialProps: { status: 'SCHEDULED' } }
    )

    expect(result.current).toBeNull()

    rerender({ status: 'LIVE' })
    expect(result.current).toBe(5000)
  })

  it('handles status changes (LIVE -> ENDED)', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useConditionalPolling(status),
      { initialProps: { status: 'LIVE' } }
    )

    expect(result.current).toBe(5000)

    rerender({ status: 'ENDED' })
    expect(result.current).toBeNull()
  })

  it('memoizes result when dependencies do not change', () => {
    const { result, rerender } = renderHook(
      ({ status, interval }) => useConditionalPolling(status, interval),
      { initialProps: { status: 'LIVE', interval: 5000 } }
    )

    const firstResult = result.current

    rerender({ status: 'LIVE', interval: 5000 })
    // Same values should return same reference
    expect(result.current).toBe(firstResult)
  })

  it('case-insensitive status matching', () => {
    const { result: result1 } = renderHook(() => useConditionalPolling('live'))
    const { result: result2 } = renderHook(() => useConditionalPolling('LIVE'))
    const { result: result3 } = renderHook(() => useConditionalPolling('Live'))

    expect(result1.current).toBe(5000)
    expect(result2.current).toBe(5000)
    expect(result3.current).toBe(5000)
  })
})
