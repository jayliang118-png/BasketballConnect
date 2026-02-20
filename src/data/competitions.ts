// ---------------------------------------------------------------------------
// Server-side data fetching for competitions
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import { CompetitionsResponseSchema } from '@/schemas/competition.schema'
import type { CompetitionSchemaType } from '@/schemas/competition.schema'

const REVALIDATE_SECONDS = 1800

export async function getCompetitions(
  organisationUniqueKey: string,
): Promise<readonly CompetitionSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/competitions/list',
    { organisationUniqueKey },
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return CompetitionsResponseSchema.parse(items)
}

export async function getCompetitionByKey(
  orgKey: string,
  compKey: string,
): Promise<CompetitionSchemaType | null> {
  const competitions = await getCompetitions(orgKey)
  return competitions.find((c) => c.uniqueKey === compKey) ?? null
}

export async function getCompetitionName(
  orgKey: string,
  compKey: string,
): Promise<string> {
  const comp = await getCompetitionByKey(orgKey, compKey)
  return comp?.name ?? compKey
}
