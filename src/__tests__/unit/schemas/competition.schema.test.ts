import { describe, it, expect } from '@jest/globals'
import {
  CompetitionSchema,
  CompetitionsResponseSchema,
} from '@/schemas/competition.schema'

describe('Competition Schemas', () => {
  const validCompetition = {
    id: 1808,
    uniqueKey: '112f75f6-29ae-433d-afd1-4c733c65d180',
    name: '2025/26 U18 SQJBC Boys',
  }

  describe('CompetitionSchema', () => {
    it('accepts a valid competition', () => {
      const result = CompetitionSchema.safeParse(validCompetition)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(1808)
        expect(result.data.uniqueKey).toBe('112f75f6-29ae-433d-afd1-4c733c65d180')
        expect(result.data.name).toBe('2025/26 U18 SQJBC Boys')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validCompetition,
        year: '2025',
        status: 'active',
      }
      const result = CompetitionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).year).toBe('2025')
      }
    })

    it('rejects missing id', () => {
      const { id: _id, ...noId } = validCompetition
      const result = CompetitionSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing uniqueKey', () => {
      const { uniqueKey: _key, ...noKey } = validCompetition
      const result = CompetitionSchema.safeParse(noKey)
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const { name: _name, ...noName } = validCompetition
      const result = CompetitionSchema.safeParse(noName)
      expect(result.success).toBe(false)
    })

    it('rejects non-integer id', () => {
      const result = CompetitionSchema.safeParse({
        ...validCompetition,
        id: 18.5,
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid GUID for uniqueKey', () => {
      const result = CompetitionSchema.safeParse({
        ...validCompetition,
        uniqueKey: 'not-a-guid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('CompetitionsResponseSchema', () => {
    it('accepts an array of competitions', () => {
      const data = [
        validCompetition,
        {
          id: 1809,
          uniqueKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: '2025/26 U16 SQJBC Girls',
        },
      ]
      const result = CompetitionsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = CompetitionsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })
  })
})
