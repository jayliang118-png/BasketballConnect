import type { Guid } from './common'
import type { BreadcrumbItem } from './navigation'

export interface FavoriteTeam {
  readonly teamUniqueKey: Guid
  readonly name: string
  readonly breadcrumbs?: readonly BreadcrumbItem[]
  readonly params?: Readonly<Record<string, string | number>>
}

export interface FavoritesState {
  readonly teams: readonly FavoriteTeam[]
  readonly isHydrated: boolean
}
