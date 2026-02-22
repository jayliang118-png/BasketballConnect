'use client'

import { useApiData } from '@/hooks/use-api-data'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { GameSummary } from '@/types/game'

interface PlayerCompetition {
  readonly competitionId: number
  readonly competitionUniqueKey: string
  readonly organisationUniqueKey: string
  readonly longName: string
  readonly isPublicStats: number
}

interface PlayerStatsProps {
  readonly userId: number
  readonly playerId?: number | null
  readonly competitions: readonly PlayerCompetition[]
  readonly competitionUniqueKey?: string
}

interface SeasonStatRow {
  readonly competitionName: string
  readonly totalMatches: number
  readonly avgPts: string
  readonly totalPts: number
  readonly twoPMade: number
  readonly threePMade: number
  readonly ftMade: number
}

interface MatchLogRow {
  readonly matchId: number
  readonly startTime: string
  readonly competitionId: number
  readonly competitionIdRaw: string
  readonly competitionUniqueKey: string
  readonly competitionName: string
  readonly divisionId: number
  readonly teamId: number
  readonly team1Name: string
  readonly team2Name: string
  readonly team1LogoUrl: string | null
  readonly team2LogoUrl: string | null
  readonly team1Score: number
  readonly team2Score: number
  readonly venueName: string
  readonly venueCourtName: string
  readonly totalPts: number
  readonly twoPMade: number
  readonly threePMade: number
  readonly ftMade: number
  readonly pf: number
  readonly tf: number
}

function formatMatchDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function parseNum(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val) || 0
  return 0
}

