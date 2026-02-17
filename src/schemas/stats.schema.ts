/**
 * Stats Zod schemas for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/stats/public/scoringStatsByGrade?statType=&divisionId=&offset=&limit=&sportRefId=2
 *   GET /livescores/stats/v2/summaryScoringByUser?userId=&aggregate=&sportRefId=2&competitionId=
 */

import { z } from 'zod/v4'

export const ScoringStatEntrySchema = z
  .object({
    rank: z.number().int(),
    playerId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    teamName: z.string(),
    gamesPlayed: z.number().int(),
    value: z.number(),
  })
  .passthrough()

export const ScoringStatsResponseSchema = z.array(ScoringStatEntrySchema)

export const UserScoringSummarySchema = z
  .object({
    matchId: z.number().int().nullable().optional(),
    competitionId: z.number().int(),
    competitionName: z.string(),
    date: z.string().nullable().optional(),
    points: z.number(),
    freeThrows: z.number(),
    twoPoints: z.number(),
    threePoints: z.number(),
    fouls: z.number(),
  })
  .passthrough()

export const UserScoringSummaryResponseSchema = z.array(UserScoringSummarySchema)

export type ScoringStatEntrySchemaType = z.infer<typeof ScoringStatEntrySchema>
export type UserScoringSummarySchemaType = z.infer<typeof UserScoringSummarySchema>
