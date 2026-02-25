import { describe, it, expect, beforeEach } from '@jest/globals'

// Mock the competition service before importing the module under test
const mockFetchCompetitions = jest.fn()

jest.mock('@/services/competition.service', () => ({
  fetchCompetitions: (...args: unknown[]) => mockFetchCompetitions(...args),
}))

import { createCompetitionResolver } from '@/lib/competition-resolver'

const COMPETITIONS = [
  { id: 100, uniqueKey: 'abc-123', name: 'Summer League' },
  { id: 200, uniqueKey: 'def-456', name: 'Winter League' },
]

describe('competition-resolver', () => {
  beforeEach(() => {
    mockFetchCompetitions.mockReset()
  })

  it('resolves compKey to numeric competition id', async () => {
    mockFetchCompetitions.mockResolvedValue(COMPETITIONS)

    const resolver = createCompetitionResolver()
    const id = await resolver.resolve('bca', 'abc-123')

    expect(id).toBe(100)
    expect(mockFetchCompetitions).toHaveBeenCalledWith('bca')
  })

  it('returns null when compKey is not found', async () => {
    mockFetchCompetitions.mockResolvedValue(COMPETITIONS)

    const resolver = createCompetitionResolver()
    const id = await resolver.resolve('bca', 'nonexistent-key')

    expect(id).toBeNull()
  })

  it('caches results - second call does not re-fetch', async () => {
    mockFetchCompetitions.mockResolvedValue(COMPETITIONS)

    const resolver = createCompetitionResolver()

    await resolver.resolve('bca', 'abc-123')
    await resolver.resolve('bca', 'def-456')

    expect(mockFetchCompetitions).toHaveBeenCalledTimes(1)
  })

  it('returns null on API error without throwing', async () => {
    mockFetchCompetitions.mockRejectedValue(new Error('Network error'))

    const resolver = createCompetitionResolver()
    const id = await resolver.resolve('bca', 'abc-123')

    expect(id).toBeNull()
  })

  it('evicts cache on error so next call retries', async () => {
    mockFetchCompetitions
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(COMPETITIONS)

    const resolver = createCompetitionResolver()

    const first = await resolver.resolve('bca', 'abc-123')
    expect(first).toBeNull()

    const second = await resolver.resolve('bca', 'abc-123')
    expect(second).toBe(100)
    expect(mockFetchCompetitions).toHaveBeenCalledTimes(2)
  })

  it('clearCache forces re-fetch on next call', async () => {
    mockFetchCompetitions.mockResolvedValue(COMPETITIONS)

    const resolver = createCompetitionResolver()

    await resolver.resolve('bca', 'abc-123')
    resolver.clearCache()
    await resolver.resolve('bca', 'abc-123')

    expect(mockFetchCompetitions).toHaveBeenCalledTimes(2)
  })

  it('returns null when API returns non-array data', async () => {
    mockFetchCompetitions.mockResolvedValue('not-an-array')

    const resolver = createCompetitionResolver()
    const id = await resolver.resolve('bca', 'abc-123')

    expect(id).toBeNull()
  })
})
