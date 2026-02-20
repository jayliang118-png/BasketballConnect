import { getCompetitions, getCompetitionName } from '@/data/competitions'
import { getOrganisationName } from '@/data/organisations'
import { CompetitionGrid } from '@/components/competitions/CompetitionGrid'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ orgKey: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgKey } = await params
  const orgName = await getOrganisationName(orgKey)
  return {
    title: `${orgName} - Competitions`,
    description: `View competitions for ${orgName}`,
  }
}

export const revalidate = 1800

export default async function CompetitionsPage({ params }: Props) {
  const { orgKey } = await params
  const [competitions, orgName] = await Promise.all([
    getCompetitions(orgKey),
    getOrganisationName(orgKey),
  ])

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter orgName={orgName} />
      <CompetitionGrid competitions={competitions} orgKey={orgKey} orgName={orgName} />
    </main>
  )
}
