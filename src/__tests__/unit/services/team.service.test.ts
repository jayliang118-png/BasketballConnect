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

import { fetchTeams, fetchTeamDetail } from '@/services/team.service'

// ---------------------------------------------------------------------------
// fetchTeams
// ---------------------------------------------------------------------------

describe('fetchTeams', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with all required params', async () => {
    mockGet.mockResolvedValue([])

    await fetchTeams(101, 5, 'org-id-1')

    expect(mockGet).toHaveBeenCalledWith(
      '/livescores/teams/list',
      {
        competitionId: 101,
        divisionId: 5,
        organisationId: 'org-id-1',
        includeBye: 0,
      }
    )
  })

  it('always includes includeBye=0', async () => {
    mockGet.mockResolvedValue([])

    await fetchTeams(1, 1, 'org-1')

    const callParams = mockGet.mock.calls[0][1]
    expect(callParams.includeBye).toBe(0)
  })

  it('returns teams from the API', async () => {
    const mockTeams = [
      { teamId: 1, teamName: 'Eagles' },
      { teamId: 2, teamName: 'Hawks' },
    ]
    mockGet.mockResolvedValue(mockTeams)

    const result = await fetchTeams(1, 1, 'org-1')

    expect(result).toEqual(mockTeams)
  })

  it('returns empty array when no teams exist', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchTeams(1, 1, 'org-1')

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Service unavailable'))

    await expect(fetchTeams(1, 1, 'org-1')).rejects.toThrow('Service unavailable')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchTeams(1, 1, 'org-1')).rejects.toThrow('Failed to fetch teams')
  })
})

// ---------------------------------------------------------------------------
// fetchTeamDetail
// ---------------------------------------------------------------------------

describe('fetchTeamDetail', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint with teamUniqueKey param', async () => {
    mockGet.mockResolvedValue({})

    await fetchTeamDetail('team-unique-key-abc')

    expect(mockGet).toHaveBeenCalledWith(
      '/competition/participantGrading/teamViewPublic/team',
      { teamUniqueKey: 'team-unique-key-abc' }
    )
  })

  it('returns team detail from the API', async () => {
    const mockDetail = {
      teamId: 1,
      teamName: 'Eagles',
      players: [{ playerId: 10, firstName: 'John' }],
    }
    mockGet.mockResolvedValue(mockDetail)

    const result = await fetchTeamDetail('team-key-1')

    expect(result).toEqual(mockDetail)
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Not found'))

    await expect(fetchTeamDetail('bad-key')).rejects.toThrow('Not found')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue(42)

    await expect(fetchTeamDetail('bad-key')).rejects.toThrow('Failed to fetch team detail')
  })
})
