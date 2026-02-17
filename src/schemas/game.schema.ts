/**
 * Game Zod schemas for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/matches/public/gameSummary?matchId=&competitionUniqueKey=
 *   GET /livescores/web/matches/public/actionLog?matchId=&competitionId=
 *   GET /livescores/matches/public/events?matchId=
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

const GameSummaryPlayerSchema = z
  .object({
    playerId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    points: z.number(),
    fouls: z.number(),
  })
  .passthrough()

const GameSummaryTeamSchema = z
  .object({
    teamId: z.number().int(),
    teamName: z.string(),
    score: z.number(),
    players: z.array(GameSummaryPlayerSchema),
  })
  .passthrough()

export const GameSummarySchema = z
  .object({
    matchId: z.number().int(),
    competitionUniqueKey: GuidSchema,
    team1: GameSummaryTeamSchema,
    team2: GameSummaryTeamSchema,
  })
  .passthrough()

export const ActionLogEntrySchema = z
  .object({
    id: z.number().int(),
    matchId: z.number().int(),
    period: z.number().int(),
    timestamp: z.string(),
    action: z.string(),
    playerId: z.number().int().nullable().optional(),
    playerName: z.string().nullable().optional(),
    teamId: z.number().int().nullable().optional(),
    teamName: z.string().nullable().optional(),
    points: z.number().nullable().optional(),
  })
  .passthrough()

export const ActionLogResponseSchema = z.array(ActionLogEntrySchema)

export const GameEventSchema = z
  .object({
    id: z.number().int(),
    matchId: z.number().int(),
    type: z.string(),
    period: z.number().int(),
    timestamp: z.string(),
    playerId: z.number().int().nullable().optional(),
    teamId: z.number().int().nullable().optional(),
  })
  .passthrough()

export const GameEventsResponseSchema = z.array(GameEventSchema)

export type GameSummarySchemaType = z.infer<typeof GameSummarySchema>
export type ActionLogEntrySchemaType = z.infer<typeof ActionLogEntrySchema>
export type GameEventSchemaType = z.infer<typeof GameEventSchema>
