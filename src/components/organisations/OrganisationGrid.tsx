'use client'

import Link from 'next/link'
import { OrganisationCard } from './OrganisationCard'
import { useSearch } from '@/hooks/use-search'
import { useSearchPrefetch } from '@/hooks/use-search-prefetch'
import { useFavorites } from '@/hooks/use-favorites'
import { EmptyState } from '@/components/common/EmptyState'

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

  const filtered = filterItems(
    organisations as Organisation[],
    (org) => org.name,
  )

  if (filtered.length === 0) {
    return <EmptyState message="No organisations match your search" icon="search" />
  }

  return (
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
  )
}
