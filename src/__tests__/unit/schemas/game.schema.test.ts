import { describe, it, expect } from '@jest/globals'
import {
  GameSummarySchema,
  ActionLogEntrySchema,
  ActionLogResponseSchema,
  GameEventSchema,
  GameEventsResponseSchema,
} from '@/schemas/game.schema'

describe('Game Schemas', () => {
  const validGameSummary = {
    matchId: 10001,
    competitionUniqueKey: '112f75f6-29ae-433d-afd1-4c733c65d180',
    team1: {
      teamId: 42,
      teamName: 'Southern Districts Spartans',
      score: 78,
      players: [
        {
          playerId: 575361,
          firstName: 'Antong',
          lastName: 'Liang',
          points: 22,
          fouls: 2,
        },
      ],
    },
    team2: {
      teamId: 43,
      teamName: 'Sleeping Dogs',
      score: 65,
      players: [],
    },
  }

  const validActionLogEntry = {
    id: 1,
    matchId: 10001,
    period: 1,
    timestamp: '00:05:30',
    action: 'SCORE',
    playerId: 575361,
    playerName: 'Antong Liang',
    teamId: 42,
    teamName: 'Southern Districts Spartans',
    points: 2,
  }

  const validGameEvent = {
    id: 1,
    matchId: 10001,
    type: 'SCORE',
    period: 1,
    timestamp: '00:05:30',
    playerId: 575361,
    teamId: 42,
  }

  describe('GameSummarySchema', () => {
    it('accepts a valid game summary', () => {
      const result = GameSummarySchema.safeParse(validGameSummary)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.matchId).toBe(10001)
        expect(result.data.team1.score).toBe(78)
        expect(result.data.team1.players).toHaveLength(1)
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validGameSummary,
        venue: 'Brisbane Arena',
        startTime: '2025-03-15T10:00:00Z',
      }
      const result = GameSummarySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).venue).toBe('Brisbane Arena')
      }
    })

    it('rejects missing matchId', () => {
      const { matchId: _id, ...noId } = validGameSummary
      const result = GameSummarySchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing team1', () => {
      const { team1: _t1, ...noTeam } = validGameSummary
      const result = GameSummarySchema.safeParse(noTeam)
      expect(result.success).toBe(false)
    })

    it('rejects missing team2', () => {
      const { team2: _t2, ...noTeam } = validGameSummary
      const result = GameSummarySchema.safeParse(noTeam)
      expect(result.success).toBe(false)
    })
  })

  describe('ActionLogEntrySchema', () => {
    it('accepts a valid action log entry', () => {
      const result = ActionLogEntrySchema.safeParse(validActionLogEntry)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.action).toBe('SCORE')
        expect(result.data.playerId).toBe(575361)
      }
    })

    it('passes through unknown fields', () => {
      const data = { ...validActionLogEntry, description: '2-point field goal' }
      const result = ActionLogEntrySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).description).toBe('2-point field goal')
      }
    })

    it('accepts action log with optional playerId as null', () => {
      const data = { ...validActionLogEntry, playerId: null, playerName: null }
      const result = ActionLogEntrySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing matchId', () => {
      const { matchId: _id, ...noId } = validActionLogEntry
      const result = ActionLogEntrySchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing action', () => {
      const { action: _action, ...noAction } = validActionLogEntry
      const result = ActionLogEntrySchema.safeParse(noAction)
      expect(result.success).toBe(false)
    })
  })

  describe('ActionLogResponseSchema', () => {
    it('accepts an array of action log entries', () => {
      const data = [validActionLogEntry]
      const result = ActionLogResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('accepts an empty array', () => {
      const result = ActionLogResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })

  describe('GameEventSchema', () => {
    it('accepts a valid game event', () => {
      const result = GameEventSchema.safeParse(validGameEvent)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('SCORE')
        expect(result.data.period).toBe(1)
      }
    })

    it('passes through unknown fields', () => {
      const data = { ...validGameEvent, extraData: 'test' }
      const result = GameEventSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).extraData).toBe('test')
      }
    })

    it('accepts game event with optional fields as null', () => {
      const data = { ...validGameEvent, playerId: null, teamId: null }
      const result = GameEventSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validGameEvent
      const result = GameEventSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing type', () => {
      const { type: _type, ...noType } = validGameEvent
      const result = GameEventSchema.safeParse(noType)
      expect(result.success).toBe(false)
    })
  })

  describe('GameEventsResponseSchema', () => {
    it('accepts an array of game events', () => {
      const data = [validGameEvent]
      const result = GameEventsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('accepts an empty array', () => {
      const result = GameEventsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })
})
