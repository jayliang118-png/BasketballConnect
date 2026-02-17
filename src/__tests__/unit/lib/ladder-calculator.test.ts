import { computeLadder } from '@/lib/ladder-calculator'
import type { Round } from '@/types/fixture'

function makeMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    startTime: '2025-01-01T10:00:00Z',
    team1: { id: 100, name: 'Team A', teamUniqueKey: null, alias: null, logoUrl: null },
    team2: { id: 200, name: 'Team B', teamUniqueKey: null, alias: null, logoUrl: null },
    team1Score: 50,
    team2Score: 40,
    matchStatus: 'Completed',
    venueCourt: null,
    team1ResultId: 1,
    team2ResultId: 2,
    divisionId: 10,
    isFinals: false,
    excludeFromLadder: false,
    ...overrides,
  }
}

function makeRound(matches: Record<string, unknown>[], name = 'Round 1'): Round {
  return {
    id: 1,
    name,
    sequence: 1,
    matches: matches as unknown as Round['matches'],
  }
}

describe('computeLadder', () => {
  it('returns empty array for empty rounds', () => {
    const result = computeLadder([], 10)
    expect(result).toEqual([])
  })

  it('returns empty array for rounds with no matches', () => {
    const result = computeLadder([makeRound([])], 10)
    expect(result).toEqual([])
  })

  it('computes correct stats for a single win/loss match', () => {
    const match = makeMatch({ team1Score: 60, team2Score: 45 })
    const result = computeLadder([makeRound([match])], 10)

    expect(result).toHaveLength(2)

    const teamA = result.find((e) => e.teamName === 'Team A')!
    expect(teamA.rank).toBe(1)
    expect(teamA.played).toBe(1)
    expect(teamA.wins).toBe(1)
    expect(teamA.losses).toBe(0)
    expect(teamA.pointsFor).toBe(60)
    expect(teamA.pointsAgainst).toBe(45)
    expect(teamA.competitionPoints).toBe(4)
    expect(teamA.goalDifference).toBe(15)

    const teamB = result.find((e) => e.teamName === 'Team B')!
    expect(teamB.rank).toBe(2)
    expect(teamB.played).toBe(1)
    expect(teamB.wins).toBe(0)
    expect(teamB.losses).toBe(1)
    expect(teamB.pointsFor).toBe(45)
    expect(teamB.pointsAgainst).toBe(60)
    expect(teamB.competitionPoints).toBe(0)
    expect(teamB.goalDifference).toBe(-15)
  })

  it('handles draw matches correctly', () => {
    const match = makeMatch({
      team1Score: 50,
      team2Score: 50,
      team1ResultId: 3,
      team2ResultId: 3,
    })
    const result = computeLadder([makeRound([match])], 10)

    expect(result).toHaveLength(2)
    const teamA = result.find((e) => e.teamName === 'Team A')!
    expect(teamA.draws).toBe(1)
    expect(teamA.wins).toBe(0)
    expect(teamA.competitionPoints).toBe(2)

    const teamB = result.find((e) => e.teamName === 'Team B')!
    expect(teamB.draws).toBe(1)
    expect(teamB.competitionPoints).toBe(2)
  })

  it('excludes finals matches', () => {
    const match = makeMatch({ isFinals: true })
    const result = computeLadder([makeRound([match])], 10)
    expect(result).toEqual([])
  })

  it('excludes matches flagged with excludeFromLadder', () => {
    const match = makeMatch({ excludeFromLadder: true })
    const result = computeLadder([makeRound([match])], 10)
    expect(result).toEqual([])
  })

  it('filters by divisionId', () => {
    const match = makeMatch({ divisionId: 99 })
    const result = computeLadder([makeRound([match])], 10)
    expect(result).toEqual([])
  })

  it('includes matches from the correct division', () => {
    const match = makeMatch({ divisionId: 10 })
    const result = computeLadder([makeRound([match])], 10)
    expect(result).toHaveLength(2)
  })

  it('skips matches with no result IDs', () => {
    const match = makeMatch({ team1ResultId: 0, team2ResultId: 0 })
    const result = computeLadder([makeRound([match])], 10)
    expect(result).toEqual([])
  })

  it('sorts by PTS desc, then W% desc, then GD desc', () => {
    const matches = [
      makeMatch({ id: 1, team1Score: 60, team2Score: 45 }),
      makeMatch({
        id: 2,
        team1: { id: 300, name: 'Team C', teamUniqueKey: null, alias: null, logoUrl: null },
        team2: { id: 400, name: 'Team D', teamUniqueKey: null, alias: null, logoUrl: null },
        team1Score: 80, team2Score: 30,
      }),
    ]
    const result = computeLadder([makeRound(matches)], 10)

    // Team C should be ranked higher (same PTS=4, same W%=100%, but higher GD=50 vs 15)
    expect(result[0].teamName).toBe('Team C')
    expect(result[0].rank).toBe(1)
    expect(result[1].teamName).toBe('Team A')
    expect(result[1].rank).toBe(2)
  })

  it('handles tied ranks correctly', () => {
    const match1 = makeMatch({
      id: 1,
      team1: { id: 100, name: 'Team A', teamUniqueKey: null, alias: null, logoUrl: null },
      team2: { id: 200, name: 'Team B', teamUniqueKey: null, alias: null, logoUrl: null },
      team1Score: 50, team2Score: 40,
    })
    const match2 = makeMatch({
      id: 2,
      team1: { id: 300, name: 'Team C', teamUniqueKey: null, alias: null, logoUrl: null },
      team2: { id: 400, name: 'Team D', teamUniqueKey: null, alias: null, logoUrl: null },
      team1Score: 50, team2Score: 40,
    })
    const result = computeLadder([makeRound([match1, match2])], 10)

    // Team A and Team C have identical stats: PTS=4, W%=1, GD=10
    const teamA = result.find((e) => e.teamName === 'Team A')!
    const teamC = result.find((e) => e.teamName === 'Team C')!
    expect(teamA.rank).toBe(teamC.rank)
  })

  it('handles forfeit matches', () => {
    const match = makeMatch({
      matchStatus: 'Forfeit',
      team1Score: 0,
      team2Score: 0,
      team1ResultId: 1,
      team2ResultId: 2,
    })
    const result = computeLadder([makeRound([match])], 10)

    const teamA = result.find((e) => e.teamName === 'Team A')!
    expect(teamA.forfeitWins).toBe(1)
    expect(teamA.wins).toBe(0)
    expect(teamA.competitionPoints).toBe(4)

    const teamB = result.find((e) => e.teamName === 'Team B')!
    expect(teamB.forfeitLosses).toBe(1)
    expect(teamB.competitionPoints).toBe(0)
  })

  it('accumulates stats across multiple rounds', () => {
    const round1 = makeRound([
      makeMatch({ id: 1, team1Score: 60, team2Score: 45 }),
    ], 'Round 1')
    const round2 = makeRound([
      makeMatch({
        id: 2, team1Score: 55, team2Score: 50,
        team1ResultId: 2, team2ResultId: 1,
      }),
    ], 'Round 2')

    const result = computeLadder([round1, round2], 10)

    const teamA = result.find((e) => e.teamName === 'Team A')!
    expect(teamA.played).toBe(2)
    expect(teamA.wins).toBe(1)
    expect(teamA.losses).toBe(1)
    expect(teamA.pointsFor).toBe(115)
    expect(teamA.pointsAgainst).toBe(95)

    const teamB = result.find((e) => e.teamName === 'Team B')!
    expect(teamB.played).toBe(2)
    expect(teamB.wins).toBe(1)
    expect(teamB.losses).toBe(1)
  })
})
