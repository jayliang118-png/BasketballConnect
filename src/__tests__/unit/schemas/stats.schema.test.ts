import { describe, it, expect } from '@jest/globals'
import {
  ScoringStatEntrySchema,
  ScoringStatsResponseSchema,
  UserScoringSummarySchema,
  UserScoringSummaryResponseSchema,
} from '@/schemas/stats.schema'

describe('Stats Schemas', () => {
  const validScoringStatEntry = {
    rank: 1,
    playerId: 575361,
    firstName: 'Antong',
    lastName: 'Liang',
    teamName: 'Southern Districts Spartans',
    gamesPlayed: 10,
    value: 22.5,
  }

  const validUserScoringSummary = {
    matchId: 10001,
    competitionId: 1808,
    competitionName: '2025/26 U18 SQJBC Boys',
    date: '2025-03-15',
    points: 22,
    freeThrows: 4,
    twoPoints: 6,
    threePoints: 2,
    fouls: 2,
  }

  describe('ScoringStatEntrySchema', () => {
    it('accepts a valid scoring stat entry', () => {
      const result = ScoringStatEntrySchema.safeParse(validScoringStatEntry)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rank).toBe(1)
        expect(result.data.playerId).toBe(575361)
        expect(result.data.value).toBe(22.5)
      }
    })

    it('accepts integer value', () => {
      const data = { ...validScoringStatEntry, value: 22 }
      const result = ScoringStatEntrySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validScoringStatEntry,
        divisionName: 'U18 Boys Premier League',
      }
      const result = ScoringStatEntrySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).divisionName).toBe(
          'U18 Boys Premier League'
        )
      }
    })

    it('rejects missing rank', () => {
      const { rank: _rank, ...noRank } = validScoringStatEntry
      const result = ScoringStatEntrySchema.safeParse(noRank)
      expect(result.success).toBe(false)
    })

    it('rejects missing playerId', () => {
      const { playerId: _id, ...noId } = validScoringStatEntry
      const result = ScoringStatEntrySchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing value', () => {
      const { value: _val, ...noVal } = validScoringStatEntry
      const result = ScoringStatEntrySchema.safeParse(noVal)
      expect(result.success).toBe(false)
    })

    it('rejects non-integer playerId', () => {
      const result = ScoringStatEntrySchema.safeParse({
        ...validScoringStatEntry,
        playerId: 5.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('ScoringStatsResponseSchema', () => {
    it('accepts an array of scoring stat entries', () => {
      const data = [
        validScoringStatEntry,
        {
          rank: 2,
          playerId: 575362,
          firstName: 'James',
          lastName: 'Smith',
          teamName: 'Sleeping Dogs',
          gamesPlayed: 10,
          value: 20.1,
        },
      ]
      const result = ScoringStatsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = ScoringStatsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })

  describe('UserScoringSummarySchema', () => {
    it('accepts a valid user scoring summary', () => {
      const result = UserScoringSummarySchema.safeParse(validUserScoringSummary)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.matchId).toBe(10001)
        expect(result.data.points).toBe(22)
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validUserScoringSummary,
        opponentTeam: 'Sleeping Dogs',
      }
      const result = UserScoringSummarySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).opponentTeam).toBe('Sleeping Dogs')
      }
    })

    it('accepts summary with optional matchId as null (career aggregate)', () => {
      const data = { ...validUserScoringSummary, matchId: null, date: null }
      const result = UserScoringSummarySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing competitionId', () => {
      const { competitionId: _id, ...noId } = validUserScoringSummary
      const result = UserScoringSummarySchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing points', () => {
      const { points: _pts, ...noPts } = validUserScoringSummary
      const result = UserScoringSummarySchema.safeParse(noPts)
      expect(result.success).toBe(false)
    })
  })

  describe('UserScoringSummaryResponseSchema', () => {
    it('accepts an array of user scoring summaries', () => {
      const data = [validUserScoringSummary]
      const result = UserScoringSummaryResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('accepts an empty array', () => {
      const result = UserScoringSummaryResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })
})
