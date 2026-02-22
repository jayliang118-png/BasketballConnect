/**
 * Computes team ladder/standings from match round data.
 * Pure function — no side effects, fully immutable output.
 */

import type { Round } from '@/types/fixture'
import type { LadderEntry } from '@/types/ladder'

/** Result IDs returned by the Squadi API */
const RESULT_WIN = 1
const RESULT_LOSS = 2
const RESULT_DRAW = 3

/** Competition points awarded per result */
const PTS_WIN = 4
const PTS_DRAW = 2
const PTS_LOSS = 0
const PTS_BYE = 4
const PTS_FORFEIT_WIN = 4
const PTS_FORFEIT_LOSS = 0

interface MutableTeamStats {
  teamId: number
  teamName: string
  teamUniqueKey: string | null
  played: number
  wins: number
  losses: number
  draws: number
  byes: number
  forfeitWins: number
  forfeitLosses: number
  pointsFor: number
  pointsAgainst: number
}

function isForfeit(matchStatus: unknown): boolean {
  if (typeof matchStatus !== 'string') return false
  const lower = matchStatus.toLowerCase()
  return lower.includes('forfeit') || lower === 'ff'
}

function getOrCreateTeam(
  teams: Map<number, MutableTeamStats>,
  teamId: number,
  teamName: string,
  teamUniqueKey: string | null,
): MutableTeamStats {
  const existing = teams.get(teamId)
  if (existing) return existing
  const entry: MutableTeamStats = {
    teamId,
    teamName,
    teamUniqueKey,
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    byes: 0,
    forfeitWins: 0,
    forfeitLosses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  }
  teams.set(teamId, entry)
  return entry
}

export function computeLadder(
  rounds: readonly Round[],
  divisionId: number,
): readonly LadderEntry[] {
  const teams = new Map<number, MutableTeamStats>()

  for (const round of rounds) {
    for (const match of round.matches) {
      const raw = match as Record<string, unknown>

      // Filter: only this division
      if (raw.divisionId !== undefined && Number(raw.divisionId) !== divisionId) {
        continue
      }

      // Filter: exclude finals and ladder-excluded matches
      if (raw.isFinals === true || raw.isFinals === 1) continue
      if (raw.excludeFromLadder === true || raw.excludeFromLadder === 1) continue

      const team1 = match.team1
      const team2 = match.team2
      if (!team1 || !team2) continue

      const team1ResultId = Number(raw.team1ResultId)
      const team2ResultId = Number(raw.team2ResultId)

      // Skip matches with no result yet
      if (isNaN(team1ResultId) || isNaN(team2ResultId)) continue
      if (team1ResultId === 0 && team2ResultId === 0) continue

      const t1 = getOrCreateTeam(teams, team1.id, team1.name, team1.teamUniqueKey)
      const t2 = getOrCreateTeam(teams, team2.id, team2.name, team2.teamUniqueKey)

      const score1 = Number(match.team1Score) || 0
      const score2 = Number(match.team2Score) || 0

      const forfeit = isForfeit(raw.matchStatus)

      // Accumulate scores
      t1.pointsFor += score1
      t1.pointsAgainst += score2
      t2.pointsFor += score2
      t2.pointsAgainst += score1

      // Accumulate results
      t1.played += 1
      t2.played += 1

      if (forfeit) {
        if (team1ResultId === RESULT_WIN) {
          t1.forfeitWins += 1
          t2.forfeitLosses += 1
        } else if (team2ResultId === RESULT_WIN) {
          t2.forfeitWins += 1
          t1.forfeitLosses += 1
        }
      } else if (team1ResultId === RESULT_WIN && team2ResultId === RESULT_LOSS) {
        t1.wins += 1
        t2.losses += 1
      } else if (team1ResultId === RESULT_LOSS && team2ResultId === RESULT_WIN) {
        t2.wins += 1
        t1.losses += 1
      } else if (team1ResultId === RESULT_DRAW && team2ResultId === RESULT_DRAW) {
        t1.draws += 1
        t2.draws += 1
      }
    }
  }

  // Build sorted entries
  const entries: LadderEntry[] = Array.from(teams.values()).map((t) => {
    const competitionPoints =
      t.wins * PTS_WIN +
      t.losses * PTS_LOSS +
      t.draws * PTS_DRAW +
      t.byes * PTS_BYE +
      t.forfeitWins * PTS_FORFEIT_WIN +
      t.forfeitLosses * PTS_FORFEIT_LOSS

    const winPercentage = t.played > 0 ? (t.wins + t.forfeitWins) / t.played : 0
    const goalDifference = t.pointsFor - t.pointsAgainst

    return {
      rank: 0,
      teamId: t.teamId,
      teamName: t.teamName,
      teamUniqueKey: t.teamUniqueKey,
      hasAdjustments: false,
      played: t.played,
      wins: t.wins,
      losses: t.losses,
      draws: t.draws,
      byes: t.byes,
      forfeitWins: t.forfeitWins,
      forfeitLosses: t.forfeitLosses,
      pointsFor: t.pointsFor,
      pointsAgainst: t.pointsAgainst,
      competitionPoints,
      winPercentage,
      goalDifference,
    }
  })

  // Sort: PTS desc → W% desc → GD desc
  entries.sort((a, b) => {
    if (b.competitionPoints !== a.competitionPoints) return b.competitionPoints - a.competitionPoints
    if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage
    return b.goalDifference - a.goalDifference
  })

  // Assign ranks with tie handling
  const ranked: LadderEntry[] = []
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const prev = i > 0 ? ranked[i - 1] : null
    const isTied =
      prev !== null &&
      prev.competitionPoints === entry.competitionPoints &&
      prev.winPercentage === entry.winPercentage &&
      prev.goalDifference === entry.goalDifference

    ranked.push({
      ...entry,
      rank: isTied && prev ? prev.rank : i + 1,
    })
  }

  return ranked
}
