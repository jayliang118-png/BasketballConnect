/**
 * Player Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /livescores/users/public/userProfile?playerId=
 */

import { z } from 'zod/v4'

export const PlayerTeamSchema = z
  .object({
    teamId: z.number().int(),
    teamName: z.string(),
    competitionId: z.number().int(),
    divisionId: z.number().int(),
  })
  .passthrough()

export const PlayerSchema = z
  .object({
    id: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    photoUrl: z.string().nullable().optional(),
    teams: z.array(PlayerTeamSchema).optional().default([]),
  })
  .passthrough()

export const PlayerResponseSchema = PlayerSchema

export type PlayerTeamSchemaType = z.infer<typeof PlayerTeamSchema>
export type PlayerSchemaType = z.infer<typeof PlayerSchema>
