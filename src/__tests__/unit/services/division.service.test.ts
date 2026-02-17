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

import { fetchDivisions } from '@/services/division.service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchDivisions', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with competitionKey param', async () => {
    mockGet.mockResolvedValue([])

    await fetchDivisions('comp-key-456')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/division',
      { competitionKey: 'comp-key-456' }
    )
  })

  it('returns divisions from the API', async () => {
    const mockDivisions = [
      { divisionId: 1, name: 'Division A' },
      { divisionId: 2, name: 'Division B' },
    ]
    mockGet.mockResolvedValue(mockDivisions)

    const result = await fetchDivisions('comp-key-456')

    expect(result).toEqual(mockDivisions)
  })

  it('returns empty array when no divisions exist', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchDivisions('comp-key-empty')

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Timeout'))

    await expect(fetchDivisions('comp-key-456')).rejects.toThrow('Timeout')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchDivisions('comp-key')).rejects.toThrow('Failed to fetch divisions')
  })
})
