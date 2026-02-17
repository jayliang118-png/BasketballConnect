import { describe, it, expect } from '@jest/globals'
import {
  PlayerTeamSchema,
  PlayerSchema,
  PlayerResponseSchema,
} from '@/schemas/player.schema'

describe('Player Schemas', () => {
  const validPlayerTeam = {
    teamId: 42,
    teamName: 'Southern Districts Spartans',
    competitionId: 1808,
    divisionId: 15854,
  }

  const validPlayer = {
    id: 575361,
    firstName: 'Antong',
    lastName: 'Liang',
    photoUrl: 'https://example.com/photo.jpg',
    teams: [validPlayerTeam],
  }

  describe('PlayerTeamSchema', () => {
    it('accepts a valid player team', () => {
      const result = PlayerTeamSchema.safeParse(validPlayerTeam)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.teamId).toBe(42)
        expect(result.data.teamName).toBe('Southern Districts Spartans')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validPlayerTeam,
        role: 'Player',
      }
      const result = PlayerTeamSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).role).toBe('Player')
      }
    })

    it('rejects missing teamId', () => {
      const { teamId: _id, ...noId } = validPlayerTeam
      const result = PlayerTeamSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing teamName', () => {
      const { teamName: _name, ...noName } = validPlayerTeam
      const result = PlayerTeamSchema.safeParse(noName)
      expect(result.success).toBe(false)
    })
  })

  describe('PlayerSchema', () => {
    it('accepts a valid player', () => {
      const result = PlayerSchema.safeParse(validPlayer)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(575361)
        expect(result.data.firstName).toBe('Antong')
        expect(result.data.lastName).toBe('Liang')
        expect(result.data.teams).toHaveLength(1)
      }
    })

    it('accepts a player with optional photoUrl as null', () => {
      const data = { ...validPlayer, photoUrl: null }
      const result = PlayerSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.photoUrl).toBeNull()
      }
    })

    it('accepts a player without photoUrl', () => {
      const { photoUrl: _photo, ...noPhoto } = validPlayer
      const result = PlayerSchema.safeParse(noPhoto)
      expect(result.success).toBe(true)
    })

    it('accepts a player with empty teams array', () => {
      const data = { ...validPlayer, teams: [] }
      const result = PlayerSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validPlayer,
        dateOfBirth: '2008-05-15',
        height: 185,
      }
      const result = PlayerSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).dateOfBirth).toBe('2008-05-15')
      }
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validPlayer
      const result = PlayerSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing firstName', () => {
      const { firstName: _first, ...noFirst } = validPlayer
      const result = PlayerSchema.safeParse(noFirst)
      expect(result.success).toBe(false)
    })

    it('rejects missing lastName', () => {
      const { lastName: _last, ...noLast } = validPlayer
      const result = PlayerSchema.safeParse(noLast)
      expect(result.success).toBe(false)
    })

    it('rejects missing teams', () => {
      const { teams: _teams, ...noTeams } = validPlayer
      const result = PlayerSchema.safeParse(noTeams)
      expect(result.success).toBe(false)
    })
  })

  describe('PlayerResponseSchema', () => {
    it('accepts a valid player response (same as PlayerSchema)', () => {
      const result = PlayerResponseSchema.safeParse(validPlayer)
      expect(result.success).toBe(true)
    })
  })
})
