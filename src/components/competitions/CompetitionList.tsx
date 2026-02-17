'use client'

import { useCallback } from 'react'
import { useCompetitions } from '@/hooks/use-competitions'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { CompetitionCard } from './CompetitionCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

export function CompetitionList() {
  const { state } = useNavigation()
  const orgKey = state.params.organisationUniqueKey as string | undefined
  const { data, isLoading, error, refetch } = useCompetitions(orgKey ?? null)
  const { navigateTo } = useNavigation()
  const { filterItems } = useSearch()

  const handleCompClick = useCallback(
    (comp: { readonly uniqueKey: string; readonly id: number; readonly name: string }) => {
      navigateTo('divisions', {
        competitionKey: comp.uniqueKey,
        competitionId: comp.id,
        organisationUniqueKey: orgKey ?? '',
      }, comp.name)
    },
    [navigateTo, orgKey]
  )

  if (isLoading) return <LoadingSpinner message="Loading competitions..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState message="No competitions found" />

  const filtered = filterItems(data, (c) => `${c.name ?? ''} ${String(c.year ?? '')}`)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Competitions</h2>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No competitions match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((comp) => (
            <CompetitionCard
              key={comp.uniqueKey}
              name={comp.name}
              uniqueKey={comp.uniqueKey}
              year={comp.year as string | undefined}
              onClick={() => handleCompClick(comp)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
