'use client'

import { createContext, useCallback, useMemo, useState } from 'react'
import type {
  NavigationContextValue,
  NavigationState,
  ViewType,
} from '@/types/navigation'
import { INITIAL_NAVIGATION_STATE } from '@/types/navigation'

export const NavigationContext = createContext<NavigationContextValue | null>(null)

interface NavigationProviderProps {
  readonly children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>(INITIAL_NAVIGATION_STATE)

  const navigateTo = useCallback(
    (view: ViewType, params: Record<string, string | number>, label: string) => {
      setState((prev) => ({
        currentView: view,
        breadcrumbs: [
          ...prev.breadcrumbs,
          { label, view, params },
        ],
        params,
      }))
    },
    []
  )

  const navigateToBreadcrumb = useCallback((index: number) => {
    setState((prev) => {
      if (index <= 0) {
        return INITIAL_NAVIGATION_STATE
      }
      const truncated = prev.breadcrumbs.slice(0, index + 1)
      const target = truncated[truncated.length - 1]
      return {
        currentView: target?.view ?? 'organisations',
        breadcrumbs: truncated,
        params: target?.params ?? {},
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.breadcrumbs.length <= 1) {
        return INITIAL_NAVIGATION_STATE
      }
      const newBreadcrumbs = prev.breadcrumbs.slice(0, -1)
      const lastCrumb = newBreadcrumbs[newBreadcrumbs.length - 1]
      return {
        currentView: lastCrumb?.view ?? 'organisations',
        breadcrumbs: newBreadcrumbs,
        params: lastCrumb?.params ?? {},
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_NAVIGATION_STATE)
  }, [])

  const restoreState = useCallback((navState: NavigationState) => {
    setState(navState)
  }, [])

  const value = useMemo<NavigationContextValue>(
    () => ({ state, navigateTo, navigateToBreadcrumb, goBack, reset, restoreState }),
    [state, navigateTo, navigateToBreadcrumb, goBack, reset, restoreState]
  )

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
