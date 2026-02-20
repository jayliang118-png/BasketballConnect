import { getDivisions } from '@/data/divisions'
import { getCompetitionName } from '@/data/competitions'
import { getOrganisationName } from '@/data/organisations'
import { DivisionGrid } from '@/components/divisions/DivisionGrid'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ orgKey: string; compKey: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgKey, compKey } = await params
  const compName = await getCompetitionName(orgKey, compKey)
  return {
    title: `${compName} - Divisions`,
    description: `View divisions for ${compName}`,
  }
}

export const revalidate = 1800

export default async function DivisionsPage({ params }: Props) {
  const { orgKey, compKey } = await params
  const [divisions, orgName, compName] = await Promise.all([
    getDivisions(compKey),
    getOrganisationName(orgKey),
    getCompetitionName(orgKey, compKey),
  ])

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter orgName={orgName} compName={compName} />
      <DivisionGrid divisions={divisions} orgKey={orgKey} compKey={compKey} orgName={orgName} compName={compName} />
    </main>
  )
}
