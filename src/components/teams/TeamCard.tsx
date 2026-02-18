'use client'

import { Card } from '@/components/common/Card'
import { FavoriteButton } from './FavoriteButton'

interface TeamCardProps {
  readonly name: string
  readonly teamId: number
  readonly playersCount?: string
  readonly organisationName?: string
  readonly isFavorited?: boolean
  readonly onToggleFavorite?: () => void
  readonly onClick: () => void
}

export function TeamCard({ name, playersCount, organisationName, isFavorited, onToggleFavorite, onClick }: TeamCardProps) {
  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-jersey-blue/20 to-stat-green/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-jersey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-jersey-blue transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {organisationName && (
              <span className="text-xs text-gray-500 truncate">{organisationName}</span>
            )}
            {playersCount && (
              <span className="text-xs text-gray-600">{playersCount} players</span>
            )}
          </div>
        </div>
        {onToggleFavorite && (
          <FavoriteButton isFavorited={isFavorited ?? false} onToggle={onToggleFavorite} />
        )}
        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover:text-jersey-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
}
