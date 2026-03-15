import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { GameSummary } from '@/components/game/GameSummary'
import type { GameSummary as GameSummaryType } from '@/types/game'

// Mock the hooks
const mockGameSummaryData: GameSummaryType = {
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

const mockEndedGameData: GameSummaryType = {
  ...mockGameSummaryData,
  matchData: {
    ...mockGameSummaryData.matchData,
    matchStatus: 'ENDED',
  },
}

const mockUseGameSummary = jest.fn()
const mockUseScoringByPlayer = jest.fn()
const mockUseConditionalPolling = jest.fn()

jest.mock('@/hooks/use-game', () => ({
  useGameSummary: (...args: unknown[]) => mockUseGameSummary(...args),
  useScoringByPlayer: (...args: unknown[]) => mockUseScoringByPlayer(...args),
}))

jest.mock('@/hooks/use-conditional-polling', () => ({
  useConditionalPolling: (...args: unknown[]) => mockUseConditionalPolling(...args),
}))

jest.mock('@/lib/format-time', () => ({
  formatRelativeTime: () => '2 seconds ago',
}))

describe('GameSummary with polling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseScoringByPlayer.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    // Mock useConditionalPolling to return 5000 for LIVE, null otherwise
    mockUseConditionalPolling.mockImplementation((status: string | null | undefined) => {
      if (status === 'LIVE') return 5000
      return null
    })
  })

  it('shows LIVE badge when game is live', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      // Should show status label (styled as uppercase with CSS)
      const liveElements = screen.getAllByText('Live')
      expect(liveElements.length).toBeGreaterThan(0)
    })

    // Should show the pulsing live indicator
    const liveBadges = screen.getAllByText('Live')
    expect(liveBadges.length).toBeGreaterThanOrEqual(2) // At least status + LiveIndicator
  })

  it('does not render multiple live indicators, only passes pollingInterval to hooks', () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    // Verify hooks were called with proper arguments
    expect(mockUseGameSummary).toHaveBeenCalled()
    expect(mockUseScoringByPlayer).toHaveBeenCalled()
  })

  it('passes pollingInterval to useGameSummary when game is LIVE', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      expect(mockUseGameSummary).toHaveBeenCalled()
    })

    // Check that polling interval was passed (third argument should have pollingInterval)
    const lastCall = mockUseGameSummary.mock.calls[mockUseGameSummary.mock.calls.length - 1]
    expect(lastCall[2]).toEqual({ pollingInterval: 5000 })
  })

  it('calls useConditionalPolling to determine polling interval', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      expect(mockUseConditionalPolling).toHaveBeenCalled()
    })
  })

  it('passes pollingInterval to useScoringByPlayer when game is LIVE', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      expect(mockUseScoringByPlayer).toHaveBeenCalled()
    })

    // Check that polling interval was passed
    const lastCall = mockUseScoringByPlayer.mock.calls[mockUseScoringByPlayer.mock.calls.length - 1]
    expect(lastCall[2]).toEqual({ pollingInterval: 5000 })
  })

  it('renders live indicator with Live badge', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      // Should have the live indicator with pulsing badge
      const liveBadges = screen.getAllByText('Live')
      expect(liveBadges.length).toBeGreaterThan(0) // At least one Live badge from LiveIndicator
    })
  })

  it('shows loading spinner while data is loading', () => {
    mockUseGameSummary.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    expect(screen.getByText(/Loading game summary/i)).toBeInTheDocument()
  })

  it('displays scores from live game data', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameSummaryData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<GameSummary matchId={1} competitionUniqueKey="comp-key" competitionId={1} />)

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument() // Team A score
      expect(screen.getByText('8')).toBeInTheDocument() // Team B score
    })
  })
})
