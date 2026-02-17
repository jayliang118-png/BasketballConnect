import { describe, it, expect } from '@jest/globals'
import {
  DivisionSchema,
  DivisionsResponseSchema,
} from '@/schemas/division.schema'

describe('Division Schemas', () => {
  const validDivision = {
    id: 15854,
    name: 'U18 Boys Premier League',
  }

  describe('DivisionSchema', () => {
    it('accepts a valid division', () => {
      const result = DivisionSchema.safeParse(validDivision)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(15854)
        expect(result.data.name).toBe('U18 Boys Premier League')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validDivision,
        competitionId: 1808,
        grade: 'A',
      }
      const result = DivisionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).competitionId).toBe(1808)
      }
    })

    it('rejects missing id', () => {
      const result = DivisionSchema.safeParse({ name: 'Test Division' })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = DivisionSchema.safeParse({ id: 100 })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer id', () => {
      const result = DivisionSchema.safeParse({ id: 15.5, name: 'Test' })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = DivisionSchema.safeParse({ id: 100, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('DivisionsResponseSchema', () => {
    it('accepts an array of divisions', () => {
      const data = [
        validDivision,
        { id: 15855, name: 'U18 Girls Premier League' },
      ]
      const result = DivisionsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = DivisionsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })

    it('rejects array with invalid division', () => {
      const data = [{ id: 'not-a-number', name: 'Test' }]
      const result = DivisionsResponseSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
