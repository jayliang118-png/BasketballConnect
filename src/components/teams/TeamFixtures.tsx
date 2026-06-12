'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFixtures } from '@/hooks/use-fixtures'
import { groupRoundsByName, type GroupedRound } from '@/components/fixtures/FixtureList'
import { RoundAccordion } from '@/components/fixtures/RoundAccordion'
import { MatchCard } from '@/components/fixtures/MatchCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { Match, Round } from '@/types/fixture'

function filterRoundsByTeamName(rounds: readonly Round[], teamName: string): readonly Round[] {
  const lower = teamName.toLowerCase()
  return rounds
    .map((round) => ({
      ...round,
      matches: round.matches.filter(
        (match) =>
          match.team1?.name?.toLowerCase().includes(lower) ||
          match.team2?.name?.toLowerCase().includes(lower)
      ),
    }))
    .filter((round) => round.matches.length > 0)
}

function findNextRoundIndex(rounds: readonly GroupedRound[]): number {
  const now = Date.now()
  for (let i = 0; i < rounds.length; i++) {
    const hasUpcoming = rounds[i].matches.some((m) => {
      if (!m.startTime) return false
      return new Date(m.startTime).getTime() > now
    })
    if (hasUpcoming) return i
  }
  return -1
}

function findLiveRoundIndex(rounds: readonly GroupedRound[]): number {
  for (let i = 0; i < rounds.length; i++) {
    const hasLive = rounds[i].matches.some((m) => m.matchStatus === 'LIVE')
    if (hasLive) return i
  }
  return -1
}

function formatNextMatchDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface TeamFixturesProps {
  readonly competitionId: number
  readonly divisionId: number
  readonly teamId: number | null
  readonly teamName: string
  readonly teamKey: string
  readonly orgKey: string
  readonly compKey: string
}

