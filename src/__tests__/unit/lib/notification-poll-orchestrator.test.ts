import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import type { DivisionGroup } from '@/lib/favorite-url-parser'

const mockFetchFixtures = jest.fn()

jest.mock('@/services/fixture.service', () => ({
  fetchFixtures: (...args: unknown[]) => mockFetchFixtures(...args),
}))

import { createPollOrchestrator } from '@/lib/notification-poll-orchestrator'
import type { PollContext } from '@/lib/notification-poll-orchestrator'

const MOCK_DIVISION: DivisionGroup = {
  orgKey: 'bca',
  compKey: 'summer-2026',
  divisionId: 10,
  teamKeys: ['team-eagles-key'],
}

function makeRound(matches: readonly unknown[]) {
  return { id: 1, name: 'Round 1', sequence: 1, matches }
}

function makeMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: 1001,
    startTime: '2026-02-25T18:00:00.000Z',
    matchStatus: 'Scheduled',
    team1: {
      id: 1,
      name: 'Eagles',
      teamUniqueKey: 'team-eagles-key',
      alias: null,
      logoUrl: null,
    },
    team2: {
      id: 2,
      name: 'Hawks',
      teamUniqueKey: 'team-hawks-key',
      alias: null,
      logoUrl: null,
    },
    team1Score: 0,
    team2Score: 0,
    venueCourt: null,
    ...overrides,
  }
}

function makeMockResolver(resolvedId: number | null = 100) {
  return {
    resolve: jest.fn().mockResolvedValue(resolvedId),
    clearCache: jest.fn(),
  }
}

function makePollContext(overrides: Partial<PollContext> = {}): PollContext {
  return {
    favoriteTeamKeys: new Set(['team-eagles-key']),
    addNotification: jest.fn(),
    ...overrides,
  }
}

