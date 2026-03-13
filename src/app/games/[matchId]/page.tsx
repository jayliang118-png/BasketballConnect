import { getGameSummary } from '@/data/games'
import { getCompetitionByKey, getCompetitionName } from '@/data/competitions'
import { getDivisionName } from '@/data/divisions'
import { getOrganisationName } from '@/data/organisations'
import { GameDetailTabs } from '@/components/game/GameDetailTabs'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ matchId: string }>
  readonly searchParams: Promise<{ compKey?: string; compId?: string; orgKey?: string; tab?: string }>
}

async function getGameName(matchId: number, compKey: string): Promise<string> {
  try {
    const summary = await getGameSummary(matchId, compKey)
    const t1 = summary.teamData.team1.name
    const t2 = summary.teamData.team2.name
    return `${t1} vs ${t2}`
  } catch {
    return `Game ${matchId}`
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { matchId } = await params
  const { compKey } = await searchParams
  const matchIdNum = Number(matchId)
  const gameName = compKey ? await getGameName(matchIdNum, compKey) : `Game ${matchId}`
  return {
    title: gameName,
    description: 'View game details, action log, and events',
  }
}

export const revalidate = 60

export default async function GamePage({ params, searchParams }: Props) {
  const { matchId } = await params
  const { compKey, compId, orgKey, tab } = await searchParams
  const matchIdNum = Number(matchId)
  const competitionId = Number(compId ?? 0)
  const competitionUniqueKey = compKey ?? ''

  const gameName = competitionUniqueKey
    ? await getGameName(matchIdNum, competitionUniqueKey)
    : `Game ${matchIdNum}`

  // Fetch breadcrumb names if we have org and comp keys
  let orgName: string | undefined
  let compName: string | undefined
  if (orgKey && competitionUniqueKey) {
    try {
      const results = await Promise.all([
        getOrganisationName(orgKey),
        getCompetitionName(orgKey, competitionUniqueKey),
      ])
      orgName = results[0]
      compName = results[1]
    } catch {
      // Fall back to no org/comp names if fetching fails
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter orgName={orgName} compName={compName} gameName={gameName} />
      <GameDetailTabs
        activeTab={tab ?? 'summary'}
        matchId={matchIdNum}
        competitionUniqueKey={competitionUniqueKey}
        competitionId={competitionId}
      />
    </main>
  )
}
