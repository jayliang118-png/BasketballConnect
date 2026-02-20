'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { CompetitionCard } from './CompetitionCard'
import { SearchIndexRegistrar } from '@/components/search/SearchIndexRegistrar'
import { useSearch } from '@/hooks/use-search'
import { useFavorites } from '@/hooks/use-favorites'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

interface Competition {
  readonly id: number
  readonly uniqueKey: string
  readonly name: string
  readonly year?: string
}

interface CompetitionGridProps {
  readonly competitions: readonly Competition[]
  readonly orgKey: string
  readonly orgName?: string
}

export function CompetitionGrid({ competitions, orgKey, orgName }: CompetitionGridProps) {
  const { filterItems } = useSearch()
  const { isFavorite, toggleFavorite } = useFavorites()

  const searchEntities = useMemo<SearchableEntity[]>(() =>
    competitions
      .filter((c) => c.uniqueKey && c.name)
      .map((comp) => ({
        type: 'competition' as const,
        id: comp.uniqueKey,
        name: comp.name,
        parentLabel: orgName ?? '',
        targetView: 'divisions' as const,
        breadcrumbs: [],
        params: {
          competitionKey: comp.uniqueKey,
          competitionId: comp.id,
          organisationUniqueKey: orgKey,
        } as Record<string, string | number>,
      })),
    [competitions, orgKey, orgName],
  )

  const filtered = filterItems(
    competitions as Competition[],
    (c) => `${c.name} ${c.year ?? ''}`,
  )

  return (
    <div className="space-y-4 animate-fade-up">
      <SearchIndexRegistrar entities={searchEntities} />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Competitions</h2>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No competitions match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((comp) => (
            <Link
              key={comp.uniqueKey}
              href={`/orgs/${orgKey}/competitions/${comp.uniqueKey}/divisions`}
            >
              <CompetitionCard
                name={comp.name}
                uniqueKey={comp.uniqueKey}
                year={comp.year}
                isFavorited={isFavorite('competition', comp.uniqueKey)}
                onToggleFavorite={() => toggleFavorite({
                  type: 'competition',
                  id: comp.uniqueKey,
                  name: comp.name,
                  url: `/orgs/${orgKey}/competitions/${comp.uniqueKey}/divisions`,
                })}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
