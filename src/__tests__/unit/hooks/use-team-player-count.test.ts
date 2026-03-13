import { renderHook, waitFor } from '@testing-library/react'
import { useTeamPlayerCount } from '@/hooks/use-team-player-count'

// Mock the import
jest.mock('@/services/team.service', () => ({
  fetchTeams: jest.fn(),
}))

describe('useTeamPlayerCount', () => {
  it('returns player count for matching team', async () => {
    const { fetchTeams } = require('@/services/team.service')
    fetchTeams.mockResolvedValue([
      { id: 1, name: 'Team A', playersCount: '8' },
      { id: 2, name: 'Team B', playersCount: '9' },
    ])

    const { result } = renderHook(() =>
      useTeamPlayerCount(101, 5, 'org-id', 2)
    )

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, name: 'Team B', playersCount: '9' })
    })
  })

  it('returns null when team not found', async () => {
    const { fetchTeams } = require('@/services/team.service')
    fetchTeams.mockResolvedValue([
      { id: 1, name: 'Team A', playersCount: '8' },
    ])

    const { result } = renderHook(() =>
      useTeamPlayerCount(101, 5, 'org-id', 999)
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(null)
    })
  })

  it('handles loading state', () => {
    const { fetchTeams } = require('@/services/team.service')
    fetchTeams.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() =>
      useTeamPlayerCount(101, 5, 'org-id', 2)
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('handles errors', async () => {
    const { fetchTeams } = require('@/services/team.service')
    const testError = 'API Error'
    fetchTeams.mockRejectedValue(new Error(testError))

    const { result } = renderHook(() =>
      useTeamPlayerCount(101, 5, 'org-id', 2)
    )

    await waitFor(() => {
      expect(result.current.error).toBe('Something went wrong. Please try again later.')
    })
  })
})
