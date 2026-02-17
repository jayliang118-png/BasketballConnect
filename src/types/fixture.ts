/**
 * Fixture types for the Squadi Basketball API.
 * Endpoint: GET /livescores/round/matches?competitionId=&divisionId=
 */

import type { Guid } from './common'

export interface MatchTeam {
  readonly id: number
  readonly name: string
  readonly teamUniqueKey: Guid | null
  readonly alias: string | null
  readonly logoUrl: string | null
  readonly [key: string]: unknown
}

export interface VenueCourt {
  readonly name: string
  readonly courtNumber: number
  readonly venue: {
    readonly name: string
    readonly shortName: string
    readonly street1: string
    readonly suburb: string
  }
  readonly [key: string]: unknown
}

export interface Match {
  readonly id: number
  readonly startTime: string
  readonly team1: MatchTeam
  readonly team2: MatchTeam
  readonly team1Score: number
  readonly team2Score: number
  readonly matchStatus: string
  readonly venueCourt: VenueCourt | null
  readonly [key: string]: unknown
}

export interface Round {
  readonly id: number
  readonly name: string
  readonly sequence: number
  readonly matches: readonly Match[]
  readonly [key: string]: unknown
}
