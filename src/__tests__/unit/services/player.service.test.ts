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

import { fetchPlayer } from '@/services/player.service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchPlayer', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with playerId param', async () => {
    mockGet.mockResolvedValue({})

    await fetchPlayer(123)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/users/public/userProfile',
      { playerId: 123 }
    )
  })

  it('returns player profile from the API', async () => {
    const mockPlayer = {
      userId: 123,
      firstName: 'LeBron',
      lastName: 'James',
      photoUrl: 'https://example.com/photo.jpg',
    }
    mockGet.mockResolvedValue(mockPlayer)

    const result = await fetchPlayer(123)

    expect(result).toEqual(mockPlayer)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Player not found'))

    await expect(fetchPlayer(999)).rejects.toThrow('Player not found')
  })

  it('handles playerId of 0', async () => {
    mockGet.mockResolvedValue({})

    await fetchPlayer(0)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/users/public/userProfile',
      { playerId: 0 }
    )
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchPlayer(123)).rejects.toThrow('Failed to fetch player')
  })
})
