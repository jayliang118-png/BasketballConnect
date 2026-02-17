'use client'

import { useCallback, useMemo } from 'react'
import { useFixtures } from '@/hooks/use-fixtures'
import { useNavigation } from '@/hooks/use-navigation'
import { RoundAccordion } from './RoundAccordion'
import { MatchCard } from './MatchCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { Match, Round } from '@/types/fixture'

interface GroupedRound {
  readonly name: string
  readonly matches: readonly Match[]
}

function groupRoundsByName(rounds: readonly Round[]): readonly GroupedRound[] {
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

export function FixtureList() {
  const { state, navigateTo } = useNavigation()
  const competitionId = state.params.competitionId as number | undefined
  const divisionId = state.params.divisionId as number | undefined

  const { data, isLoading, error, refetch } = useFixtures(
    competitionId ?? null,
    divisionId ?? null
  )

  const groupedRounds = useMemo(
    () => (data && Array.isArray(data) ? groupRoundsByName(data) : []),
    [data]
  )

  const handleMatchClick = useCallback(
    (match: Match) => {
      const compUniqueKey = state.params.competitionKey
      const params: Record<string, string | number> = {
        ...state.params,
        matchId: match.id,
      }
      if (compUniqueKey !== undefined) {
        params.competitionUniqueKey = compUniqueKey
      }
      navigateTo('gameDetail', params, `Game #${match.id}`)
    },
    [navigateTo, state.params]
  )

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
          defaultOpen={index === 0}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {round.matches.map((match, mIdx) => (
              <MatchCard
                key={match.id ?? mIdx}
                team1={{
                  teamName: match.team1?.name,
                  score: match.team1Score,
                }}
                team2={{
                  teamName: match.team2?.name,
                  score: match.team2Score,
                }}
                startTime={match.startTime}
                venueName={match.venueCourt?.venue?.name}
                onClick={() => handleMatchClick(match)}
              />
            ))}
          </div>
        </RoundAccordion>
      ))}
    </div>
  )
}
