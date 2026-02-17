/**
 * Team types for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/public/teams/list?competitionId=&divisionId=&organisationId=
 *   GET /competition/participantGrading/teamViewPublic/team?teamUniqueKey=
 */

import type { Guid } from './common'

export interface Team {
  readonly teamUniqueKey: Guid
  readonly name: string
  readonly [key: string]: unknown
}

export interface TeamPlayer {
  readonly playerId: number
  readonly firstName: string
  readonly lastName: string
  readonly [key: string]: unknown
}

export interface TeamDetail {
  readonly teamUniqueKey: Guid
  readonly name: string
  readonly players: readonly TeamPlayer[]
  readonly [key: string]: unknown
}
