// ---------------------------------------------------------------------------
// Server-side data fetching for fixtures
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import { FixturesResponseSchema } from '@/schemas/fixture.schema'
import type { RoundSchemaType } from '@/schemas/fixture.schema'

const REVALIDATE_SECONDS = 300

export async function getFixtures(
  competitionId: number,
  divisionId: number,
): Promise<readonly RoundSchemaType[]> {
  const raw = await serverFetch(
    '/livescores/round/matches',
    { competitionId, divisionId },
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return FixturesResponseSchema.parse(items)
}
