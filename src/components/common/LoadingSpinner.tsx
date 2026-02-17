'use client'

interface LoadingSpinnerProps {
  readonly message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-16 h-16">
        {/* Basketball SVG spinner */}
        <svg
          className="animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="var(--color-hoop-orange)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="120 40"
          />
          <circle
            cx="32"
            cy="32"
            r="18"
            stroke="var(--color-hoop-orange-dark)"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
          {/* Basketball lines */}
          <line
            x1="4"
            y1="32"
            x2="60"
            y2="32"
            stroke="var(--color-hoop-orange)"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="32"
            y1="4"
            x2="32"
            y2="60"
            stroke="var(--color-hoop-orange)"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400 animate-pulse">{message}</p>
    </div>
  )
}
