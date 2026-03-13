import { render, screen, waitFor } from '@testing-library/react'
import { TeamRoster } from '@/components/teams/TeamRoster'
import { GlobalSearchIndexProvider } from '@/context/GlobalSearchIndexContext'

// Mock navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/test-path',
}))

// Mock hooks
jest.mock('@/hooks/use-favorites', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: jest.fn(),
    updateFavorite: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-teams', () => ({
  useTeamDetail: jest.fn(),
}))

jest.mock('@/hooks/use-team-player-count', () => ({
  useTeamPlayerCount: jest.fn(),
}))

function renderWithProviders(component: React.ReactElement) {
  return render(
    <GlobalSearchIndexProvider>
      {component}
    </GlobalSearchIndexProvider>
  )
}

describe('TeamRoster Integration', () => {
  it('shows full roster for team with GUID', async () => {
    const { useTeamDetail } = require('@/hooks/use-teams')
    const { useTeamPlayerCount } = require('@/hooks/use-team-player-count')

    useTeamDetail.mockReturnValue({
      data: {
        name: 'Test Team',
        players: [
          { playerId: 1, firstName: 'John', lastName: 'Doe' },
          { playerId: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      },
      isLoading: false,
      error: null,
    })

    useTeamPlayerCount.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    renderWithProviders(
      <TeamRoster
        teamKey="abc-123-guid"
        teamName="Test Team"
        competitionId={1}
        divisionId={1}
        orgKey="org-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('shows player count for team without GUID', async () => {
    const { useTeamDetail } = require('@/hooks/use-teams')
    const { useTeamPlayerCount } = require('@/hooks/use-team-player-count')

    useTeamDetail.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    useTeamPlayerCount.mockReturnValue({
      data: { id: 1, name: 'Test Team', playersCount: '8' },
      isLoading: false,
      error: null,
    })

    renderWithProviders(
      <TeamRoster
        teamKey="team-1"
        teamName="Test Team"
        competitionId={1}
        divisionId={1}
        orgKey="org-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText(/players on Test Team/)).toBeInTheDocument()
    })
  })

  it('shows error message when player count fetch fails', async () => {
    const { useTeamPlayerCount } = require('@/hooks/use-team-player-count')
    const { useTeamDetail } = require('@/hooks/use-teams')

    useTeamDetail.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    useTeamPlayerCount.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch teams',
    })

    renderWithProviders(
      <TeamRoster
        teamKey="team-1"
        teamName="Test Team"
        competitionId={1}
        divisionId={1}
        orgKey="org-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch teams')).toBeInTheDocument()
    })
  })
})
