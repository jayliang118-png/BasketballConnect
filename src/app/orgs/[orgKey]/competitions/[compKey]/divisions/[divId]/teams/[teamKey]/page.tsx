import { resolveTeamFromList } from '@/data/teams'
import { getCompetitionByKey, getCompetitionName } from '@/data/competitions'
import { getDivisionName } from '@/data/divisions'
import { getOrganisationName } from '@/data/organisations'
import { TeamDetailTabs } from '@/components/teams/TeamDetailTabs'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{
    orgKey: string
    compKey: string
    divId: string
    teamKey: string
  }>
  readonly searchParams: Promise<{ tab?: string }>
}

async function resolveTeam(
  teamKey: string,
  orgKey: string,
  compKey: string,
  divisionId: number,
): Promise<{ name: string; teamUniqueKey: string | null }> {
  const comp = await getCompetitionByKey(orgKey, compKey)
  if (!comp) return { name: teamKey, teamUniqueKey: teamKey.startsWith('team-') ? null : teamKey }
  return resolveTeamFromList(comp.id, divisionId, orgKey, teamKey)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamKey, orgKey, compKey, divId } = await params
  const divisionId = Number(divId)
  const [team, compName] = await Promise.all([
    resolveTeam(teamKey, orgKey, compKey, divisionId),
    getCompetitionName(orgKey, compKey),
  ])
  return {
    title: `${team.name} - ${compName}`,
    description: `View roster and fixtures for ${team.name}`,
  }
}

export const revalidate = 600

export default async function TeamDetailPage({ params, searchParams }: Props) {
  const { orgKey, compKey, divId, teamKey } = await params
  const { tab } = await searchParams
  const divisionId = Number(divId)

  const [comp, orgName, compName, divName] = await Promise.all([
    getCompetitionByKey(orgKey, compKey),
    getOrganisationName(orgKey),
    getCompetitionName(orgKey, compKey),
    getDivisionName(compKey, divisionId),
  ])

  const competitionId = comp?.id ?? 0
  const team = await resolveTeam(teamKey, orgKey, compKey, divisionId)

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter
        orgName={orgName}
        compName={compName}
        divName={divName}
        teamName={team.name}
      />
      <TeamDetailTabs
        activeTab={tab ?? ((team.teamUniqueKey ?? teamKey).startsWith('team-') ? 'fixtures' : 'roster')}
        teamKey={team.teamUniqueKey ?? teamKey}
        teamName={team.name}
        competitionId={competitionId}
        divisionId={divisionId}
        orgKey={orgKey}
        compKey={compKey}
      />
    </main>
  )
}
