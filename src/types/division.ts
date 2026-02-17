/**
 * Division types for the Squadi Basketball API.
 * Endpoint: GET /livescores/division?competitionKey=
 */

export interface Division {
  readonly id: number
  readonly name: string
  readonly [key: string]: unknown
}
