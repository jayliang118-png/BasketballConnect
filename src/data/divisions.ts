// ---------------------------------------------------------------------------
// Server-side data fetching for divisions
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import { DivisionsResponseSchema } from '@/schemas/division.schema'
import type { DivisionSchemaType } from '@/schemas/division.schema'

const REVALIDATE_SECONDS = 1800

export async function getDivisions(
  competitionKey: string,
): Promise<readonly DivisionSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/division',
    { competitionKey },
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return DivisionsResponseSchema.parse(items)
}

export async function getDivisionById(
  competitionKey: string,
  divisionId: number,
): Promise<DivisionSchemaType | null> {
  const divisions = await getDivisions(competitionKey)
  return divisions.find((d) => d.id === divisionId) ?? null
}

export async function getDivisionName(
  competitionKey: string,
  divisionId: number,
): Promise<string> {
  const division = await getDivisionById(competitionKey, divisionId)
  return division?.name ?? `Division ${divisionId}`
}
