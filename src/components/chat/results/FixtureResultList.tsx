// ---------------------------------------------------------------------------
// FixtureResultList - Clickable fixture/match list inline in chat messages
// ---------------------------------------------------------------------------

'use client'

import type { ChatNavigateHandler } from './ChatResultRenderer'

interface MatchTeam {
  readonly name?: string
  readonly teamName?: string
  readonly score?: number
}

interface MatchItem {
  readonly id?: number
  readonly matchId?: number
  readonly matchUniqueKey?: string
  readonly team1?: MatchTeam
  readonly team2?: MatchTeam
  readonly team1Score?: number
  readonly team2Score?: number
  readonly startTime?: string
  readonly venueName?: string
  readonly venueCourt?: { readonly venue?: { readonly name?: string } }
  readonly matchStatus?: string
  readonly competitionUniqueKey?: string
}

interface FixtureResultListProps extends ChatNavigateHandler {
  readonly data: unknown
}

function isMatchItem(item: unknown): item is MatchItem {
  return typeof item === 'object' && item !== null
}

function getMatchId(match: MatchItem): number | null {
  if (typeof match.id === 'number') return match.id
  if (typeof match.matchId === 'number') return match.matchId
  return null
}

function getTeamName(team: MatchTeam | undefined): string {
  return team?.name ?? team?.teamName ?? 'TBD'
}

function getTeamScore(match: MatchItem, side: 'team1' | 'team2'): number | undefined {
  const topLevelScore = side === 'team1' ? match.team1Score : match.team2Score
  if (topLevelScore !== undefined) return topLevelScore
  return match[side]?.score
}

function getVenueName(match: MatchItem): string | undefined {
  return match.venueCourt?.venue?.name ?? match.venueName
}

function formatMatchTime(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timeStr
  }
}

export function FixtureResultList({
  data,
  onNavigate,
}: FixtureResultListProps) {
  const items = Array.isArray(data) ? data : [data]

  const allMatches: MatchItem[] = []
  for (const item of items) {
    if (!isMatchItem(item)) continue

    const record = item as Record<string, unknown>
    if (Array.isArray(record.matches)) {
      for (const match of record.matches) {
        if (isMatchItem(match)) {
          allMatches.push(match)
        }
      }
    } else {
      allMatches.push(item)
    }
  }

  const displayMatches = allMatches.slice(0, 8)

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <h4 className="text-xs font-semibold text-hoop-orange mb-2">
        Fixtures ({allMatches.length})
      </h4>
      <div className="space-y-1.5">
        {displayMatches.map((match, index) => {
          const matchId = getMatchId(match)
          const compKey =
            typeof match.competitionUniqueKey === 'string'
              ? match.competitionUniqueKey
              : ''
          const isClickable = matchId !== null
          const team1Name = getTeamName(match.team1)
          const team2Name = getTeamName(match.team2)
          const team1Score = getTeamScore(match, 'team1')
          const team2Score = getTeamScore(match, 'team2')
          const venue = getVenueName(match)

          return (
            <button
              key={index}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (matchId !== null) {
                  const label = `${team1Name} vs ${team2Name}`
                  onNavigate(
                    'gameDetail',
                    {
                      matchId,
                      competitionUniqueKey: compKey,
                    },
                    label,
                  )
                }
              }}
              className="w-full text-left px-2 py-1.5 rounded bg-court-dark/50 hover:bg-court-dark transition-colors disabled:hover:bg-court-dark/50 disabled:cursor-default"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-200 font-medium truncate max-w-[40%]">
                  {team1Name}
                </span>
                <span className="text-hoop-orange font-mono text-[11px] mx-1">
                  {team1Score ?? '-'} : {team2Score ?? '-'}
                </span>
                <span className="text-gray-200 font-medium truncate max-w-[40%] text-right">
                  {team2Name}
                </span>
              </div>
              {match.startTime && (
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {formatMatchTime(match.startTime)}
                  {venue ? ` - ${venue}` : ''}
                  {isClickable && (
                    <span className="text-gray-600 ml-1">&rarr;</span>
                  )}
                </p>
              )}
            </button>
          )
        })}
      </div>
      {allMatches.length > 8 && (
        <p className="text-xs text-gray-500 mt-2">
          ...and {allMatches.length - 8} more matches
        </p>
      )}
    </div>
  )
}
