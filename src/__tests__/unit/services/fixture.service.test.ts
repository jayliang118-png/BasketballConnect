// ---------------------------------------------------------------------------
// Mock the api-client module -- must be defined BEFORE imports
// ---------------------------------------------------------------------------

const mockGet = jest.fn()

jest.mock('@/lib/api-client', () => ({
  createApiClient: jest.fn(() => ({ get: mockGet })),
}))

jest.mock('@/lib/config', () => ({
  config: {
    apiBaseUrl: 'https://api-basketball.squadi.com',
    apiToken: 'test-token',
  },
}))

import { fetchFixtures } from '@/services/fixture.service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchFixtures', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with competitionId and divisionId', async () => {
    mockGet.mockResolvedValue([])

    await fetchFixtures(100, 5)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/round/matches',
      { competitionId: 100, divisionId: 5 }
    )
  })

  it('returns fixtures from the API', async () => {
    const mockFixtures = [
      { matchId: 1, round: 1, team1: 'Eagles', team2: 'Hawks' },
      { matchId: 2, round: 1, team1: 'Bulls', team2: 'Heat' },
    ]
    mockGet.mockResolvedValue(mockFixtures)

    const result = await fetchFixtures(100, 5)

    expect(result).toEqual(mockFixtures)
  })

  it('returns empty array when no fixtures exist', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchFixtures(100, 5)

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Gateway timeout'))

    await expect(fetchFixtures(100, 5)).rejects.toThrow('Gateway timeout')
  })

  it('passes numeric params correctly', async () => {
    mockGet.mockResolvedValue([])

    await fetchFixtures(0, 0)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/round/matches',
      { competitionId: 0, divisionId: 0 }
    )
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchFixtures(100, 5)).rejects.toThrow('Failed to fetch fixtures')
  })
})
