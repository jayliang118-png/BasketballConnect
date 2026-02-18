/**
 * Navigation types for the Basketball Hub web app UI.
 */

export type ViewType =
  | 'years'
  | 'organisations'
  | 'competitions'
  | 'divisions'
  | 'divisionDetail'
  | 'teams'
  | 'teamDetail'
  | 'fixtures'
  | 'gameDetail'
  | 'gameSummary'
  | 'playerProfile'
  | 'stats'

export interface BreadcrumbItem {
  readonly label: string
  readonly view: ViewType
  readonly params: Readonly<Record<string, string | number>>
}

export interface NavigationState {
  readonly currentView: ViewType
  readonly breadcrumbs: readonly BreadcrumbItem[]
  readonly params: Readonly<Record<string, string | number>>
}

export interface NavigationContextValue {
  readonly state: NavigationState
  readonly navigateTo: (
    view: ViewType,
    params: Record<string, string | number>,
    label: string
  ) => void
  readonly navigateToBreadcrumb: (index: number) => void
  readonly goBack: () => void
  readonly reset: () => void
  readonly restoreState: (navState: NavigationState) => void
}

export const INITIAL_NAVIGATION_STATE: NavigationState = {
  currentView: 'organisations',
  breadcrumbs: [
    { label: 'Home', view: 'organisations', params: {} },
  ],
  params: {},
}
