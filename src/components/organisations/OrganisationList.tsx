'use client'

import { useCallback, useEffect } from 'react'
import { useOrganisations } from '@/hooks/use-organisations'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { useGlobalSearchIndex } from '@/hooks/use-global-search-index'
import { useSearchPrefetch } from '@/hooks/use-search-prefetch'
import { OrganisationCard } from './OrganisationCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

export function OrganisationList() {
  const { data, isLoading, error, refetch } = useOrganisations()
  const { navigateTo } = useNavigation()
  const { filterItems } = useSearch()
  const { register } = useGlobalSearchIndex()

  // Background pre-fetch competitions and divisions for all orgs
  useSearchPrefetch(data as readonly { organisationUniqueKey: string; name: string }[] | null)

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return

    const entities: SearchableEntity[] = data.map((org) => ({
      type: 'organisation' as const,
      id: org.organisationUniqueKey,
      name: org.name ?? '',
      targetView: 'competitions' as const,
      breadcrumbs: [
        { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
        { label: org.name ?? '', view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } },
      ],
      params: { organisationUniqueKey: org.organisationUniqueKey },
    }))

    register(entities)
  }, [data, register])

  const handleOrgClick = useCallback(
    (orgKey: string, name: string) => {
      navigateTo('competitions', { organisationUniqueKey: orgKey }, name)
    },
    [navigateTo]
  )

  if (isLoading) return <LoadingSpinner message="Loading organisations..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState message="No organisations found" />

  const filtered = filterItems(data, (org) => org.name ?? '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Organisations</h2>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No organisations match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((org) => (
            <OrganisationCard
              key={org.organisationUniqueKey}
              name={org.name}
              organisationUniqueKey={org.organisationUniqueKey}
              onClick={() => handleOrgClick(org.organisationUniqueKey, org.name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
