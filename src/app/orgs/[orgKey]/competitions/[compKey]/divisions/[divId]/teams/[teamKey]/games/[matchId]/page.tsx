import { getCompetitionByKey, getCompetitionName } from '@/data/competitions'
import { getDivisionName } from '@/data/divisions'
import { getOrganisationName } from '@/data/organisations'
import { resolveTeamFromList } from '@/data/teams'
import { getGameSummary } from '@/data/games'
import { GameDetailTabs } from '@/components/game/GameDetailTabs'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{
    orgKey: string
    compKey: string
    divId: string
    teamKey: string
    matchId: string
  }>
  readonly searchParams: Promise<{ tab?: string }>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId, orgKey, compKey } = await params
  const matchIdNum = Number(matchId)
  const [gameName, compName] = await Promise.all([
    getGameName(matchIdNum, compKey),
    getCompetitionName(orgKey, compKey),
  ])
  return {
    title: `${gameName} - ${compName}`,
    description: `View game details, action log, and events`,
  }
}

export const revalidate = 60

export default async function GameDetailPage({ params, searchParams }: Props) {
  const { orgKey, compKey, divId, teamKey, matchId } = await params
  const { tab } = await searchParams
  const matchIdNum = Number(matchId)
  const divisionId = Number(divId)

  const [comp, orgName, compName, divName] = await Promise.all([
    getCompetitionByKey(orgKey, compKey),
    getOrganisationName(orgKey),
    getCompetitionName(orgKey, compKey),
    getDivisionName(compKey, divisionId),
  ])

  const competitionId = comp?.id ?? 0

  const [team, gameName] = await Promise.all([
    resolveTeamFromList(competitionId, divisionId, orgKey, teamKey),
    getGameName(matchIdNum, compKey),
  ])

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter
        orgName={orgName}
        compName={compName}
        divName={divName}
        teamName={team.name}
        gameName={gameName}
      />
      <GameDetailTabs
        activeTab={tab ?? 'summary'}
        matchId={matchIdNum}
        competitionUniqueKey={compKey}
        competitionId={competitionId}
      />
    </main>
  )
}
