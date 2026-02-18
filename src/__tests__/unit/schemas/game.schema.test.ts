import { describe, it, expect } from '@jest/globals'
import {
  GameSummarySchema,
  ActionLogResponseSchema,
  GameEventSchema,
  GameEventsResponseSchema,
} from '@/schemas/game.schema'

describe('Game Schemas', () => {
  const validGameSummary = {
    playing: [
      {
        teamId: 116550,
        shirt: '4',
        photoUrl: null,
        firstName: 'Antong',
        lastName: 'Liang',
        x: null,
        y: null,
        substitutionMinute: null,
        goals: [],
        cards: [],
      },
    ],
    substitutions: [],
    teamOfficials: [],
    teamData: {
      team1: {
        id: 116550,
        name: 'Southern Districts Spartans White',
        teamUniqueKey: '7ba83505-300d-44e0-8b3c-3caed6399fdb',
        logoUrl: null,
      },
      team2: {
        id: 116538,
        name: 'SWM Pirates Red',
        teamUniqueKey: '0f5d735e-8f20-40b1-896b-def63e2d84d4',
        logoUrl: null,
      },
    },
    matchData: {
      team1Score: 72,
      team2Score: 59,
      hasPenalty: false,
      team1PenaltyScore: null,
      team2PenaltyScore: null,
      startTime: '2026-01-27T08:30:29.000Z',
      competitionName: '2025/26 U16 SQJBC',
      venueName: 'Hibiscus Stadium',
      venueCourtName: 'Court 4',
      matchStatus: 'ENDED',
      substitutionEnabled: false,
    },
    attendanceAvailable: true,
  }

  const validActionLogResponse = {
    name: 'success',
    message: 'You have found the match',
    result: [
      {
        startTime: '2026-01-27T08:30:29.000Z',
        type: 'FOUR_QUARTERS',
        id: 1043822,
        team1Score: 72,
        team2Score: 59,
        hasPenalty: 0,
        team1PenaltyScore: null,
        team2PenaltyScore: null,
        team1: {
          id: 116550,
          name: 'Southern Districts Spartans White',
          logoUrl: null,
          team1Score: 72,
        },
        team2: {
          id: 116538,
          name: 'SWM Pirates Red',
          logoUrl: null,
          team2Score: 59,
        },
      },
    ],
  }

  const validGameEvent = {
    timestamp: 1769508316000,
    minute: 40,
    addedMinute: 0,
    teamId: 116538,
    period: {
      id: 4,
      isExtraTime: false,
      isPenalty: false,
    },
    type: 'stat',
    score: '[72 - 59]',
    stat: {
      displayName: '2 Points Made',
      type: 'P',
    },
    players: [
      {
        name: 'K. Obaha',
        shirt: '3',
        playing: true,
        position: { shortName: null },
        isInjured: false,
      },
    ],
  }

  describe('GameSummarySchema', () => {
    it('accepts a valid game summary', () => {
      const result = GameSummarySchema.safeParse(validGameSummary)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.matchData.team1Score).toBe(72)
        expect(result.data.teamData.team1.name).toBe('Southern Districts Spartans White')
        expect(result.data.playing).toHaveLength(1)
      }
    })

    it('rejects missing teamData', () => {
      const { teamData: _td, ...noTeamData } = validGameSummary
      const result = GameSummarySchema.safeParse(noTeamData)
      expect(result.success).toBe(false)
    })

    it('rejects missing matchData', () => {
      const { matchData: _md, ...noMatchData } = validGameSummary
      const result = GameSummarySchema.safeParse(noMatchData)
      expect(result.success).toBe(false)
    })

    it('rejects missing playing', () => {
      const { playing: _p, ...noPlaying } = validGameSummary
      const result = GameSummarySchema.safeParse(noPlaying)
      expect(result.success).toBe(false)
    })
  })

  describe('ActionLogResponseSchema', () => {
    it('accepts a valid action log response', () => {
      const result = ActionLogResponseSchema.safeParse(validActionLogResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toHaveLength(1)
        expect(result.data.result[0].team1Score).toBe(72)
        expect(result.data.result[0].team1.name).toBe('Southern Districts Spartans White')
      }
    })

    it('accepts response with empty result array', () => {
      const data = { ...validActionLogResponse, result: [] }
      const result = ActionLogResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing result', () => {
      const { result: _r, ...noResult } = validActionLogResponse
      const result = ActionLogResponseSchema.safeParse(noResult)
      expect(result.success).toBe(false)
    })
  })

  describe('GameEventSchema', () => {
    it('accepts a valid game event', () => {
      const result = GameEventSchema.safeParse(validGameEvent)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.stat.displayName).toBe('2 Points Made')
        expect(result.data.period.id).toBe(4)
        expect(result.data.players[0].name).toBe('K. Obaha')
      }
    })

    it('accepts event with null score', () => {
      const data = { ...validGameEvent, score: null }
      const result = GameEventSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing stat', () => {
      const { stat: _s, ...noStat } = validGameEvent
      const result = GameEventSchema.safeParse(noStat)
      expect(result.success).toBe(false)
    })

    it('rejects missing period', () => {
      const { period: _p, ...noPeriod } = validGameEvent
      const result = GameEventSchema.safeParse(noPeriod)
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
