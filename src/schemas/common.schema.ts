/**
 * Common Zod schemas shared across the Squadi Basketball API.
 */

import { z } from 'zod/v4'

/** GUID validation pattern (UUID v4 format). */
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const GuidSchema = z.string().regex(GUID_PATTERN, 'Invalid GUID format')

export const YearSchema = z.union([z.string(), z.number()])

export const YearsResponseSchema = z.array(YearSchema)

export const ApiErrorResponseSchema = z
  .object({
    message: z.string(),
    errorCode: z.number().int().optional(),
  })
  .passthrough()

export const PaginationParamsSchema = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(1),
})

export const StatTypeSchema = z.enum([
  'TOTALPOINTS',
  'TOTALPF',
  'AVGPOINTS',
  'FREETHROWS',
  'TWOPOINTS',
  'THREEPOINTS',
])

export const AggregateTypeSchema = z.enum(['MATCH', 'CAREER'])

/** Inferred types from schemas for convenience. */
export type GuidSchemaType = z.infer<typeof GuidSchema>
export type YearSchemaType = z.infer<typeof YearSchema>
export type ApiErrorResponseSchemaType = z.infer<typeof ApiErrorResponseSchema>
export type PaginationParamsSchemaType = z.infer<typeof PaginationParamsSchema>
export type StatTypeSchemaType = z.infer<typeof StatTypeSchema>
export type AggregateTypeSchemaType = z.infer<typeof AggregateTypeSchema>
