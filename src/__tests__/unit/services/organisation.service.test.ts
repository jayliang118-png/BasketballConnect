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

import { fetchOrganisations } from '@/services/organisation.service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchOrganisations', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('calls the correct endpoint', async () => {
    mockGet.mockResolvedValue([])

    await fetchOrganisations()

    expect(mockGet).toHaveBeenCalledWith('/users/api/organisations/all')
  })

  it('returns the organisations from the API', async () => {
    const mockOrgs = [
      { organisationUniqueKey: 'org-1', name: 'Basketball NSW' },
      { organisationUniqueKey: 'org-2', name: 'Basketball VIC' },
    ]
    mockGet.mockResolvedValue(mockOrgs)

    const result = await fetchOrganisations()

    expect(result).toEqual(mockOrgs)
  })

  it('returns an empty array when API returns empty', async () => {
    mockGet.mockResolvedValue([])

    const result = await fetchOrganisations()

    expect(result).toEqual([])
  })

  it('propagates errors from the API client', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    await expect(fetchOrganisations()).rejects.toThrow('Network error')
  })

  it('wraps non-Error thrown values into a proper Error', async () => {
    mockGet.mockRejectedValue('raw string error')

    await expect(fetchOrganisations()).rejects.toThrow('Failed to fetch organisations')
  })
})
