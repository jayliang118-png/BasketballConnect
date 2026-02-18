/**
 * Game Zod schemas for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/matches/public/gameSummary?matchId=&competitionUniqueKey=
 *   GET /livescores/web/matches/public/actionLog?matchId=&competitionId=
 *   GET /livescores/matches/public/events?matchId=
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

// ---------------------------------------------------------------------------
// gameSummary
// ---------------------------------------------------------------------------

const GameSummaryPlayerSchema = z.object({
  teamId: z.number().int(),
  shirt: z.string(),
  photoUrl: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  substitutionMinute: z.number().nullable(),
  goals: z.array(z.unknown()),
  cards: z.array(z.unknown()),
})

const GameSummaryTeamInfoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  teamUniqueKey: GuidSchema,
  logoUrl: z.string().nullable(),
})

const GameSummaryMatchDataSchema = z.object({
  team1Score: z.number(),
  team2Score: z.number(),
  hasPenalty: z.boolean(),
  team1PenaltyScore: z.number().nullable(),
  team2PenaltyScore: z.number().nullable(),
  startTime: z.string(),
  competitionName: z.string(),
  venueName: z.string().nullable(),
  venueCourtName: z.string().nullable(),
  matchStatus: z.string(),
  substitutionEnabled: z.boolean(),
})

export const GameSummarySchema = z.object({
  playing: z.array(GameSummaryPlayerSchema),
  substitutions: z.array(z.unknown()),
  teamOfficials: z.array(z.unknown()),
  teamData: z.object({
    team1: GameSummaryTeamInfoSchema,
    team2: GameSummaryTeamInfoSchema,
  }),
  matchData: GameSummaryMatchDataSchema,
  attendanceAvailable: z.boolean(),
})

// ---------------------------------------------------------------------------
// actionLog
// ---------------------------------------------------------------------------

const ActionLogTeamSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  team1Score: z.number().optional(),
  team2Score: z.number().optional(),
})

const ActionLogMatchSchema = z.object({
  startTime: z.string(),
  type: z.string(),
  id: z.number().int(),
  team1Score: z.number(),
  team2Score: z.number(),
  hasPenalty: z.number(),
  team1PenaltyScore: z.number().nullable(),
  team2PenaltyScore: z.number().nullable(),
  team1: ActionLogTeamSchema,
  team2: ActionLogTeamSchema,
})

export const ActionLogResponseSchema = z.object({
  name: z.string(),
  message: z.string(),
  result: z.array(ActionLogMatchSchema),
})

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

const GameEventPeriodSchema = z.object({
  id: z.number().int(),
  isExtraTime: z.boolean(),
  isPenalty: z.boolean(),
})

const GameEventStatSchema = z.object({
  displayName: z.string(),
  type: z.string(),
})

const GameEventPlayerSchema = z.object({
  name: z.string(),
  shirt: z.string(),
  playing: z.boolean(),
  position: z.object({
    shortName: z.string().nullable(),
  }),
  isInjured: z.boolean(),
})

export const GameEventSchema = z.object({
  timestamp: z.number(),
  minute: z.number(),
  addedMinute: z.number(),
  teamId: z.number().int(),
  period: GameEventPeriodSchema,
  type: z.string(),
  score: z.string().nullable(),
  stat: GameEventStatSchema,
  players: z.array(GameEventPlayerSchema),
})

export const GameEventsResponseSchema = z.array(GameEventSchema)

export type GameSummarySchemaType = z.infer<typeof GameSummarySchema>
export type ActionLogResponseSchemaType = z.infer<typeof ActionLogResponseSchema>
export type GameEventSchemaType = z.infer<typeof GameEventSchema>
