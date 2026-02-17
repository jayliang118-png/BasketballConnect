/**
 * Competition types for the Squadi Basketball API.
 * Endpoint: GET /livescores/competitions/list?organisationUniqueKey=
 */

import type { Guid } from './common'

export interface Competition {
  readonly id: number
  readonly uniqueKey: Guid
  readonly name: string
  readonly [key: string]: unknown
}
