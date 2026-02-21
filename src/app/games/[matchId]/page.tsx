import { getGameSummary } from '@/data/games'
import { GameDetailTabs } from '@/components/game/GameDetailTabs'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ matchId: string }>
  readonly searchParams: Promise<{ compKey?: string; compId?: string; tab?: string }>
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
  const { compKey, compId, tab } = await searchParams
  const matchIdNum = Number(matchId)
  const competitionId = Number(compId ?? 0)
  const competitionUniqueKey = compKey ?? ''

  const gameName = competitionUniqueKey
    ? await getGameName(matchIdNum, competitionUniqueKey)
    : `Game ${matchIdNum}`

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter gameName={gameName} />
      <GameDetailTabs
        activeTab={tab ?? 'summary'}
        matchId={matchIdNum}
        competitionUniqueKey={competitionUniqueKey}
        competitionId={competitionId}
      />
    </main>
  )
}
