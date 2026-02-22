/**
 * Ladder/standings types for team rankings.
 */

export interface LadderAdjustment {
  readonly teamName: string
  readonly description: string
}

export interface LadderEntry {
  readonly rank: number
  readonly teamId: number
  readonly teamName: string
  readonly teamUniqueKey: string | null
  readonly hasAdjustments: boolean
  readonly played: number
  readonly wins: number
  readonly losses: number
  readonly draws: number
  readonly byes: number
  readonly forfeitWins: number
  readonly forfeitLosses: number
  readonly pointsFor: number
  readonly pointsAgainst: number
  readonly competitionPoints: number
  readonly winPercentage: number
  readonly goalDifference: number
}
