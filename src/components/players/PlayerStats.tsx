'use client'

import { useApiData } from '@/hooks/use-api-data'
import { useMemo } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

interface PlayerStatsProps {
  readonly userId: number
  readonly competitions: readonly PlayerCompetition[]
}

interface PlayerCompetition {
  readonly competitionId: number
  readonly competitionUniqueKey: string
  readonly longName: string
  readonly isPublicStats: number
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
  readonly team1Name: string
  readonly team2Name: string
  readonly team1LogoUrl: string | null
  readonly team2LogoUrl: string | null
  readonly totalPts: number
  readonly twoPMade: number
  readonly threePMade: number
  readonly ftMade: number
  readonly pf: number
  readonly tf: number
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
        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return null
}

export function PlayerStats({ userId, competitions }: PlayerStatsProps) {
  // Fetch CAREER stats across all competitions (no specific competition filter)
  const careerFetcher = useMemo(
    () => async () => {
      const { fetchUserScoringSummary } = await import('@/services/stats.service')
      // Use empty string to get all competitions
      const data = await fetchUserScoringSummary(userId, 'CAREER', '')
      return data
    },
    [userId],
  )

  const { data: careerData, isLoading: careerLoading, error: careerError, refetch: careerRefetch } =
    useApiData(careerFetcher, [userId])

  // Fetch MATCH stats across all competitions (empty key = all)
  const matchFetcher = useMemo(
    () => async () => {
      const { fetchUserScoringSummary } = await import('@/services/stats.service')
      return fetchUserScoringSummary(userId, 'MATCH', '')
    },
    [userId],
  )

  const { data: matchData, isLoading: matchLoading, error: matchError, refetch: matchRefetch } =
    useApiData(matchFetcher, [userId])

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

  // Parse match log
  const matchLog = useMemo<readonly MatchLogRow[]>(() => {
    if (!matchData) return []
    const items = Array.isArray(matchData) ? matchData : []
    return items.map((row: Record<string, unknown>) => ({
      matchId: parseNum(row.matchId),
      team1Name: String(row.team1Name ?? ''),
      team2Name: String(row.team2Name ?? ''),
      team1LogoUrl: (row.team1LogoUrl as string | null) ?? null,
      team2LogoUrl: (row.team2LogoUrl as string | null) ?? null,
      totalPts: parseNum(row.totalPts),
      twoPMade: parseNum(row['2PMade']),
      threePMade: parseNum(row['3PMade']),
      ftMade: parseNum(row.FTMade),
      pf: parseNum(row.PF),
      tf: parseNum(row.TF),
    }))
  }, [matchData])

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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-court-dark text-gray-400 text-xs uppercase">
                      <th className="text-left px-4 py-3">Home Team</th>
                      <th className="text-left px-4 py-3">Away Team</th>
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
                      <tr
                        key={row.matchId || idx}
                        className="border-b border-court-border/50 hover:bg-court-elevated/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TeamLogo url={row.team1LogoUrl} name={row.team1Name} />
                            <span className="text-gray-200 truncate max-w-[160px]">{row.team1Name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TeamLogo url={row.team2LogoUrl} name={row.team2Name} />
                            <span className="text-gray-200 truncate max-w-[160px]">{row.team2Name}</span>
                          </div>
                        </td>
                        <td className="text-center px-3 py-3 text-hoop-orange font-mono font-semibold">{row.totalPts}</td>
                        <td className="text-center px-3 py-3 text-gray-300">{row.twoPMade}</td>
                        <td className="text-center px-3 py-3 text-gray-300">{row.threePMade}</td>
                        <td className="text-center px-3 py-3 text-gray-300">{row.ftMade}</td>
                        <td className="text-center px-3 py-3 text-gray-300">{row.pf}</td>
                        <td className="text-center px-3 py-3 text-gray-300">{row.tf}</td>
                      </tr>
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
