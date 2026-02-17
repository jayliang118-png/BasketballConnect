/**
 * Stats types for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/stats/public/scoringStatsByGrade?statType=&divisionId=&offset=&limit=&sportRefId=2
 *   GET /livescores/stats/v2/summaryScoringByUser?userId=&aggregate=&sportRefId=2&competitionId=
 */

export interface ScoringStatEntry {
  readonly rank: number
  readonly playerId: number
  readonly firstName: string
  readonly lastName: string
  readonly teamName: string
  readonly gamesPlayed: number
  readonly value: number
  readonly [key: string]: unknown
}

export interface UserScoringSummary {
  readonly matchId?: number | null
  readonly competitionId: number
  readonly competitionName: string
  readonly date?: string | null
  readonly points: number
  readonly freeThrows: number
  readonly twoPoints: number
  readonly threePoints: number
  readonly fouls: number
  readonly [key: string]: unknown
}
