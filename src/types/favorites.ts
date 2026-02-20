export type FavoriteType = 'organisation' | 'competition' | 'division' | 'team' | 'player'

export interface FavoriteItem {
  readonly type: FavoriteType
  readonly id: string
  readonly name: string
  readonly url?: string
}

export interface FavoritesState {
  readonly items: readonly FavoriteItem[]
  readonly isHydrated: boolean
}
