/**
 * Division Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /livescores/division?competitionKey=
 */

import { z } from 'zod/v4'

export const DivisionSchema = z
  .object({
    id: z.number().int(),
    name: z.string().min(1),
  })
  .passthrough()

export const DivisionsResponseSchema = z.array(DivisionSchema)

export type DivisionSchemaType = z.infer<typeof DivisionSchema>
