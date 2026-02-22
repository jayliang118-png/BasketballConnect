'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
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
  readonly teamName: string
  readonly teamKey: string
  readonly orgKey: string
  readonly compKey: string
}

export function TeamFixtures({
  competitionId,
  divisionId,
  teamName,
  teamKey,
  orgKey,
  compKey,
}: TeamFixturesProps) {
  const router = useRouter()
  const roundRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const { data, isLoading, error, refetch } = useFixtures(
    competitionId,
    divisionId,
  )

  const groupedRounds = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    if (teamName) {
      return groupRoundsByName(filterRoundsByTeamName(data, teamName))
    }
    return []
  }, [data, teamName])

  const nextRoundIndex = useMemo(() => findNextRoundIndex(groupedRounds), [groupedRounds])

  const nextMatch = useMemo(() => {
    if (nextRoundIndex < 0) return null
    const now = Date.now()
    const upcoming = groupedRounds[nextRoundIndex].matches
      .filter((m) => m.startTime && new Date(m.startTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    return upcoming[0] ?? null
  }, [groupedRounds, nextRoundIndex])

  const handleScrollToRound = useCallback(() => {
    if (nextRoundIndex < 0) return
    const el = roundRefs.current.get(nextRoundIndex)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [nextRoundIndex])

  useEffect(() => {
    if (nextRoundIndex < 0) return
    const timeout = setTimeout(() => {
      const el = roundRefs.current.get(nextRoundIndex)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => clearTimeout(timeout)
  }, [nextRoundIndex])

  const handleMatchClick = useCallback(
    (match: Match) => {
      if (!match.id) return
      const params = new URLSearchParams()
      if (compKey) params.set('compKey', compKey)
      if (competitionId) params.set('compId', String(competitionId))
      router.push(`/games/${match.id}?${params.toString()}`)
    },
    [router, compKey, competitionId],
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
      {nextRoundIndex >= 0 && nextMatch && (
        <button
          onClick={handleScrollToRound}
          type="button"
          className="w-full card-basketball p-4 flex items-center gap-3 border border-hoop-orange/30 bg-hoop-orange/5 hover:bg-hoop-orange/10 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hoop-orange/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-hoop-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-hoop-orange uppercase tracking-wide">Next Game</p>
            <p className="text-sm text-gray-200 mt-0.5">
              {groupedRounds[nextRoundIndex].name}
              {nextMatch.startTime && (
                <span className="text-gray-400"> &mdash; {formatNextMatchDate(nextMatch.startTime)}</span>
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
            defaultOpen={index === nextRoundIndex || (nextRoundIndex < 0 && index === groupedRounds.length - 1)}
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
