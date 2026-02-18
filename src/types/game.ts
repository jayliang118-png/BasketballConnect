/**
 * Game types for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/matches/public/gameSummary?matchId=&competitionUniqueKey=
 *   GET /livescores/web/matches/public/actionLog?matchId=&competitionId=
 *   GET /livescores/matches/public/events?matchId=
 */

import type { Guid } from './common'

// ---------------------------------------------------------------------------
// gameSummary
// ---------------------------------------------------------------------------

export interface GameSummaryPlayer {
  readonly teamId: number
  readonly shirt: string
  readonly photoUrl: string | null
  readonly firstName: string
  readonly lastName: string
  readonly x: number | null
  readonly y: number | null
  readonly substitutionMinute: number | null
  readonly goals: readonly unknown[]
  readonly cards: readonly unknown[]
}

export interface GameSummaryTeamInfo {
  readonly id: number
  readonly name: string
  readonly teamUniqueKey: Guid
  readonly logoUrl: string | null
}

export interface GameSummaryMatchData {
  readonly team1Score: number
  readonly team2Score: number
  readonly hasPenalty: boolean
  readonly team1PenaltyScore: number | null
  readonly team2PenaltyScore: number | null
  readonly startTime: string
  readonly competitionName: string
  readonly venueName: string | null
  readonly venueCourtName: string | null
  readonly matchStatus: string
  readonly substitutionEnabled: boolean
}

export interface GameSummary {
  readonly playing: readonly GameSummaryPlayer[]
  readonly substitutions: readonly unknown[]
  readonly teamOfficials: readonly unknown[]
  readonly teamData: {
    readonly team1: GameSummaryTeamInfo
    readonly team2: GameSummaryTeamInfo
  }
  readonly matchData: GameSummaryMatchData
  readonly attendanceAvailable: boolean
}

// ---------------------------------------------------------------------------
// actionLog
// ---------------------------------------------------------------------------

export interface ActionLogTeam {
  readonly id: number
  readonly name: string
  readonly logoUrl: string | null
  readonly team1Score?: number
  readonly team2Score?: number
}

export interface ActionLogMatch {
  readonly startTime: string
  readonly type: string
  readonly id: number
  readonly team1Score: number
  readonly team2Score: number
  readonly hasPenalty: number
  readonly team1PenaltyScore: number | null
  readonly team2PenaltyScore: number | null
  readonly team1: ActionLogTeam
  readonly team2: ActionLogTeam
}

export interface ActionLogResponse {
  readonly name: string
  readonly message: string
  readonly result: readonly ActionLogMatch[]
}

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

export interface GameEventPeriod {
  readonly id: number
  readonly isExtraTime: boolean
  readonly isPenalty: boolean
}

export interface GameEventStat {
  readonly displayName: string
  readonly type: string
}

export interface GameEventPlayer {
  readonly name: string
  readonly shirt: string
  readonly playing: boolean
  readonly position: {
    readonly shortName: string | null
  }
  readonly isInjured: boolean
}

export interface GameEvent {
  readonly timestamp: number
  readonly minute: number
  readonly addedMinute: number
  readonly teamId: number
  readonly period: GameEventPeriod
  readonly type: string
  readonly score: string | null
  readonly stat: GameEventStat
  readonly players: readonly GameEventPlayer[]
}
