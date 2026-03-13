'use client'

import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'

interface SimplifiedRosterProps {
  readonly teamName: string
  readonly playersCount: string | null | undefined
  readonly isLoading: boolean
  readonly error: string | null | undefined
  readonly onRetry?: () => void
}

export function SimplifiedRoster({
  teamName,
  playersCount,
  isLoading,
  error,
  onRetry,
}: SimplifiedRosterProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading team information..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />
  }

  if (!playersCount) {
    return <EmptyState message="Player information not available" icon="team" />
  }

  const count = parseInt(playersCount, 10)

  return (
    <div className="space-y-4">
      <Card className="text-center">
        <div className="space-y-2">
          <p className="text-gray-400">Team Players</p>
          <p className="text-4xl font-bold text-hoop-orange">{count}</p>
          <p className="text-sm text-gray-500">
            {count === 1 ? 'player' : 'players'} on {teamName}
          </p>
        </div>
      </Card>
    </div>
  )
}
