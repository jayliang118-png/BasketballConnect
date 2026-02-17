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

import {
  fetchScoringStatsByGrade,
  fetchUserScoringSummary,
} from '@/services/stats.service'

// ---------------------------------------------------------------------------
// fetchScoringStatsByGrade
// ---------------------------------------------------------------------------

describe('fetchScoringStatsByGrade', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with required params and sportRefId=2', async () => {
    mockGet.mockResolvedValue([])

    await fetchScoringStatsByGrade('points', 10)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/stats/public/scoringStatsByGrade',
      expect.objectContaining({
        statType: 'points',
        divisionId: 10,
        sportRefId: 2,
      })
    )
  })

  it('always includes sportRefId=2', async () => {
    mockGet.mockResolvedValue([])

    await fetchScoringStatsByGrade('rebounds', 5)

    const callParams = mockGet.mock.calls[0][1]
    expect(callParams.sportRefId).toBe(2)
  })

  it('includes optional offset and limit when provided', async () => {
    mockGet.mockResolvedValue([])

    await fetchScoringStatsByGrade('assists', 10, 20, 50)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/stats/public/scoringStatsByGrade',
      {
        statType: 'assists',
        divisionId: 10,
        offset: 20,
        limit: 50,
        sportRefId: 2,
      }
    )
  })

  it('omits offset and limit when not provided', async () => {
    mockGet.mockResolvedValue([])

    await fetchScoringStatsByGrade('points', 10)

    const callParams = mockGet.mock.calls[0][1]
    expect(callParams.offset).toBeUndefined()
    expect(callParams.limit).toBeUndefined()
  })

  it('returns stats from the API', async () => {
    const mockStats = [
      { playerId: 1, name: 'Player A', value: 25.5 },
      { playerId: 2, name: 'Player B', value: 22.1 },
    ]
    mockGet.mockResolvedValue(mockStats)

    const result = await fetchScoringStatsByGrade('points', 10)

    expect(result).toEqual(mockStats)
  })

  it('returns empty array when no stats exist', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchScoringStatsByGrade('steals', 99)

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Stats unavailable'))

    await expect(fetchScoringStatsByGrade('points', 10)).rejects.toThrow('Stats unavailable')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchScoringStatsByGrade('points', 10)).rejects.toThrow(
      'Failed to fetch scoring stats by grade'
    )
  })
})

// ---------------------------------------------------------------------------
// fetchUserScoringSummary
// ---------------------------------------------------------------------------

describe('fetchUserScoringSummary', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with all required params and sportRefId=2', async () => {
    mockGet.mockResolvedValue({})

    await fetchUserScoringSummary(42, 'TOTAL', 100)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/stats/v2/summaryScoringByUser',
      {
        userId: 42,
        aggregate: 'TOTAL',
        sportRefId: 2,
        competitionId: 100,
      }
    )
  })

  it('always includes sportRefId=2', async () => {
    mockGet.mockResolvedValue({})

    await fetchUserScoringSummary(1, 'AVG', 50)

    const callParams = mockGet.mock.calls[0][1]
    expect(callParams.sportRefId).toBe(2)
  })

  it('returns user scoring summary from the API', async () => {
    const mockSummary = {
      userId: 42,
      points: 250,
      rebounds: 80,
      assists: 65,
    }
    mockGet.mockResolvedValue(mockSummary)

    const result = await fetchUserScoringSummary(42, 'TOTAL', 100)

    expect(result).toEqual(mockSummary)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('User not found'))

    await expect(fetchUserScoringSummary(999, 'TOTAL', 100)).rejects.toThrow('User not found')
  })

  it('passes aggregate value exactly as provided', async () => {
    mockGet.mockResolvedValue({})

    await fetchUserScoringSummary(1, 'PER_GAME', 50)

    const callParams = mockGet.mock.calls[0][1]
    expect(callParams.aggregate).toBe('PER_GAME')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue(null)

    await expect(fetchUserScoringSummary(1, 'TOTAL', 100)).rejects.toThrow(
      'Failed to fetch user scoring summary'
    )
  })
})
