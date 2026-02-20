'use client'

import { ErrorMessage } from '@/components/common/ErrorMessage'

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <ErrorMessage
        message={error.message || 'Something went wrong'}
        onRetry={reset}
      />
    </div>
  )
}
