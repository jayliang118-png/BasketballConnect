'use client'

interface StatBadgeProps {
  readonly label: string
  readonly value: string | number
  readonly color?: 'orange' | 'blue' | 'green' | 'red' | 'gold'
}

const colorMap = {
  orange: 'text-hoop-orange',
  blue: 'text-jersey-blue',
  green: 'text-stat-green',
  red: 'text-stat-red',
  gold: 'text-stat-gold',
} as const

export function StatBadge({ label, value, color = 'orange' }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-court-elevated rounded-lg">
      <span className={`font-mono text-2xl font-bold ${colorMap[color]} animate-score-pop`}>
        {value}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
