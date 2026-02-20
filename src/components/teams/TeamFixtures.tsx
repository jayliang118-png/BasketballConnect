'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useFixtures } from '@/hooks/use-fixtures'
import { groupRoundsByName } from '@/components/fixtures/FixtureList'
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

  const handleMatchClick = useCallback(
    (match: Match) => {
      router.push(
        `/orgs/${orgKey}/competitions/${compKey}/divisions/${divisionId}/teams/${teamKey}/games/${match.id}`
      )
    },
    [router, orgKey, compKey, divisionId, teamKey],
  )

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
