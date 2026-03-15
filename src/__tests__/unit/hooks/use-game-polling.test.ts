import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGameSummary, useScoringByPlayer } from '@/hooks/use-game'
import type { GameSummary } from '@/types/game'

// Mock the game service
const mockFetchGameSummary = jest.fn()
const mockFetchScoringByPlayer = jest.fn()

jest.mock('@/services/game.service', () => ({
  fetchGameSummary: (...args: unknown[]) => mockFetchGameSummary(...args),
}))

jest.mock('@/services/stats.service', () => ({
  fetchScoringByPlayer: (...args: unknown[]) => mockFetchScoringByPlayer(...args),
}))

const mockGameSummaryData: GameSummary = {
  playing: [],
  substitutions: [],
  teamOfficials: [],
  teamData: {
    team1: { id: 1, name: 'Team A', teamUniqueKey: 'team-1', logoUrl: null },
    team2: { id: 2, name: 'Team B', teamUniqueKey: 'team-2', logoUrl: null },
  },
  matchData: {
    team1Score: 10,
    team2Score: 8,
    hasPenalty: false,
    team1PenaltyScore: null,
    team2PenaltyScore: null,
    startTime: '2024-01-15T10:00:00Z',
    competitionName: 'League',
    venueName: 'Stadium',
    venueCourtName: null,
    matchStatus: 'LIVE',
    substitutionEnabled: true,
  },
  attendanceAvailable: false,
}

describe('useGameSummary with polling', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockFetchGameSummary.mockReset().mockResolvedValue(mockGameSummaryData)
    mockFetchScoringByPlayer.mockReset().mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('does not poll when pollingInterval is null', async () => {
    const { result } = renderHook(() =>
      useGameSummary(1, 'comp-key', { pollingInterval: null })
    )

    // Initial fetch
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const callCountAfterInitial = mockFetchGameSummary.mock.calls.length

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Should not have made additional calls
    expect(mockFetchGameSummary.mock.calls.length).toBe(callCountAfterInitial)
  })

  it('polls every 5000ms when pollingInterval is 5000', async () => {
    const { result } = renderHook(() =>
      useGameSummary(1, 'comp-key', { pollingInterval: 5000 })
    )

    // Initial fetch
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const callCountAfterInitial = mockFetchGameSummary.mock.calls.length

    // Advance timers by first poll interval
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Wait for the polling fetch to complete
    await waitFor(() => {
      expect(mockFetchGameSummary.mock.calls.length).toBeGreaterThan(callCountAfterInitial)
    })

    const callCountAfterFirstPoll = mockFetchGameSummary.mock.calls.length

    // Advance timers by another poll interval
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Wait for the second polling fetch
    await waitFor(() => {
      expect(mockFetchGameSummary.mock.calls.length).toBeGreaterThan(callCountAfterFirstPoll)
    })

    expect(mockFetchGameSummary.mock.calls.length).toBeGreaterThanOrEqual(3) // initial + 2 polls
  })

  it('changes polling interval when pollingInterval prop changes', async () => {
    const { result, rerender } = renderHook(
      ({ interval }) => useGameSummary(1, 'comp-key', { pollingInterval: interval }),
      { initialProps: { interval: null } }
    )

    // Initial fetch with no polling
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const callCountBefore = mockFetchGameSummary.mock.calls.length

    // Rerender with polling enabled
    rerender({ interval: 5000 })

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Should have triggered a poll
    await waitFor(() => {
      expect(mockFetchGameSummary.mock.calls.length).toBeGreaterThan(callCountBefore)
    })
  })

  it('stops polling when pollingInterval changes from 5000 to null', async () => {
    const { result, rerender } = renderHook(
      ({ interval }) => useGameSummary(1, 'comp-key', { pollingInterval: interval }),
      { initialProps: { interval: 5000 } }
    )

    // Initial fetch with polling
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    // Let first poll happen
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      // At least one poll should have happened
      expect(mockFetchGameSummary).toHaveBeenCalledTimes(2) // initial + 1 poll
    })

    // Disable polling
    rerender({ interval: null })

    const callCountBeforeStop = mockFetchGameSummary.mock.calls.length

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Should not make new calls
    expect(mockFetchGameSummary.mock.calls.length).toBe(callCountBeforeStop)
  })

  it('passes pollingInterval correctly to useApiData', async () => {
    renderHook(() =>
      useGameSummary(1, 'comp-key', { pollingInterval: 3000 })
    )

    // Just verify the hook doesn't throw and initial fetch works
    await waitFor(() => {
      expect(mockFetchGameSummary).toHaveBeenCalled()
    })
  })
})

describe('useScoringByPlayer with polling', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockFetchGameSummary.mockReset().mockResolvedValue(mockGameSummaryData)
    mockFetchScoringByPlayer.mockReset().mockResolvedValue([
      {
        playerId: 1,
        shirt: '10',
        teamId: 1,
        totalPts: 15,
        FTMade: 2,
        FTMiss: 1,
        '2PMade': 3,
        '2PMiss': 2,
        '3PMade': 2,
        '3PMiss': 1,
        PF: 2,
        TF: 0,
      },
    ])
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('polls when pollingInterval is provided', async () => {
    const { result } = renderHook(() =>
      useScoringByPlayer(1, 1, { pollingInterval: 5000 })
    )

    // Initial fetch
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const initialCallCount = mockFetchScoringByPlayer.mock.calls.length

    // Trigger polling
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Wait for poll to complete
    await waitFor(() => {
      expect(mockFetchScoringByPlayer.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })

  it('does not poll when pollingInterval is null', async () => {
    const { result } = renderHook(() =>
      useScoringByPlayer(1, 1, { pollingInterval: null })
    )

    // Initial fetch
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const initialCallCount = mockFetchScoringByPlayer.mock.calls.length

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Should not have polled
    expect(mockFetchScoringByPlayer.mock.calls.length).toBe(initialCallCount)
  })

  it('backward compatible - works without options parameter', async () => {
    const { result } = renderHook(() =>
      useScoringByPlayer(1, 1)
    )

    // Should work without errors
    await waitFor(() => {
      expect(mockFetchScoringByPlayer).toHaveBeenCalled()
    })

    // And should not poll by default
    const initialCallCount = mockFetchScoringByPlayer.mock.calls.length

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(mockFetchScoringByPlayer.mock.calls.length).toBe(initialCallCount)
  })
})