function TeamLogo({ url, name }: { readonly url: string | null; readonly name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-8 h-8 object-contain flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return null
}

function findCompetition(
  row: MatchLogRow,
  competitions: readonly PlayerCompetition[],
): PlayerCompetition | undefined {
  // 1. Match by competitionId (numeric)
  if (row.competitionId > 0) {
    const byId = competitions.find((c) => c.competitionId === row.competitionId)
    if (byId) return byId
  }

  // 2. Match by competitionUniqueKey directly from row
  if (row.competitionUniqueKey) {
    const byKey = competitions.find((c) => c.competitionUniqueKey === row.competitionUniqueKey)
    if (byKey) return byKey
  }

  // 2b. competitionId might be a UUID string - try matching it as a uniqueKey
  if (row.competitionIdRaw && row.competitionIdRaw.includes('-')) {
    const byRawKey = competitions.find((c) => c.competitionUniqueKey === row.competitionIdRaw)
    if (byRawKey) return byRawKey
  }

  // 3. Match by competitionName against longName
  if (row.competitionName) {
    const byName = competitions.find((c) => c.longName === row.competitionName)
    if (byName) return byName
  }

  // 4. If only one competition, use it
  if (competitions.length === 1) return competitions[0]

  return undefined
}

function buildGameUrl(
  row: MatchLogRow,
  competitions: readonly PlayerCompetition[],
  fallbackCompKey?: string,
): string | null {
  if (!row.matchId) return null

  const comp = findCompetition(row, competitions)
  const compKey = row.competitionUniqueKey || comp?.competitionUniqueKey || fallbackCompKey || ''
  const compId = row.competitionId || comp?.competitionId || 0

  const params = new URLSearchParams()
  if (compKey) params.set('compKey', compKey)
  if (compId) params.set('compId', String(compId))

  return `/games/${row.matchId}?${params.toString()}`
}

function useMatchRowData(
  row: MatchLogRow,
  competitions: readonly PlayerCompetition[],
  summary: GameSummary | undefined,
  fallbackCompKey?: string,
) {
  const gameUrl = buildGameUrl(row, competitions, fallbackCompKey)
  const team1Name = summary?.teamData.team1.name || row.team1Name || 'TBD'
  const team2Name = summary?.teamData.team2.name || row.team2Name || 'TBD'
  const team1Logo = summary?.teamData.team1.logoUrl ?? row.team1LogoUrl
  const team2Logo = summary?.teamData.team2.logoUrl ?? row.team2LogoUrl
  const startTime = summary?.matchData.startTime || row.startTime
  const team1Score = summary?.matchData.team1Score ?? row.team1Score
  const team2Score = summary?.matchData.team2Score ?? row.team2Score
  return { gameUrl, team1Name, team2Name, team1Logo, team2Logo, startTime, team1Score, team2Score }
}

function ScoreBadge({ team1Score, team2Score, gameUrl }: {
  readonly team1Score: number
  readonly team2Score: number
  readonly gameUrl: string | null
}) {
  const badge = (
    <div className="bg-hoop-orange rounded px-2 py-0.5 inline-block">
      <span className="font-mono font-bold text-xs text-white">{team1Score} : {team2Score}</span>
    </div>
  )
  if (gameUrl) {
    return <Link href={gameUrl} className="hover:scale-105 transition-transform inline-block">{badge}</Link>
  }
  return badge
}

/** Desktop table row (hidden on mobile) */
function MatchLogDesktopRow({
  row,
  competitions,
  summary,
  fallbackCompKey,
}: {
  readonly row: MatchLogRow
  readonly competitions: readonly PlayerCompetition[]
  readonly summary: GameSummary | undefined
  readonly fallbackCompKey?: string
}) {
  const d = useMatchRowData(row, competitions, summary, fallbackCompKey)

  return (
    <tr className="border-b border-court-border/50 hover:bg-court-elevated/50">
      <td className="px-4 py-3">
        <div className="text-xs text-gray-500 text-center mb-1">
          {d.startTime ? formatMatchDate(d.startTime) : ''}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-sm text-gray-200 whitespace-nowrap">{d.team1Name}</span>
            <TeamLogo url={d.team1Logo} name={d.team1Name} />
          </div>
          <div>
            <ScoreBadge team1Score={d.team1Score} team2Score={d.team2Score} gameUrl={d.gameUrl} />
          </div>
          <div className="flex items-center gap-1.5">
            <TeamLogo url={d.team2Logo} name={d.team2Name} />
            <span className="text-sm text-gray-200 whitespace-nowrap">{d.team2Name}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-center text-hoop-orange font-mono font-semibold">{row.totalPts}</td>
      <td className="px-3 py-3 text-center text-gray-300">{row.twoPMade}</td>
      <td className="px-3 py-3 text-center text-gray-300">{row.threePMade}</td>
      <td className="px-3 py-3 text-center text-gray-300">{row.ftMade}</td>
      <td className="px-3 py-3 text-center text-gray-300">{row.pf}</td>
      <td className="px-3 py-3 text-center text-gray-300">{row.tf}</td>
    </tr>
  )
}

/** Mobile card (hidden on desktop) */
function MatchLogMobileCard({
  row,
  competitions,
  summary,
  fallbackCompKey,
}: {
  readonly row: MatchLogRow
  readonly competitions: readonly PlayerCompetition[]
  readonly summary: GameSummary | undefined
  readonly fallbackCompKey?: string
}) {
  const d = useMatchRowData(row, competitions, summary, fallbackCompKey)

  return (
    <div className="border-b border-court-border/50 px-4 py-3 space-y-2">
      {/* Date */}
      <div className="text-xs text-gray-500">
        {d.startTime ? formatMatchDate(d.startTime) : ''}
      </div>
      {/* Teams + Score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-1.5 justify-end min-w-0">
          <span className="text-sm text-gray-200 truncate">{d.team1Name}</span>
          <TeamLogo url={d.team1Logo} name={d.team1Name} />
        </div>
        <ScoreBadge team1Score={d.team1Score} team2Score={d.team2Score} gameUrl={d.gameUrl} />
        <div className="flex items-center gap-1.5 min-w-0">
          <TeamLogo url={d.team2Logo} name={d.team2Name} />
          <span className="text-sm text-gray-200 truncate">{d.team2Name}</span>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-6 text-center text-xs">
        <div>
          <div className="text-gray-500 uppercase">PTS</div>
          <div className="text-hoop-orange font-mono font-semibold">{row.totalPts}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase">2P</div>
          <div className="text-gray-300">{row.twoPMade}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase">3P</div>
          <div className="text-gray-300">{row.threePMade}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase">FTM</div>
          <div className="text-gray-300">{row.ftMade}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase">PF</div>
          <div className="text-gray-300">{row.pf}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase">TF</div>
          <div className="text-gray-300">{row.tf}</div>
        </div>
      </div>
    </div>
  )
}

export function PlayerStats({ userId, playerId, competitions, competitionUniqueKey }: PlayerStatsProps) {
  // Use the competition key from the referring game context, or fall back to first competition
  const compKey = competitionUniqueKey || competitions[0]?.competitionUniqueKey || ''

  // Fetch CAREER stats
  const careerFetcher = useMemo(
    () => async () => {
      const { fetchUserScoringSummary } = await import('@/services/stats.service')
      return fetchUserScoringSummary(userId, 'CAREER', compKey, playerId)
    },
    [userId, playerId, compKey],
  )

  const { data: careerData, isLoading: careerLoading, error: careerError, refetch: careerRefetch } =
    useApiData(careerFetcher, [userId, playerId, compKey])

  // Fetch MATCH stats
  const matchFetcher = useMemo(
    () => async () => {
      const { fetchUserScoringSummary } = await import('@/services/stats.service')
      return fetchUserScoringSummary(userId, 'MATCH', compKey, playerId)
    },
    [userId, playerId, compKey],
  )

  const { data: matchData, isLoading: matchLoading, error: matchError, refetch: matchRefetch } =
    useApiData(matchFetcher, [userId, playerId, compKey])

  // Parse season stats
  const seasonStats = useMemo<readonly SeasonStatRow[]>(() => {
    if (!careerData) return []
    const items = Array.isArray(careerData) ? careerData : []
    return items.map((row: Record<string, unknown>) => ({
      competitionName: String(row.competitionName ?? ''),
      totalMatches: parseNum(row.totalMatches),
      avgPts: Number(parseNum(row.avgPts)).toFixed(1),
      totalPts: parseNum(row.totalPts),
      twoPMade: parseNum(row['2PMade']),
      threePMade: parseNum(row['3PMade']),
      ftMade: parseNum(row.FTMade),
    }))
  }, [careerData])

  // Parse match log and sort by most recent first
  const matchLog = useMemo<readonly MatchLogRow[]>(() => {
    if (!matchData) return []
    const items = Array.isArray(matchData) ? matchData : []

    const rows = items.map((row: Record<string, unknown>) => ({
      matchId: parseNum(row.matchId),
      startTime: String(row.startTime ?? ''),
      competitionId: parseNum(row.competitionId),
      competitionIdRaw: String(row.competitionId ?? ''),
      competitionUniqueKey: String(row.competitionUniqueKey ?? row.competitionOrganisationUniqueKey ?? ''),
      competitionName: String(row.competitionName ?? ''),
      divisionId: parseNum(row.divisionId),
      teamId: parseNum(row.teamId),
      team1Name: String(row.team1Name ?? ''),
      team2Name: String(row.team2Name ?? ''),
      team1LogoUrl: (row.team1LogoUrl as string | null) ?? null,
      team2LogoUrl: (row.team2LogoUrl as string | null) ?? null,
      team1Score: parseNum(row.team1Score),
      team2Score: parseNum(row.team2Score),
      venueName: String(row.venueName ?? ''),
      venueCourtName: String(row.venueCourtName ?? ''),
      totalPts: parseNum(row.totalPts),
      twoPMade: parseNum(row['2PMade']),
      threePMade: parseNum(row['3PMade']),
      ftMade: parseNum(row.FTMade),
      pf: parseNum(row.PF),
      tf: parseNum(row.TF),
    }))
    return [...rows].sort((a, b) => {
      // Prefer startTime; fall back to matchId (higher = more recent)
      const ta = a.startTime ? new Date(a.startTime).getTime() : 0
      const tb = b.startTime ? new Date(b.startTime).getTime() : 0
      if (ta !== tb) return tb - ta
      return b.matchId - a.matchId
    })
  }, [matchData])

  // Enrich match log with gameSummary data (scores, team names, venue, etc.)
  const [gameSummaries, setGameSummaries] = useState<ReadonlyMap<number, GameSummary>>(new Map())

  useEffect(() => {
    if (matchLog.length === 0) return

    let cancelled = false

    async function enrichMatches() {
      const { fetchGameSummary } = await import('@/services/game.service')

      const results = await Promise.allSettled(
        matchLog
          .filter((row) => row.matchId > 0)
          .map(async (row) => {
            const comp = findCompetition(row, competitions)
            const resolvedCompKey = row.competitionUniqueKey || comp?.competitionUniqueKey || compKey
            if (!resolvedCompKey) return null

            const summary = await fetchGameSummary(row.matchId, resolvedCompKey)
            return { matchId: row.matchId, summary: summary as GameSummary }
          }),
      )

      if (cancelled) return

      const map = new Map<number, GameSummary>()
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          map.set(result.value.matchId, result.value.summary)
        }
      }
      setGameSummaries(map)
    }

    enrichMatches()

    return () => {
      cancelled = true
    }
  }, [matchLog, competitions, compKey])

  if (careerLoading) return <LoadingSpinner message="Loading stats..." />
  if (careerError) return <ErrorMessage message={careerError} onRetry={careerRefetch} />

  return (
    <div className="space-y-6">
      {/* Season Statistics */}
      {seasonStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Season Statistics</h3>
          <div className="card-basketball overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-court-dark text-gray-400 text-xs uppercase">
                    <th className="text-left px-4 py-3">Competition</th>
                    <th className="text-center px-3 py-3">M</th>
                    <th className="text-center px-3 py-3">AVG PTS</th>
                    <th className="text-center px-3 py-3">PTS</th>
                    <th className="text-center px-3 py-3">2P</th>
                    <th className="text-center px-3 py-3">3P</th>
                    <th className="text-center px-3 py-3">FTM</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonStats.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-court-border/50 ${
                        row.competitionName === 'Career'
                          ? 'bg-court-elevated font-semibold'
                          : 'hover:bg-court-elevated/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-200">{row.competitionName}</td>
                      <td className="text-center px-3 py-3 text-gray-300">{row.totalMatches}</td>
                      <td className="text-center px-3 py-3 text-gray-300">{row.avgPts}</td>
                      <td className="text-center px-3 py-3 text-hoop-orange font-mono font-semibold">{row.totalPts}</td>
                      <td className="text-center px-3 py-3 text-gray-300">{row.twoPMade}</td>
                      <td className="text-center px-3 py-3 text-gray-300">{row.threePMade}</td>
                      <td className="text-center px-3 py-3 text-gray-300">{row.ftMade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Note: Career Statistics may include competitions hidden from public display
          </p>
        </div>
      )}

      {seasonStats.length === 0 && (
        <EmptyState message="No season stats available" />
      )}

      {/* Match Log */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Match Log</h3>
        {matchLoading ? (
          <LoadingSpinner message="Loading match log..." />
        ) : matchError ? (
          <ErrorMessage message={matchError} onRetry={matchRefetch} />
        ) : matchLog.length === 0 ? (
          <EmptyState message="No match log available" />
        ) : (
          <div className="card-basketball overflow-hidden">
            {/* Mobile: stacked cards */}
            <div className="md:hidden">
              {matchLog.map((row, idx) => (
                <MatchLogMobileCard
                  key={row.matchId || idx}
                  row={row}
                  competitions={competitions}
                  summary={gameSummaries.get(row.matchId)}
                  fallbackCompKey={compKey}
                />
              ))}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-court-dark text-gray-400 text-xs uppercase">
                    <th className="text-center px-4 py-3">Match</th>
                    <th className="text-center px-3 py-3">PTS</th>
                    <th className="text-center px-3 py-3">2P</th>
                    <th className="text-center px-3 py-3">3P</th>
                    <th className="text-center px-3 py-3">FTM</th>
                    <th className="text-center px-3 py-3">PF</th>
                    <th className="text-center px-3 py-3">TF</th>
                  </tr>
                </thead>
                <tbody>
                  {matchLog.map((row, idx) => (
                    <MatchLogDesktopRow
                      key={row.matchId || idx}
                      row={row}
                      competitions={competitions}
                      summary={gameSummaries.get(row.matchId)}
                      fallbackCompKey={compKey}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stats Legend */}
      <div className="card-basketball p-4 max-w-xs">
        <dl className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1 text-sm text-gray-400">
          <dt className="font-mono font-semibold">M</dt><dd>=</dd><dd>Matches Played</dd>
          <dt className="font-mono font-semibold">PTS</dt><dd>=</dd><dd>Points</dd>
          <dt className="font-mono font-semibold">2P</dt><dd>=</dd><dd>2 Points Shots Made</dd>
          <dt className="font-mono font-semibold">3P</dt><dd>=</dd><dd>3 Points Shots Made</dd>
          <dt className="font-mono font-semibold">FT</dt><dd>=</dd><dd>Free Throws Made</dd>
          <dt className="font-mono font-semibold">PF</dt><dd>=</dd><dd>Personal Fouls</dd>
          <dt className="font-mono font-semibold">TF</dt><dd>=</dd><dd>Technical Fouls</dd>
        </dl>
      </div>
    </div>
  )
}
