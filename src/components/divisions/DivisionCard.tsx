'use client'

import { Card } from '@/components/common/Card'

interface DivisionCardProps {
  readonly name: string
  readonly id: number
  readonly onClick: () => void
}

export function DivisionCard({ name, onClick }: DivisionCardProps) {
  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stat-gold/20 to-hoop-orange/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-stat-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-stat-gold transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Division</p>
        </div>
        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover:text-stat-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
}
