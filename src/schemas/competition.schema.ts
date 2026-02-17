/**
 * Competition Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /livescores/competitions/list?organisationUniqueKey=
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

export const CompetitionSchema = z
  .object({
    id: z.number().int(),
    uniqueKey: GuidSchema,
    name: z.string().min(1),
  })
  .passthrough()

export const CompetitionsResponseSchema = z.array(CompetitionSchema)

export type CompetitionSchemaType = z.infer<typeof CompetitionSchema>
