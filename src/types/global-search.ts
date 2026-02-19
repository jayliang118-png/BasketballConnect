import type { BreadcrumbItem, ViewType } from './navigation'

export type SearchableEntityType =
  | 'organisation'
  | 'competition'
  | 'division'
  | 'team'
  | 'player'

export interface SearchableEntity {
  readonly type: SearchableEntityType
  readonly id: string
  readonly name: string
  readonly parentLabel?: string
  readonly targetView: ViewType
  readonly breadcrumbs: readonly BreadcrumbItem[]
  readonly params: Readonly<Record<string, string | number>>
}

export interface SearchResultGroup {
  readonly type: SearchableEntityType
  readonly label: string
  readonly items: readonly SearchableEntity[]
}

export interface GlobalSearchIndexValue {
  readonly register: (entities: readonly SearchableEntity[]) => void
  readonly search: (term: string) => readonly SearchableEntity[]
  readonly entityCount: number
}
