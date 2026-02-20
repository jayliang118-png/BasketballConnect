'use client'

interface CardProps {
  readonly children: React.ReactNode
  readonly onClick?: () => void
  readonly className?: string
  readonly animated?: boolean
}

export function Card({ children, onClick, className = '', animated = true }: CardProps) {
  const baseClasses = 'card-basketball p-4 hover:card-basketball-hover'
  const animationClass = animated ? 'animate-fade-up' : ''
  const clickableClass = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${animationClass} ${clickableClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      suppressHydrationWarning
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}
