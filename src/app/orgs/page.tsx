import { getOrganisations } from '@/data/organisations'
import { OrganisationGrid } from '@/components/organisations/OrganisationGrid'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organisations',
  description: 'Browse all basketball organisations in Queensland',
}

export const revalidate = 3600

export default async function OrganisationsPage() {
  const organisations = await getOrganisations()

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter />
      <div className="space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">Organisations</h2>
          <span className="text-xs text-gray-500">
            {organisations.length} results
          </span>
        </div>
        <OrganisationGrid organisations={organisations} />
      </div>
    </main>
  )
}
