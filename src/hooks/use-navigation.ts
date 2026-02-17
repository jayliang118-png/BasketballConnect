'use client'

import { useContext } from 'react'
import { NavigationContext } from '@/context/NavigationContext'
import type { NavigationContextValue } from '@/types/navigation'

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
