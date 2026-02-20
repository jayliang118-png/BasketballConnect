// ---------------------------------------------------------------------------
// Server-side data fetching for scoring statistics
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import {
  ScoringStatsResponseSchema,
  UserScoringSummaryResponseSchema,
} from '@/schemas/stats.schema'
import type {
  ScoringStatEntrySchemaType,
  UserScoringSummarySchemaType,
} from '@/schemas/stats.schema'

const SPORT_REF_ID_BASKETBALL = 2
const REVALIDATE_SECONDS = 300

export async function getScoringStats(
  statType: string,
  divisionId: number,
  offset = 0,
  limit = 10,
): Promise<readonly ScoringStatEntrySchemaType[]> {
  const raw = await serverFetch(
    '/livescores/stats/public/scoringStatsByGrade',
    {
      statType,
      divisionId,
      offset,
      limit,
      sportRefId: SPORT_REF_ID_BASKETBALL,
    },
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return ScoringStatsResponseSchema.parse(items)
}

export async function getUserScoringSummary(
  userId: number,
  aggregate: 'CAREER' | 'MATCH',
  competitionUniqueKey: string,
): Promise<readonly UserScoringSummarySchemaType[]> {
  const raw = await serverFetch(
    '/livescores/stats/v2/summaryScoringByUser',
    {
      userId,
      aggregate,
      sportRefId: SPORT_REF_ID_BASKETBALL,
      competitionUniqueKey,
    },
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return UserScoringSummaryResponseSchema.parse(items)
}
