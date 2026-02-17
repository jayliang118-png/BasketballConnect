// ---------------------------------------------------------------------------
// GenericResultCard - Clickable card for orgs, competitions, divisions
// ---------------------------------------------------------------------------

'use client'

import type { ChatNavigateHandler } from './ChatResultRenderer'
import type { ChatResultType } from '@/types/chat'

interface GenericResultCardProps extends ChatNavigateHandler {
  readonly data: unknown
  readonly title: string
  readonly entityType: ChatResultType
}

function extractName(item: unknown): string {
  if (typeof item !== 'object' || item === null) {
    return String(item)
  }
  const record = item as Record<string, unknown>
  if (typeof record.name === 'string') return record.name
  if (typeof record.teamName === 'string') return record.teamName
  if (typeof record.firstName === 'string') {
    return `${record.firstName} ${record.lastName ?? ''}`.trim()
  }
  return JSON.stringify(item).slice(0, 80)
}

function handleItemClick(
  item: unknown,
  entityType: ChatResultType,
  onNavigate: ChatNavigateHandler['onNavigate'],
) {
  if (typeof item !== 'object' || item === null) return

  const record = item as Record<string, unknown>
  const name = extractName(item)

  switch (entityType) {
    case 'organisations': {
      const orgKey =
        typeof record.organisationUniqueKey === 'string'
          ? record.organisationUniqueKey
          : typeof record.uniqueKey === 'string'
            ? record.uniqueKey
            : null
      if (orgKey) {
        onNavigate(
          'competitions',
          { organisationUniqueKey: orgKey },
          name,
        )
      }
      break
    }
    case 'competitions': {
      const compKey =
        typeof record.uniqueKey === 'string' ? record.uniqueKey : null
      const compId =
        typeof record.id === 'number' ? record.id : null
      const orgKey =
        typeof record.organisationUniqueKey === 'string'
          ? record.organisationUniqueKey
          : ''
      if (compKey && compId !== null) {
        onNavigate(
          'divisions',
          {
            competitionKey: compKey,
            competitionId: compId,
            organisationUniqueKey: orgKey,
          },
          name,
        )
      }
      break
    }
    case 'divisions': {
      const divId =
        typeof record.id === 'number' ? record.id : null
      const compKey =
        typeof record.competitionKey === 'string'
          ? record.competitionKey
          : typeof record.competitionUniqueKey === 'string'
            ? record.competitionUniqueKey
            : ''
      const compId =
        typeof record.competitionId === 'number'
          ? record.competitionId
          : 0
      const orgKey =
        typeof record.organisationUniqueKey === 'string'
          ? record.organisationUniqueKey
          : ''
      if (divId !== null) {
        onNavigate(
          'divisionDetail',
          {
            divisionId: divId,
            divisionName: name,
            competitionKey: compKey,
            competitionId: compId,
            organisationUniqueKey: orgKey,
          },
          name,
        )
      }
      break
    }
    default:
      break
  }
}

export function GenericResultCard({
  data,
  title,
  entityType,
  onNavigate,
}: GenericResultCardProps) {
  const items = Array.isArray(data) ? data : [data]
  const displayItems = items.slice(0, 10)
  const remaining = items.length - displayItems.length
  const isClickable =
    entityType === 'organisations' ||
    entityType === 'competitions' ||
    entityType === 'divisions'

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <h4 className="text-xs font-semibold text-hoop-orange mb-2">
        {title} ({items.length})
      </h4>
      <ul className="space-y-1">
        {displayItems.map((item, index) => (
          <li key={index}>
            {isClickable ? (
              <button
                type="button"
                onClick={() =>
                  handleItemClick(item, entityType, onNavigate)
                }
                className="w-full text-left text-xs text-gray-300 py-1 px-2 rounded bg-court-dark/50 hover:bg-court-dark hover:text-hoop-orange transition-colors cursor-pointer"
              >
                {extractName(item)}
                <span className="text-gray-600 ml-1">&rarr;</span>
              </button>
            ) : (
              <span className="block text-xs text-gray-300 py-1 px-2 rounded bg-court-dark/50">
                {extractName(item)}
              </span>
            )}
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          ...and {remaining} more
        </p>
      )}
    </div>
  )
}
