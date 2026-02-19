import type {
  SearchableEntity,
  SearchableEntityType,
  SearchResultGroup,
} from '@/types/global-search'

const ENTITY_TYPE_ORDER: readonly SearchableEntityType[] = [
  'organisation',
  'competition',
  'division',
  'team',
  'player',
]

const ENTITY_TYPE_LABELS: Readonly<Record<SearchableEntityType, string>> = {
  organisation: 'Organisations',
  competition: 'Competitions',
  division: 'Divisions',
  team: 'Teams',
  player: 'Players',
}

export function buildEntityKey(type: SearchableEntityType, id: string | number): string {
  return `${type}:${id}`
}

export function filterEntitiesByTerm(
  entities: ReadonlyMap<string, SearchableEntity>,
  term: string,
): readonly SearchableEntity[] {
  const lower = term.trim().toLowerCase()

  if (!lower) {
    return []
  }

  const results: SearchableEntity[] = []

  for (const entity of entities.values()) {
    if (entity.name.toLowerCase().includes(lower)) {
      results.push(entity)
    }
  }

  return results
}

export function groupSearchResults(
  entities: readonly SearchableEntity[],
): readonly SearchResultGroup[] {
  const grouped = new Map<SearchableEntityType, SearchableEntity[]>()

  for (const entity of entities) {
    const existing = grouped.get(entity.type)
    if (existing) {
      existing.push(entity)
    } else {
      grouped.set(entity.type, [entity])
    }
  }

  return ENTITY_TYPE_ORDER
    .filter((type) => grouped.has(type))
    .map((type) => ({
      type,
      label: ENTITY_TYPE_LABELS[type],
      items: grouped.get(type) ?? [],
    }))
}

export function getEntityTypeLabel(type: SearchableEntityType): string {
  return ENTITY_TYPE_LABELS[type]
}
