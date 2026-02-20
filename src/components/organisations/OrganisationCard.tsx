'use client'

import { Card } from '@/components/common/Card'
import { FavoriteButton } from '@/components/common/FavoriteButton'

interface OrganisationCardProps {
  readonly name: string
  readonly organisationUniqueKey: string
  readonly isFavorited?: boolean
  readonly onToggleFavorite?: () => void
  readonly onClick?: () => void
}

export function OrganisationCard({ name, isFavorited, onToggleFavorite, onClick }: OrganisationCardProps) {
  return (
    <Card onClick={onClick} className="group" aria-label={`View ${name}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hoop-orange/20 to-jersey-blue/20 flex items-center justify-center flex-shrink-0 group-hover:from-hoop-orange/30 group-hover:to-jersey-blue/30 transition-all" suppressHydrationWarning>
          <svg className="w-6 h-6 text-hoop-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-hoop-orange transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Organisation</p>
        </div>
        {onToggleFavorite && (
          <FavoriteButton isFavorited={isFavorited ?? false} onToggle={onToggleFavorite} />
        )}
        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover:text-hoop-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
}
