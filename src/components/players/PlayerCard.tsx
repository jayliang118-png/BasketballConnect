'use client'

import { Card } from '@/components/common/Card'

interface PlayerCardProps {
  readonly firstName: string
  readonly lastName: string
  readonly photoUrl?: string
  readonly onClick?: () => void
}

export function PlayerCard({ firstName, lastName, photoUrl, onClick }: PlayerCardProps) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`

  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-10 h-10 rounded-full object-cover border border-court-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hoop-orange/20 to-jersey-blue/20 flex items-center justify-center border border-court-border">
            <span className="text-sm font-bold text-hoop-orange">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate group-hover:text-hoop-orange transition-colors">
            {firstName} {lastName}
          </p>
        </div>
      </div>
    </Card>
  )
}
