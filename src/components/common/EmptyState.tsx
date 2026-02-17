'use client'

interface EmptyStateProps {
  readonly message?: string
  readonly icon?: 'basketball' | 'search' | 'team'
}

export function EmptyState({
  message = 'No data found',
  icon = 'basketball',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-500">
      <div className="w-16 h-16 rounded-full bg-court-elevated flex items-center justify-center">
        {icon === 'basketball' && (
          <span className="text-3xl" role="img" aria-label="basketball">
            &#x1F3C0;
          </span>
        )}
        {icon === 'search' && (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        {icon === 'team' && (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
      </div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
