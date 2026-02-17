/**
 * Game types for the Squadi Basketball API.
 * Endpoints:
 *   GET /livescores/matches/public/gameSummary?matchId=&competitionUniqueKey=
 *   GET /livescores/web/matches/public/actionLog?matchId=&competitionId=
 *   GET /livescores/matches/public/events?matchId=
 */

import type { Guid } from './common'

export interface GameSummaryPlayer {
  readonly playerId: number
  readonly firstName: string
  readonly lastName: string
  readonly points: number
  readonly fouls: number
  readonly [key: string]: unknown
}

export interface GameSummaryTeam {
  readonly teamId: number
  readonly teamName: string
  readonly score: number
  readonly players: readonly GameSummaryPlayer[]
  readonly [key: string]: unknown
}

export interface GameSummary {
  readonly matchId: number
  readonly competitionUniqueKey: Guid
  readonly team1: GameSummaryTeam
  readonly team2: GameSummaryTeam
  readonly [key: string]: unknown
}

export interface ActionLogEntry {
  readonly id: number
  readonly matchId: number
  readonly period: number
  readonly timestamp: string
  readonly action: string
  readonly playerId?: number | null
  readonly playerName?: string | null
  readonly teamId?: number | null
  readonly teamName?: string | null
  readonly points?: number | null
  readonly [key: string]: unknown
}

export interface GameEvent {
  readonly id: number
  readonly matchId: number
  readonly type: string
  readonly period: number
  readonly timestamp: string
  readonly playerId?: number | null
  readonly teamId?: number | null
  readonly [key: string]: unknown
}
