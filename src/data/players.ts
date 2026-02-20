// ---------------------------------------------------------------------------
// Server-side data fetching for players
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { PlayerSchema } from '@/schemas/player.schema'
import type { PlayerSchemaType } from '@/schemas/player.schema'

const REVALIDATE_SECONDS = 600

export async function getPlayer(
  playerId: number,
): Promise<PlayerSchemaType> {
  const raw = await serverFetch(
    '/livescores/users/public/userProfile',
    { playerId },
    REVALIDATE_SECONDS,
  )
  return PlayerSchema.parse(raw)
}

export async function getPlayerByUserId(
  userId: number,
): Promise<PlayerSchemaType> {
  const raw = await serverFetch(
    '/livescores/users/public/userProfile',
    { userId },
    REVALIDATE_SECONDS,
  )
  return PlayerSchema.parse(raw)
}
