/**
 * Organisation Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /users/api/organisations/all
 */

import { z } from 'zod/v4'

export const OrganisationSchema = z
  .object({
    organisationUniqueKey: z.string().min(1),
    name: z.string().min(1),
  })
  .passthrough()

export const OrganisationsResponseSchema = z.array(OrganisationSchema)

export type OrganisationSchemaType = z.infer<typeof OrganisationSchema>
