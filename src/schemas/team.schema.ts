/**
 * Team Zod schemas for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/public/teams/list?competitionId=&divisionId=&organisationId=
 *   GET /competition/participantGrading/teamViewPublic/team?teamUniqueKey=
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

export const TeamSchema = z
  .object({
    id: z.number().int().optional(),
    teamUniqueKey: GuidSchema.optional(),
    name: z.string().min(1),
  })
  .passthrough()

export const TeamsResponseSchema = z.array(TeamSchema)

export const TeamPlayerSchema = z
  .object({
    playerId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
  })
  .passthrough()

export const TeamDetailSchema = z
  .object({
    teamUniqueKey: GuidSchema,
    name: z.string().min(1),
    players: z.array(TeamPlayerSchema),
  })
  .passthrough()

export type TeamSchemaType = z.infer<typeof TeamSchema>
export type TeamPlayerSchemaType = z.infer<typeof TeamPlayerSchema>
export type TeamDetailSchemaType = z.infer<typeof TeamDetailSchema>
