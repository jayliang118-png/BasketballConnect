/**
 * Player types for the Squadi Basketball API.
 * Endpoint: GET /livescores/users/public/userProfile?playerId=
 */

export interface PlayerTeam {
  readonly teamId: number
  readonly teamName: string
  readonly competitionId: number
  readonly divisionId: number
  readonly [key: string]: unknown
}

export interface Player {
  readonly id: number
  readonly firstName: string
  readonly lastName: string
  readonly photoUrl?: string | null
  readonly teams: readonly PlayerTeam[]
  readonly [key: string]: unknown
}
