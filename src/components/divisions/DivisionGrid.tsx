'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { DivisionCard } from './DivisionCard'
import { SearchIndexRegistrar } from '@/components/search/SearchIndexRegistrar'
import { useSearch } from '@/hooks/use-search'
import { useFavorites } from '@/hooks/use-favorites'
import { EmptyState } from '@/components/common/EmptyState'
import type { SearchableEntity } from '@/types/global-search'

interface Division {
  readonly id: number
  readonly name: string
}

interface DivisionGridProps {
  readonly divisions: readonly Division[]
  readonly orgKey: string
  readonly compKey: string
  readonly orgName?: string
  readonly compName?: string
}

export function DivisionGrid({
  divisions,
  orgKey,
  compKey,
  orgName,
  compName,
}: DivisionGridProps) {
  const { filterItems } = useSearch()
  const { isFavorite, toggleFavorite } = useFavorites()

  const searchEntities = useMemo<SearchableEntity[]>(() =>
    divisions
      .filter((d) => d.id && d.name)
      .map((div) => ({
        type: 'division' as const,
        id: String(div.id),
        name: div.name,
        parentLabel: [orgName, compName].filter(Boolean).join(' > '),
        targetView: 'divisionDetail' as const,
        breadcrumbs: [],
        params: {
          organisationUniqueKey: orgKey,
          competitionKey: compKey,
          divisionId: div.id,
        } as Record<string, string | number>,
      })),
    [divisions, orgKey, compKey, orgName, compName],
  )

  const filtered = filterItems(divisions as Division[], (d) => d.name)

  return (
    <div className="space-y-4 animate-fade-up">
      <SearchIndexRegistrar entities={searchEntities} />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Divisions</h2>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No divisions match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((div) => (
            <Link
              key={div.id}
              href={`/orgs/${orgKey}/competitions/${compKey}/divisions/${div.id}`}
            >
              <DivisionCard
                name={div.name}
                divisionId={div.id}
                isFavorited={isFavorite('division', String(div.id))}
                onToggleFavorite={() => toggleFavorite({
                  type: 'division',
                  id: String(div.id),
                  name: div.name,
                  url: `/orgs/${orgKey}/competitions/${compKey}/divisions/${div.id}`,
                })}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
