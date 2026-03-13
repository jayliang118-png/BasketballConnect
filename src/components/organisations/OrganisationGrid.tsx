'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { OrganisationCard } from './OrganisationCard'
import { SearchIndexRegistrar } from '@/components/search/SearchIndexRegistrar'
import { useSearch } from '@/hooks/use-search'
import { useSearchPrefetch } from '@/hooks/use-search-prefetch'
import { useFavorites } from '@/hooks/use-favorites'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

interface Organisation {
  readonly organisationUniqueKey: string
  readonly name: string
}

interface OrganisationGridProps {
  readonly organisations: readonly Organisation[]
}

export function OrganisationGrid({ organisations }: OrganisationGridProps) {
  const { filterItems } = useSearch()
  const { isFavorite, toggleFavorite } = useFavorites()

  useSearchPrefetch(
    organisations as readonly {
      organisationUniqueKey: string
      name: string
    }[],
  )

  // Create searchable entities for organisations
  const searchEntities = useMemo(() => {
    return organisations
      .filter((o) => o.organisationUniqueKey && o.name)
      .map((org) => ({
        type: 'organisation' as const,
        id: org.organisationUniqueKey,
        name: org.name,
        targetView: 'competitions' as const,
        breadcrumbs: [
          { label: 'Home', view: 'organisations' as const, params: {} as Record<string, string | number> },
          { label: org.name, view: 'competitions' as const, params: { organisationUniqueKey: org.organisationUniqueKey } },
        ],
        params: { organisationUniqueKey: org.organisationUniqueKey } as Record<string, string | number>,
      } as SearchableEntity))
  }, [organisations])

  const filtered = filterItems(
    organisations as Organisation[],
    (org) => org.name,
  )

  if (filtered.length === 0) {
    return <EmptyState message="No organisations match your search" icon="search" />
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <SearchIndexRegistrar entities={searchEntities} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((org) => (
          <Link
            key={org.organisationUniqueKey}
            href={`/orgs/${org.organisationUniqueKey}/competitions`}
          >
            <OrganisationCard
              name={org.name}
              organisationUniqueKey={org.organisationUniqueKey}
              isFavorited={isFavorite('organisation', org.organisationUniqueKey)}
              onToggleFavorite={() => toggleFavorite({
                type: 'organisation',
                id: org.organisationUniqueKey,
                name: org.name,
                url: `/orgs/${org.organisationUniqueKey}/competitions`,
              })}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
