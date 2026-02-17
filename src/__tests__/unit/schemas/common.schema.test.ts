import { describe, it, expect } from '@jest/globals'
import { z } from 'zod/v4'
import {
  YearSchema,
  YearsResponseSchema,
  ApiErrorResponseSchema,
  PaginationParamsSchema,
  StatTypeSchema,
  AggregateTypeSchema,
  GuidSchema,
} from '@/schemas/common.schema'

describe('Common Schemas', () => {
  describe('GuidSchema', () => {
    it('accepts a valid GUID', () => {
      const result = GuidSchema.safeParse('cd4a4dcf-c99d-4f18-81c8-aa6b2adbbe22')
      expect(result.success).toBe(true)
    })

    it('rejects an invalid GUID', () => {
      const result = GuidSchema.safeParse('not-a-guid')
      expect(result.success).toBe(false)
    })

    it('rejects an empty string', () => {
      const result = GuidSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('YearSchema', () => {
    it('accepts a valid year string', () => {
      const result = YearSchema.safeParse('2025')
      expect(result.success).toBe(true)
    })

    it('accepts a numeric year', () => {
      const result = YearSchema.safeParse(2025)
      expect(result.success).toBe(true)
    })

    it('rejects null', () => {
      const result = YearSchema.safeParse(null)
      expect(result.success).toBe(false)
    })
  })

  describe('YearsResponseSchema', () => {
    it('accepts an array of years', () => {
      const data = ['2024', '2025', '2026']
      const result = YearsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(3)
      }
    })

    it('accepts an empty array', () => {
      const result = YearsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })

    it('rejects non-array', () => {
      const result = YearsResponseSchema.safeParse('2024')
      expect(result.success).toBe(false)
    })
  })

  describe('ApiErrorResponseSchema', () => {
    it('accepts a valid error response', () => {
      const data = {
        message: 'Something went wrong',
        errorCode: 400,
      }
      const result = ApiErrorResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts error with only message', () => {
      const data = { message: 'Error occurred' }
      const result = ApiErrorResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('passes through unknown fields', () => {
      const data = {
        message: 'Error',
        errorCode: 500,
        extraField: 'should be kept',
      }
      const result = ApiErrorResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).extraField).toBe('should be kept')
      }
    })

    it('rejects missing message', () => {
      const result = ApiErrorResponseSchema.safeParse({ errorCode: 400 })
      expect(result.success).toBe(false)
    })
  })

  describe('PaginationParamsSchema', () => {
    it('accepts valid pagination params', () => {
      const data = { offset: 0, limit: 10 }
      const result = PaginationParamsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects negative offset', () => {
      const data = { offset: -1, limit: 10 }
      const result = PaginationParamsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects zero limit', () => {
      const data = { offset: 0, limit: 0 }
      const result = PaginationParamsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects negative limit', () => {
      const data = { offset: 0, limit: -5 }
      const result = PaginationParamsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('StatTypeSchema', () => {
    const validTypes = [
      'TOTALPOINTS',
      'TOTALPF',
      'AVGPOINTS',
      'FREETHROWS',
      'TWOPOINTS',
      'THREEPOINTS',
    ]

    it.each(validTypes)('accepts valid stat type: %s', (type) => {
      const result = StatTypeSchema.safeParse(type)
      expect(result.success).toBe(true)
    })

    it('rejects an invalid stat type', () => {
      const result = StatTypeSchema.safeParse('INVALID_TYPE')
      expect(result.success).toBe(false)
    })
  })

  describe('AggregateTypeSchema', () => {
    it('accepts MATCH', () => {
      const result = AggregateTypeSchema.safeParse('MATCH')
      expect(result.success).toBe(true)
    })

    it('accepts CAREER', () => {
      const result = AggregateTypeSchema.safeParse('CAREER')
      expect(result.success).toBe(true)
    })

    it('rejects invalid aggregate type', () => {
      const result = AggregateTypeSchema.safeParse('SEASON')
      expect(result.success).toBe(false)
    })
  })
})
