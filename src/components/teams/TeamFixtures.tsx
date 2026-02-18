'use client'

import { useCallback, useMemo } from 'react'
import { useFixtures } from '@/hooks/use-fixtures'
import { useNavigation } from '@/hooks/use-navigation'
import { groupRoundsByName } from '@/components/fixtures/FixtureList'
import { RoundAccordion } from '@/components/fixtures/RoundAccordion'
import { MatchCard } from '@/components/fixtures/MatchCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { Match, Round } from '@/types/fixture'

function filterRoundsByTeamId(rounds: readonly Round[], teamId: number): readonly Round[] {
  return rounds
    .map((round) => ({
      ...round,
      matches: round.matches.filter(
        (match) => match.team1?.id === teamId || match.team2?.id === teamId
      ),
    }))
    .filter((round) => round.matches.length > 0)
}

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

export function TeamFixtures() {
  const { state, navigateTo } = useNavigation()
  const competitionId = state.params.competitionId as number | undefined
  const divisionId = state.params.divisionId as number | undefined
  const teamId = state.params.teamId as number | undefined
  const teamName = state.params.teamName as string | undefined

  const hasDivisionContext = competitionId !== undefined && divisionId !== undefined

  const { data, isLoading, error, refetch } = useFixtures(
    competitionId ?? null,
    divisionId ?? null
  )

  const groupedRounds = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    if (teamId) {
      return groupRoundsByName(filterRoundsByTeamId(data, teamId))
    }
    if (teamName) {
      return groupRoundsByName(filterRoundsByTeamName(data, teamName))
    }
    return []
  }, [data, teamId, teamName])

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

  if (!hasDivisionContext) {
    return (
      <EmptyState message="Navigate to this team through a division to view fixtures" />
    )
  }

  if (isLoading) return <LoadingSpinner message="Loading fixtures..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (groupedRounds.length === 0) return <EmptyState message="No fixtures found for this team" />

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
