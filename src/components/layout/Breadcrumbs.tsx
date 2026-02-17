'use client'

import { useNavigation } from '@/hooks/use-navigation'
import { useCallback } from 'react'

export function Breadcrumbs() {
  const { state, navigateToBreadcrumb } = useNavigation()
  const { breadcrumbs } = state

  const handleClick = useCallback(
    (index: number) => {
      navigateToBreadcrumb(index)
    },
    [navigateToBreadcrumb]
  )

  if (breadcrumbs.length <= 1) return null

  return (
    <nav
      className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm overflow-x-auto"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        return (
          <div key={`${crumb.view}-${index}`} className="flex items-center gap-2 flex-shrink-0">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-hoop-orange font-medium">{crumb.label}</span>
            ) : (
              <button
                onClick={() => handleClick(index)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                type="button"
              >
                {crumb.label}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
