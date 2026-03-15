import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { LiveGameBanner } from '@/components/game/LiveGameBanner'
import type { GameSummary } from '@/types/game'

const mockGameLiveData: GameSummary = {
  playing: [],
  substitutions: [],
  teamOfficials: [],
  teamData: {
    team1: { id: 1, name: 'Team A', teamUniqueKey: 'team-1', logoUrl: null },
    team2: { id: 2, name: 'Team B', teamUniqueKey: 'team-2', logoUrl: null },
  },
  matchData: {
    team1Score: 15,
    team2Score: 12,
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

const mockGameEndedData: GameSummary = {
  ...mockGameLiveData,
  matchData: {
    ...mockGameLiveData.matchData,
    matchStatus: 'ENDED',
  },
}

const mockUseGameSummary = jest.fn()

jest.mock('@/hooks/use-game', () => ({
  useGameSummary: (...args: unknown[]) => mockUseGameSummary(...args),
}))

jest.mock('@/hooks/use-conditional-polling', () => ({
  useConditionalPolling: () => null,
}))

describe('LiveGameBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows banner when game is LIVE', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameLiveData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    await waitFor(() => {
      expect(screen.getByText(/Live Game in Progress/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Watching Live/)).toBeInTheDocument()
  })

  it('hides banner when game has ended', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameEndedData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    // Wait a bit for async rendering
    await waitFor(() => {
      expect(screen.queryByText(/Live Game in Progress/)).not.toBeInTheDocument()
    })
  })

  it('hides banner when game is scheduled', async () => {
    mockUseGameSummary.mockReturnValue({
      data: {
        ...mockGameLiveData,
        matchData: { ...mockGameLiveData.matchData, matchStatus: 'SCHEDULED' },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    await waitFor(() => {
      expect(screen.queryByText(/Live Game in Progress/)).not.toBeInTheDocument()
    })
  })

  it('hides banner when data is null', () => {
    mockUseGameSummary.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    const { container } = render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    expect(container.firstChild).toBeNull()
  })

  it('displays pulsing red dot indicator', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameLiveData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    const { container } = render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    await waitFor(() => {
      const pulsingDot = container.querySelector('.w-3.h-3.bg-stat-red.rounded-full.animate-pulse')
      expect(pulsingDot).toBeInTheDocument()
    })
  })

  it('has proper styling for live status', async () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameLiveData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    const { container } = render(<LiveGameBanner matchId={1} competitionUniqueKey="comp-key" />)

    await waitFor(() => {
      const banner = container.querySelector('.bg-stat-red\\/10')
      expect(banner).toHaveClass('border', 'border-stat-red/30')
    })
  })

  it('calls useGameSummary with correct props', () => {
    mockUseGameSummary.mockReturnValue({
      data: mockGameLiveData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<LiveGameBanner matchId={123} competitionUniqueKey="test-comp" />)

    expect(mockUseGameSummary).toHaveBeenCalledWith(123, 'test-comp', expect.any(Object))
  })
})
