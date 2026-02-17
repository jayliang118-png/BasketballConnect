/**
 * Fixture Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /livescores/round/matches?competitionId=&divisionId=
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

export const MatchTeamSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    teamUniqueKey: GuidSchema.nullable(),
    alias: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
  })
  .passthrough()

export const VenueCourtSchema = z
  .object({
    name: z.string(),
    courtNumber: z.number().int(),
    venue: z
      .object({
        name: z.string(),
        shortName: z.string(),
        street1: z.string(),
        suburb: z.string(),
      })
      .passthrough(),
  })
  .passthrough()

export const MatchSchema = z
  .object({
    id: z.number().int(),
    startTime: z.string(),
    team1: MatchTeamSchema,
    team2: MatchTeamSchema,
    team1Score: z.number(),
    team2Score: z.number(),
    matchStatus: z.string(),
    venueCourt: VenueCourtSchema.nullable().optional(),
  })
  .passthrough()

export const RoundSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    sequence: z.number().int().optional(),
    matches: z.array(MatchSchema),
  })
  .passthrough()

export const FixturesResponseSchema = z.array(RoundSchema)

export type MatchTeamSchemaType = z.infer<typeof MatchTeamSchema>
export type MatchSchemaType = z.infer<typeof MatchSchema>
export type RoundSchemaType = z.infer<typeof RoundSchema>
