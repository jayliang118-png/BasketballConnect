'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useFixtures } from '@/hooks/use-fixtures'
import { RoundAccordion } from './RoundAccordion'
import { MatchCard } from './MatchCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { Match, Round } from '@/types/fixture'

export interface GroupedRound {
  readonly name: string
  readonly matches: readonly Match[]
}

export function groupRoundsByName(rounds: readonly Round[]): readonly GroupedRound[] {
  const grouped = new Map<string, Match[]>()
  const order: string[] = []

  for (const round of rounds) {
    const name = round.name ?? 'Unknown Round'
    const matches = (round.matches ?? []) as readonly Match[]

    const existing = grouped.get(name)
    if (existing) {
      existing.push(...matches)
    } else {
      grouped.set(name, [...matches])
      order.push(name)
    }
  }

  return order.map((name) => ({
    name,
    matches: grouped.get(name) ?? [],
  }))
}

interface FixtureListProps {
  readonly competitionId: number
  readonly divisionId: number
  readonly compKey?: string
  readonly onMatchClick?: (match: Match) => void
}

export function FixtureList({ competitionId, divisionId, compKey, onMatchClick }: FixtureListProps) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useFixtures(
    competitionId,
    divisionId,
  )

  const handleMatchClick = useCallback(
    (match: Match) => {
      if (onMatchClick) {
        onMatchClick(match)
        return
      }
      if (!match.id) return
      const params = new URLSearchParams()
      if (compKey) params.set('compKey', compKey)
      if (competitionId) params.set('compId', String(competitionId))
      router.push(`/games/${match.id}?${params.toString()}`)
    },
    [onMatchClick, compKey, competitionId, router],
  )

  const groupedRounds = useMemo(
    () => (data && Array.isArray(data) ? [...groupRoundsByName(data)].reverse() : []),
    [data],
  )

  const defaultOpenIndex = useMemo(() => {
    const idx = groupedRounds.findIndex((round) =>
      round.matches.some((m) =>
        (m.team1Score > 0 || m.team2Score > 0) ||
        m.matchStatus === 'Ended' || m.matchStatus === 'Final',
      ),
    )
    return idx >= 0 ? idx : 0
  }, [groupedRounds])

  if (isLoading) return <LoadingSpinner message="Loading fixtures..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (groupedRounds.length === 0) return <EmptyState message="No fixtures found" />

  return (
    <div className="space-y-3">
      {groupedRounds.map((round, index) => (
        <RoundAccordion
          key={round.name}
          roundName={round.name}
          matchCount={round.matches.length}
          defaultOpen={index === defaultOpenIndex}
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
      ))}
    </div>
  )
}
