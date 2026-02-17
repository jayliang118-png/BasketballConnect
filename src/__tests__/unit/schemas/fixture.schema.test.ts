import { describe, it, expect } from '@jest/globals'
import {
  MatchTeamSchema,
  MatchSchema,
  RoundSchema,
  FixturesResponseSchema,
} from '@/schemas/fixture.schema'

describe('Fixture Schemas', () => {
  const validMatchTeam = {
    id: 42,
    name: 'Southern Districts Spartans',
    teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
    alias: null,
    logoUrl: null,
  }

  const validVenueCourt = {
    name: 'CISC4',
    courtNumber: 4,
    venue: {
      name: 'Coomera Indoor Sports Centre',
      shortName: 'CISC',
      street1: '35 Beattie Rd',
      suburb: 'Coomera',
    },
  }

  const validMatch = {
    id: 10001,
    startTime: '2025-03-15T10:00:00Z',
    team1: validMatchTeam,
    team2: {
      id: 43,
      name: 'Sleeping Dogs',
      teamUniqueKey: 'ba6fabf0-373a-461d-85b5-7cfd6c301895',
      alias: null,
      logoUrl: null,
    },
    team1Score: 78,
    team2Score: 65,
    matchStatus: 'ENDED',
    venueCourt: validVenueCourt,
  }

  const validRound = {
    id: 501,
    name: 'Round 1',
    matches: [validMatch],
  }

  describe('MatchTeamSchema', () => {
    it('accepts a valid match team', () => {
      const result = MatchTeamSchema.safeParse(validMatchTeam)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(42)
        expect(result.data.name).toBe('Southern Districts Spartans')
      }
    })

    it('accepts match team with null teamUniqueKey (bye team)', () => {
      const data = { ...validMatchTeam, teamUniqueKey: null }
      const result = MatchTeamSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.teamUniqueKey).toBeNull()
      }
    })

    it('passes through unknown fields', () => {
      const data = { ...validMatchTeam, extraField: 'test' }
      const result = MatchTeamSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).extraField).toBe('test')
      }
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validMatchTeam
      const result = MatchTeamSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const { name: _name, ...noName } = validMatchTeam
      const result = MatchTeamSchema.safeParse(noName)
      expect(result.success).toBe(false)
    })
  })

  describe('MatchSchema', () => {
    it('accepts a valid match', () => {
      const result = MatchSchema.safeParse(validMatch)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(10001)
        expect(result.data.team1.name).toBe('Southern Districts Spartans')
        expect(result.data.team2.name).toBe('Sleeping Dogs')
        expect(result.data.team1Score).toBe(78)
        expect(result.data.team2Score).toBe(65)
      }
    })

    it('accepts a match with null venueCourt', () => {
      const data = { ...validMatch, venueCourt: null }
      const result = MatchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('passes through unknown fields', () => {
      const data = { ...validMatch, roundId: 501 }
      const result = MatchSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).roundId).toBe(501)
      }
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validMatch
      const result = MatchSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing team1', () => {
      const { team1: _t1, ...noTeam1 } = validMatch
      const result = MatchSchema.safeParse(noTeam1)
      expect(result.success).toBe(false)
    })

    it('rejects missing team2', () => {
      const { team2: _t2, ...noTeam2 } = validMatch
      const result = MatchSchema.safeParse(noTeam2)
      expect(result.success).toBe(false)
    })
  })

  describe('RoundSchema', () => {
    it('accepts a valid round', () => {
      const result = RoundSchema.safeParse(validRound)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(501)
        expect(result.data.name).toBe('Round 1')
        expect(result.data.matches).toHaveLength(1)
      }
    })

    it('accepts round with empty matches', () => {
      const data = { ...validRound, matches: [] }
      const result = RoundSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts round with sequence field', () => {
      const data = { ...validRound, sequence: 1 }
      const result = RoundSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sequence).toBe(1)
      }
    })

    it('passes through unknown fields', () => {
      const data = { ...validRound, competitionId: 542 }
      const result = RoundSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).competitionId).toBe(542)
      }
    })

    it('rejects missing matches array', () => {
      const { matches: _m, ...noMatches } = validRound
      const result = RoundSchema.safeParse(noMatches)
      expect(result.success).toBe(false)
    })
  })

  describe('FixturesResponseSchema', () => {
    it('accepts an array of rounds', () => {
      const data = [
        validRound,
        { id: 502, name: 'Round 2', matches: [] },
      ]
      const result = FixturesResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = FixturesResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })
})
