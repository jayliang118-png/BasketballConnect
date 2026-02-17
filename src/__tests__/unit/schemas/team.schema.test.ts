import { describe, it, expect } from '@jest/globals'
import {
  TeamSchema,
  TeamsResponseSchema,
  TeamPlayerSchema,
  TeamDetailSchema,
} from '@/schemas/team.schema'

describe('Team Schemas', () => {
  const validTeam = {
    teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
    name: 'Southern Districts Spartans',
  }

  const validTeamPlayer = {
    playerId: 575361,
    firstName: 'Antong',
    lastName: 'Liang',
  }

  describe('TeamSchema', () => {
    it('accepts a valid team', () => {
      const result = TeamSchema.safeParse(validTeam)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.teamUniqueKey).toBe('f04e48ea-c758-4ef3-adae-f38f87781598')
        expect(result.data.name).toBe('Southern Districts Spartans')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validTeam,
        logoUrl: 'https://example.com/logo.png',
        teamId: 42,
      }
      const result = TeamSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).logoUrl).toBe(
          'https://example.com/logo.png'
        )
      }
    })

    it('rejects missing teamUniqueKey', () => {
      const result = TeamSchema.safeParse({ name: 'Test Team' })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = TeamSchema.safeParse({
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid GUID', () => {
      const result = TeamSchema.safeParse({
        teamUniqueKey: 'invalid',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = TeamSchema.safeParse({
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('TeamsResponseSchema', () => {
    it('accepts an array of teams', () => {
      const data = [
        validTeam,
        {
          teamUniqueKey: 'ba6fabf0-373a-461d-85b5-7cfd6c301895',
          name: 'Sleeping Dogs',
        },
      ]
      const result = TeamsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = TeamsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })

  describe('TeamPlayerSchema', () => {
    it('accepts a valid team player', () => {
      const result = TeamPlayerSchema.safeParse(validTeamPlayer)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.playerId).toBe(575361)
        expect(result.data.firstName).toBe('Antong')
        expect(result.data.lastName).toBe('Liang')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validTeamPlayer,
        position: 'Guard',
        jerseyNumber: 7,
      }
      const result = TeamPlayerSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).position).toBe('Guard')
      }
    })

    it('rejects missing playerId', () => {
      const result = TeamPlayerSchema.safeParse({
        firstName: 'Antong',
        lastName: 'Liang',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer playerId', () => {
      const result = TeamPlayerSchema.safeParse({
        ...validTeamPlayer,
        playerId: 5.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('TeamDetailSchema', () => {
    it('accepts a valid team detail with players', () => {
      const data = {
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
        name: 'Southern Districts Spartans',
        players: [validTeamPlayer],
      }
      const result = TeamDetailSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.players).toHaveLength(1)
        expect(result.data.players[0].firstName).toBe('Antong')
      }
    })

    it('accepts team detail with empty players array', () => {
      const data = {
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
        name: 'Empty Team',
        players: [],
      }
      const result = TeamDetailSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('passes through unknown fields', () => {
      const data = {
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
        name: 'Test',
        players: [],
        coach: 'John Smith',
      }
      const result = TeamDetailSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).coach).toBe('John Smith')
      }
    })

    it('rejects missing players', () => {
      const result = TeamDetailSchema.safeParse({
        teamUniqueKey: 'f04e48ea-c758-4ef3-adae-f38f87781598',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })
  })
})
