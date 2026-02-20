import { getCompetitionByKey, getCompetitionName } from '@/data/competitions'
import { getDivisionName } from '@/data/divisions'
import { getOrganisationName } from '@/data/organisations'
import { DivisionDetailTabs } from '@/components/divisions/DivisionDetailTabs'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ orgKey: string; compKey: string; divId: string }>
  readonly searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgKey, compKey, divId } = await params
  const [compName, divName] = await Promise.all([
    getCompetitionName(orgKey, compKey),
    getDivisionName(compKey, Number(divId)),
  ])
  return {
    title: `${divName} - ${compName}`,
    description: `View teams, fixtures, ladder, and stats for ${divName}`,
  }
}

export const revalidate = 1800

export default async function DivisionDetailPage({ params, searchParams }: Props) {
  const { orgKey, compKey, divId } = await params
  const { tab } = await searchParams
  const divisionId = Number(divId)

  const [comp, orgName, compName, divName] = await Promise.all([
    getCompetitionByKey(orgKey, compKey),
    getOrganisationName(orgKey),
    getCompetitionName(orgKey, compKey),
    getDivisionName(compKey, divisionId),
  ])

  const competitionId = comp?.id ?? 0

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter
        orgName={orgName}
        compName={compName}
        divName={divName}
      />
      <div className="space-y-4 animate-fade-up">
        <h2 className="text-xl font-bold text-gray-100">{divName}</h2>
        <DivisionDetailTabs
          activeTab={tab ?? 'teams'}
          competitionId={competitionId}
          divisionId={divisionId}
          orgKey={orgKey}
          compKey={compKey}
        />
      </div>
    </main>
  )
}
