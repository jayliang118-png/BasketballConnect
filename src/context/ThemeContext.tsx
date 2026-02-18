'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'basketball-hub-theme'

export interface ThemeContextValue {
  readonly theme: Theme
  readonly toggleTheme: () => void
  readonly isHydrated: boolean
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  readonly children: React.ReactNode
}

function applyThemeToDocument(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      const resolved = stored === 'light' ? 'light' : 'dark'
      setTheme(resolved)
      applyThemeToDocument(resolved)
    } catch {
      applyThemeToDocument('dark')
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, theme)
      applyThemeToDocument(theme)
    } catch {
      // localStorage unavailable
    }
  }, [theme, isHydrated])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, isHydrated }),
    [theme, toggleTheme, isHydrated],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
