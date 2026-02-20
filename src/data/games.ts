// ---------------------------------------------------------------------------
// Server-side data fetching for game details
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import {
  GameSummarySchema,
  ActionLogResponseSchema,
  GameEventsResponseSchema,
} from '@/schemas/game.schema'
import type {
  GameSummarySchemaType,
  ActionLogResponseSchemaType,
  GameEventSchemaType,
} from '@/schemas/game.schema'

const REVALIDATE_SUMMARY = 60
const REVALIDATE_LOG = 60
const REVALIDATE_EVENTS = 60

export async function getGameSummary(
  matchId: number,
  competitionUniqueKey: string,
): Promise<GameSummarySchemaType> {
  const raw = await serverFetch(
    '/livescores/matches/public/gameSummary',
    { matchId, competitionUniqueKey },
    REVALIDATE_SUMMARY,
  )
  return GameSummarySchema.parse(raw)
}

export async function getActionLog(
  matchId: number,
  competitionId: string,
): Promise<ActionLogResponseSchemaType> {
  const raw = await serverFetch(
    '/livescores/web/matches/public/actionLog',
    { matchId, competitionId },
    REVALIDATE_LOG,
  )
  return ActionLogResponseSchema.parse(raw)
}

export async function getGameEvents(
  matchId: number,
): Promise<readonly GameEventSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/matches/public/events',
    { matchId },
    REVALIDATE_EVENTS,
  )
  return GameEventsResponseSchema.parse(raw)
}
