// ---------------------------------------------------------------------------
// Server-side data fetching for organisations
// ---------------------------------------------------------------------------

import 'server-only'
import { serverFetch } from '@/lib/server-api-client'
import { extractArray } from '@/lib/utils'
import { OrganisationsResponseSchema } from '@/schemas/organisation.schema'
import type { OrganisationSchemaType } from '@/schemas/organisation.schema'

const REVALIDATE_SECONDS = 3600

export async function getOrganisations(): Promise<
  readonly OrganisationSchemaType[]
> {
  const raw = await serverFetch(
    '/users/api/organisations/all',
    undefined,
    REVALIDATE_SECONDS,
  )
  const items = extractArray(raw)
  return OrganisationsResponseSchema.parse(items)
}

export async function getOrganisationName(orgKey: string): Promise<string> {
  const orgs = await getOrganisations()
  const org = orgs.find((o) => o.organisationUniqueKey === orgKey)
  return org?.name ?? orgKey
}