export function TeamFixtures({
  competitionId,
  divisionId,
  teamId,
  teamName,
  teamKey,
  orgKey,
  compKey,
}: TeamFixturesProps) {
  const router = useRouter()
  const roundRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Memoize array parameters to prevent infinite re-fetching
  const teamIdsFilter = useMemo(() => (teamId ? [teamId] : undefined), [teamId])
  const ignoreStatusesFilter = useMemo(() => [1], [])

  // Start without polling; enable 5s polling only when a match is LIVE
  const [pollingInterval, setPollingInterval] = useState<number | null>(null)

  const { data, isLoading, error, refetch } = useFixtures(
    competitionId,
    divisionId,
    {
      pollingInterval,
      teamIds: teamIdsFilter,
      ignoreStatuses: ignoreStatusesFilter,
    },
  )

  // Watch fetched data for live games and toggle polling accordingly
  useEffect(() => {
    if (!data || !Array.isArray(data)) return
    const hasLive = data.some((round: Round) =>
      round.matches.some((m: Match) => m.matchStatus === 'LIVE'),
    )
    setPollingInterval(hasLive ? 5000 : null)
  }, [data])

  const groupedRounds = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    // API already filtered by teamId, but fallback to client-side filter if needed
    const filtered = teamId ? data : filterRoundsByTeamName(data, teamName)
    return groupRoundsByName(filtered)
  }, [data, teamId, teamName])

  // Check for live games first, then fall back to next round
  const liveRoundIndex = useMemo(() => findLiveRoundIndex(groupedRounds), [groupedRounds])
  const nextRoundIndex = useMemo(() => findNextRoundIndex(groupedRounds), [groupedRounds])

  // Show live round if available, otherwise show next round
  const displayRoundIndex = liveRoundIndex >= 0 ? liveRoundIndex : nextRoundIndex
  const isShowingLive = liveRoundIndex >= 0

  const displayMatch = useMemo(() => {
    if (displayRoundIndex < 0) return null
    const now = Date.now()
    const roundMatches = groupedRounds[displayRoundIndex].matches

    if (isShowingLive) {
      // For live round, show first live game
      return roundMatches.find((m) => m.matchStatus === 'LIVE') ?? roundMatches[0] ?? null
    } else {
      // For next round, show first upcoming game
      const upcoming = roundMatches
        .filter((m) => m.startTime && new Date(m.startTime).getTime() > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      return upcoming[0] ?? null
    }
  }, [groupedRounds, displayRoundIndex, isShowingLive])

  const handleScrollToRound = useCallback(() => {
    if (displayRoundIndex < 0) return
    const el = roundRefs.current.get(displayRoundIndex)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [displayRoundIndex])

  useEffect(() => {
    if (displayRoundIndex < 0) return
    const timeout = setTimeout(() => {
      const el = roundRefs.current.get(displayRoundIndex)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => clearTimeout(timeout)
  }, [displayRoundIndex])

  const handleMatchClick = useCallback(
    (match: Match) => {
      if (!match.id) return
      // Navigate to nested route for full breadcrumb path
      if (orgKey && compKey && divisionId && teamKey) {
        router.push(`/orgs/${orgKey}/competitions/${compKey}/divisions/${divisionId}/teams/${teamKey}/games/${match.id}`)
      }
    },
    [router, orgKey, compKey, divisionId, teamKey],
  )

  const setRoundRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      roundRefs.current.set(index, el)
    } else {
      roundRefs.current.delete(index)
    }
  }, [])

  if (isLoading) return <LoadingSpinner message="Loading fixtures..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (groupedRounds.length === 0) return <EmptyState message="No fixtures found for this team" />

  return (
    <div className="space-y-3">
      {displayRoundIndex >= 0 && displayMatch && (
        <button
          onClick={handleScrollToRound}
          type="button"
          className={`w-full card-basketball p-4 flex items-center gap-3 border transition-colors text-left ${
            isShowingLive
              ? 'border-stat-red/30 bg-stat-red/5 hover:bg-stat-red/10'
              : 'border-hoop-orange/30 bg-hoop-orange/5 hover:bg-hoop-orange/10'
          }`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isShowingLive ? 'bg-stat-red/20' : 'bg-hoop-orange/20'
          }`}>
            {isShowingLive ? (
              <span className="w-3 h-3 bg-stat-red rounded-full animate-pulse" />
            ) : (
              <svg className="w-4 h-4 text-hoop-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide ${
              isShowingLive ? 'text-stat-red' : 'text-hoop-orange'
            }`}>
              {isShowingLive ? 'Live Game' : 'Next Game'}
            </p>
            <p className="text-sm text-gray-200 mt-0.5">
              {groupedRounds[displayRoundIndex].name}
              {displayMatch.startTime && (
                <span className="text-gray-400"> &mdash; {formatNextMatchDate(displayMatch.startTime)}</span>
              )}
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {groupedRounds.map((round, index) => (
        <div key={round.name} ref={(el) => setRoundRef(index, el)}>
          <RoundAccordion
            roundName={round.name}
            matchCount={round.matches.length}
            defaultOpen={index === displayRoundIndex || (displayRoundIndex < 0 && index === groupedRounds.length - 1)}
          >
            {round.matches.map((match, mIdx) => (
              <MatchCard
                key={match.id ?? mIdx}
                matchId={match.id}
                team1={{
                  teamName: match.team1?.name,
                  score: match.team1Score,
                  logoUrl: match.team1?.logoUrl,
                }}
                team2={{
                  teamName: match.team2?.name,
                  score: match.team2Score,
                  logoUrl: match.team2?.logoUrl,
                }}
                startTime={match.startTime}
                venueName={match.venueCourt?.venue?.name}
                venueCourtName={match.venueCourt?.name}
                venueLat={match.venueCourt?.venue?.lat}
                venueLng={match.venueCourt?.venue?.lng}
                matchStatus={match.matchStatus}
                onClick={() => handleMatchClick(match)}
              />
            ))}
          </RoundAccordion>
        </div>
      ))}
    </div>
  )
}
