/**
 * Organisation types for the Squadi Basketball API.
 * Endpoint: GET /users/api/organisations/all
 */

import type { Guid } from './common'

export interface Organisation {
  readonly organisationUniqueKey: Guid
  readonly name: string
  readonly [key: string]: unknown
}
