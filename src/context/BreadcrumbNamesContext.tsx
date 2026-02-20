'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface BreadcrumbNames {
  readonly orgName?: string
  readonly compName?: string
  readonly divName?: string
  readonly teamName?: string
  readonly gameName?: string
  readonly playerName?: string
}

interface BreadcrumbNamesContextValue {
  readonly names: BreadcrumbNames
  readonly setNames: (updates: Partial<BreadcrumbNames>) => void
}

const BreadcrumbNamesContext =
  createContext<BreadcrumbNamesContextValue | null>(null)

interface BreadcrumbNamesProviderProps {
  readonly children: React.ReactNode
}

export function BreadcrumbNamesProvider({
  children,
}: BreadcrumbNamesProviderProps) {
  const [names, setNamesState] = useState<BreadcrumbNames>({})

  const setNames = useCallback((updates: Partial<BreadcrumbNames>) => {
    setNamesState((prev) => ({ ...prev, ...updates }))
  }, [])

  const value = useMemo(() => ({ names, setNames }), [names, setNames])

  return (
    <BreadcrumbNamesContext.Provider value={value}>
      {children}
    </BreadcrumbNamesContext.Provider>
  )
}

export function useBreadcrumbNames(): BreadcrumbNamesContextValue {
  const ctx = useContext(BreadcrumbNamesContext)
  if (!ctx) {
    throw new Error(
      'useBreadcrumbNames must be used within BreadcrumbNamesProvider',
    )
  }
  return ctx
}
