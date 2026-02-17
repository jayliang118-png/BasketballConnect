/**
 * Organisation Zod schemas for the Squadi Basketball API.
 * Endpoint: GET /users/api/organisations/all
 */

import { z } from 'zod/v4'
import { GuidSchema } from './common.schema'

export const OrganisationSchema = z
  .object({
    organisationUniqueKey: GuidSchema,
    name: z.string().min(1),
  })
  .passthrough()

export const OrganisationsResponseSchema = z.array(OrganisationSchema)

export type OrganisationSchemaType = z.infer<typeof OrganisationSchema>
