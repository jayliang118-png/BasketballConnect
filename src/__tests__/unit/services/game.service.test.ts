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
  fetchGameSummary,
  fetchActionLog,
  fetchGameEvents,
} from '@/services/game.service'

// ---------------------------------------------------------------------------
// fetchGameSummary
// ---------------------------------------------------------------------------

describe('fetchGameSummary', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with matchId and competitionUniqueKey', async () => {
    mockGet.mockResolvedValue({})

    await fetchGameSummary(42, 'comp-unique-key')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/matches/public/gameSummary',
      { matchId: 42, competitionUniqueKey: 'comp-unique-key' }
    )
  })

  it('returns game summary from the API', async () => {
    const mockSummary = {
      matchId: 42,
      homeTeam: 'Eagles',
      awayTeam: 'Hawks',
      homeScore: 85,
      awayScore: 72,
    }
    mockGet.mockResolvedValue(mockSummary)

    const result = await fetchGameSummary(42, 'comp-key')

    expect(result).toEqual(mockSummary)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Match not found'))

    await expect(fetchGameSummary(999, 'bad-key')).rejects.toThrow('Match not found')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchGameSummary(1, 'key')).rejects.toThrow('Failed to fetch game summary')
  })
})

// ---------------------------------------------------------------------------
// fetchActionLog
// ---------------------------------------------------------------------------

describe('fetchActionLog', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with matchId and competitionId', async () => {
    mockGet.mockResolvedValue({})

    await fetchActionLog(42, 'comp-id-123')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/web/matches/public/actionLog',
      { matchId: 42, competitionId: 'comp-id-123' }
    )
  })

  it('returns action log from the API', async () => {
    const mockLog = {
      actions: [
        { actionId: 1, type: 'score', playerId: 10 },
        { actionId: 2, type: 'foul', playerId: 15 },
      ],
    }
    mockGet.mockResolvedValue(mockLog)

    const result = await fetchActionLog(42, 'comp-id-123')

    expect(result).toEqual(mockLog)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Forbidden'))

    await expect(fetchActionLog(42, 'comp-id')).rejects.toThrow('Forbidden')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue(null)

    await expect(fetchActionLog(1, 'id')).rejects.toThrow('Failed to fetch action log')
  })
})

// ---------------------------------------------------------------------------
// fetchGameEvents
// ---------------------------------------------------------------------------

describe('fetchGameEvents', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with matchId', async () => {
    mockGet.mockResolvedValue({})

    await fetchGameEvents(42)

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/matches/public/events',
      { matchId: 42 }
    )
  })

  it('returns game events from the API', async () => {
    const mockEvents = {
      events: [
        { eventId: 1, type: 'period_start', period: 1 },
        { eventId: 2, type: 'score', points: 2 },
      ],
    }
    mockGet.mockResolvedValue(mockEvents)

    const result = await fetchGameEvents(42)

    expect(result).toEqual(mockEvents)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Internal error'))

    await expect(fetchGameEvents(999)).rejects.toThrow('Internal error')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue(undefined)

    await expect(fetchGameEvents(1)).rejects.toThrow('Failed to fetch game events')
  })
})
