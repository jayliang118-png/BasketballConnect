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

import { fetchCompetitions } from '@/services/competition.service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchCompetitions', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with organisationUniqueKey param', async () => {
    mockGet.mockResolvedValue([])

    await fetchCompetitions('org-key-123')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/competitions/list',
      { organisationUniqueKey: 'org-key-123' }
    )
  })

  it('returns competitions from the API', async () => {
    const mockComps = [
      { competitionUniqueKey: 'comp-1', name: 'Summer League 2024' },
      { competitionUniqueKey: 'comp-2', name: 'Winter League 2024' },
    ]
    mockGet.mockResolvedValue(mockComps)

    const result = await fetchCompetitions('org-key-123')

    expect(result).toEqual(mockComps)
  })

  it('returns empty array when no competitions exist', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchCompetitions('org-key-empty')

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Server error'))

    await expect(fetchCompetitions('org-key-123')).rejects.toThrow('Server error')
  })

  it('passes the organisation key exactly as provided', async () => {
    mockGet.mockResolvedValue([])

    await fetchCompetitions('key-with-special-chars-&-more')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/competitions/list',
      { organisationUniqueKey: 'key-with-special-chars-&-more' }
    )
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchCompetitions('org-key')).rejects.toThrow('Failed to fetch competitions')
  })
})
