'use client'

import { Card } from '@/components/common/Card'

interface CompetitionCardProps {
  readonly name: string
  readonly uniqueKey: string
  readonly year?: string
  readonly onClick: () => void
}

export function CompetitionCard({ name, year, onClick }: CompetitionCardProps) {
  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jersey-blue/20 to-hoop-orange/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-jersey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-jersey-blue transition-colors">
            {name}
          </h3>
          {year && (
            <p className="text-xs text-gray-500 mt-0.5">{year}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover:text-jersey-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
}
