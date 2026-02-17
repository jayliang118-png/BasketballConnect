'use client'

import { useState, useMemo, useCallback } from 'react'
import { EmptyState } from './EmptyState'

interface Column<T> {
  readonly key: string
  readonly header: string
  readonly render: (item: T) => React.ReactNode
  readonly sortable?: boolean
  readonly sortValue?: (item: T) => string | number
  readonly className?: string
}

interface DataTableProps<T> {
  readonly columns: readonly Column<T>[]
  readonly data: readonly T[]
  readonly onRowClick?: (item: T) => void
  readonly emptyMessage?: string
  readonly keyExtractor: (item: T) => string | number
}

type SortDirection = 'asc' | 'desc'

interface SortState {
  readonly key: string
  readonly direction: SortDirection
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  keyExtractor,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null)

  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev?.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key: columnKey, direction: 'asc' }
    })
  }, [])

  const sortedData = useMemo(() => {
    if (!sortState) return data

    const column = columns.find((c) => c.key === sortState.key)
    if (!column?.sortValue) return data

    const sorted = [...data].sort((a, b) => {
      const aVal = column.sortValue!(a)
      const bVal = column.sortValue!(b)
      if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [data, sortState, columns])

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-court-border">
      <table className="w-full">
        <thead>
          <tr className="bg-court-elevated border-b border-court-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:text-gray-200 select-none' : ''
                } ${column.className ?? ''}`}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortState?.key === column.key && (
                    <span className="text-hoop-orange">
                      {sortState.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`border-b border-court-border/50 transition-colors ${
                onRowClick
                  ? 'cursor-pointer hover:bg-court-elevated/50'
                  : ''
              }`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-gray-300 ${column.className ?? ''}`}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