describe('notification-poll-orchestrator', () => {
  beforeEach(() => {
    mockFetchFixtures.mockReset()
    jest.useFakeTimers({
      now: new Date('2026-02-25T12:00:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('first poll suppression: first executePoll populates state but addNotification is never called', async () => {
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live' })]),
    ])

    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(context.addNotification).not.toHaveBeenCalled()
    expect(orchestrator.isFirstPoll).toBe(false)
  })

  it('second poll with SCHEDULED to LIVE transition generates GAME_START notification', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    // First poll: scheduled — UPCOMING_FIXTURE fires (exempt from suppression)
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Scheduled' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Second poll: now live — GAME_START fires
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    const calls = (context.addNotification as jest.Mock).mock.calls
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type)
    expect(types).toContain('GAME_START')
    expect(context.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GAME_START',
        matchId: 1001,
      }),
    )
  })

  it('second poll with LIVE to ENDED transition generates GAME_END notification', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    // First poll: live
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live', team1Score: 50, team2Score: 48 })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Second poll: ended
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Final', team1Score: 88, team2Score: 76 })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(context.addNotification).toHaveBeenCalledTimes(1)
    expect(context.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GAME_END',
        matchId: 1001,
      }),
    )
  })

  it('upcoming fixture within 24h generates UPCOMING_FIXTURE notification even on first poll', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    // First poll: scheduled match within 24h — should fire immediately (not suppressed)
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Scheduled', startTime: '2026-02-25T18:00:00.000Z' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(context.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPCOMING_FIXTURE',
        matchId: 1001,
      }),
    )
  })

  it('first poll suppresses GAME_START but not UPCOMING_FIXTURE', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    // First poll: two matches — one scheduled (upcoming), one already live
    // Upcoming fixture should fire, game start (no transition) should not
    mockFetchFixtures.mockResolvedValue([
      makeRound([
        makeMatch({ id: 1001, matchStatus: 'Scheduled', startTime: '2026-02-25T18:00:00.000Z' }),
        makeMatch({ id: 2002, matchStatus: 'Live', team1: { id: 1, name: 'Eagles', teamUniqueKey: 'team-eagles-key', alias: null, logoUrl: null }, team2: { id: 2, name: 'Hawks', teamUniqueKey: 'team-hawks-key', alias: null, logoUrl: null } }),
      ]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    const calls = (context.addNotification as jest.Mock).mock.calls
    expect(calls.length).toBe(1)
    expect(calls[0][0].type).toBe('UPCOMING_FIXTURE')
  })

  it('deduplication: same event on third poll does not generate duplicate', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    // First poll
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Scheduled' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Second poll: transition to LIVE
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    const callCountAfterSecond = (context.addNotification as jest.Mock).mock.calls.length

    // Third poll: still LIVE (no new transition but same match)
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(context.addNotification).toHaveBeenCalledTimes(callCountAfterSecond)
  })

  it('only matches involving favorited teams generate notifications', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext({
      favoriteTeamKeys: new Set(['team-eagles-key']),
    })

    // First poll with two matches, only one involves favorites
    mockFetchFixtures.mockResolvedValue([
      makeRound([
        makeMatch({ id: 1001, matchStatus: 'Scheduled' }),
        makeMatch({
          id: 2002,
          matchStatus: 'Scheduled',
          team1: { id: 3, name: 'Wolves', teamUniqueKey: 'team-wolves-key', alias: null, logoUrl: null },
          team2: { id: 4, name: 'Bears', teamUniqueKey: 'team-bears-key', alias: null, logoUrl: null },
        }),
      ]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Second poll: both transition to LIVE
    mockFetchFixtures.mockResolvedValue([
      makeRound([
        makeMatch({ id: 1001, matchStatus: 'Live' }),
        makeMatch({
          id: 2002,
          matchStatus: 'Live',
          team1: { id: 3, name: 'Wolves', teamUniqueKey: 'team-wolves-key', alias: null, logoUrl: null },
          team2: { id: 4, name: 'Bears', teamUniqueKey: 'team-bears-key', alias: null, logoUrl: null },
        }),
      ]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Only favorited team match (1001) gets notifications — no notifications for non-favorited match (2002)
    const calls = (context.addNotification as jest.Mock).mock.calls
    const matchIds = calls.map((c: unknown[]) => (c[0] as { matchId: number }).matchId)
    expect(matchIds.every((id: number) => id === 1001)).toBe(true)
    expect(matchIds).not.toContain(2002)
  })

  it('non-favorited team match is ignored even with status change', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext({
      favoriteTeamKeys: new Set(['some-other-team']),
    })

    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Scheduled' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Live' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(context.addNotification).not.toHaveBeenCalled()
  })

  it('failed division fetch does not block other divisions', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    const failingDivision: DivisionGroup = {
      orgKey: 'bca',
      compKey: 'winter-2026',
      divisionId: 20,
      teamKeys: ['team-fail-key'],
    }

    mockFetchFixtures
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([
        makeRound([makeMatch({ matchStatus: 'Scheduled' })]),
      ])

    // Should not throw
    await orchestrator.executePoll([failingDivision, MOCK_DIVISION], context)

    // Second poll succeeds for the working division
    mockFetchFixtures
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([
        makeRound([makeMatch({ matchStatus: 'Live' })]),
      ])

    await orchestrator.executePoll([failingDivision, MOCK_DIVISION], context)

    expect(context.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GAME_START' }),
    )
  })

  it('matches favorited teams using team-{numericId} fallback format', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    // Favorites stored as team-{numericId} instead of GUID teamUniqueKey
    const context = makePollContext({
      favoriteTeamKeys: new Set(['team-1']),
    })

    // First poll with GUID teamUniqueKey (not matching favorite ID directly)
    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: 'Scheduled', startTime: '2026-02-25T18:00:00.000Z' })]),
    ])
    await orchestrator.executePoll([MOCK_DIVISION], context)

    // Should still match via numeric ID fallback and fire UPCOMING_FIXTURE
    expect(context.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPCOMING_FIXTURE' }),
    )
  })

  it('handles null matchStatus without crashing', async () => {
    const resolver = makeMockResolver()
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    mockFetchFixtures.mockResolvedValue([
      makeRound([makeMatch({ matchStatus: null })]),
    ])

    // Should not throw
    await orchestrator.executePoll([MOCK_DIVISION], context)
  })

  it('resolver returning null skips that division', async () => {
    const resolver = makeMockResolver(null)
    const orchestrator = createPollOrchestrator(resolver)
    const context = makePollContext()

    await orchestrator.executePoll([MOCK_DIVISION], context)

    expect(mockFetchFixtures).not.toHaveBeenCalled()
  })
})
