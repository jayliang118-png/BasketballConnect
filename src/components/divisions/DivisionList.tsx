'use client'

import { useCallback } from 'react'
import { useDivisions } from '@/hooks/use-divisions'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { DivisionCard } from './DivisionCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { EmptyState } from '@/components/common/EmptyState'

export function DivisionList() {
  const { state, navigateTo } = useNavigation()
  const competitionKey = state.params.competitionKey as string | undefined
  const { data, isLoading, error, refetch } = useDivisions(competitionKey ?? null)
  const { filterItems } = useSearch()

  const handleDivClick = useCallback(
    (div: { readonly id: number; readonly name: string }) => {
      navigateTo('divisionDetail', {
        ...state.params,
        divisionId: div.id,
        divisionName: div.name,
      }, div.name)
    },
    [navigateTo, state.params]
  )

  if (isLoading) return <LoadingSpinner message="Loading divisions..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState message="No divisions found" />

  const filtered = filterItems(data, (d) => d.name ?? '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Divisions</h2>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No divisions match your search" icon="search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((div) => (
            <DivisionCard
              key={div.id}
              name={div.name}
              id={div.id}
              onClick={() => handleDivClick(div)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
