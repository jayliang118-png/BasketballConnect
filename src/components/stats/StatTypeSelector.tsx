'use client'

const STAT_TYPES = [
  { value: 'TOTALPOINTS', label: 'Total Points' },
  { value: 'AVGPOINTS', label: 'Avg Points' },
  { value: 'TWOPOINTS', label: '2-Pointers' },
  { value: 'THREEPOINTS', label: '3-Pointers' },
  { value: 'FREETHROWS', label: 'Free Throws' },
  { value: 'TOTALPF', label: 'Total Fouls' },
] as const

interface StatTypeSelectorProps {
  readonly selectedType: string
  readonly onSelect: (type: string) => void
}

export function StatTypeSelector({ selectedType, onSelect }: StatTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STAT_TYPES.map((stat) => (
        <button
          key={stat.value}
          onClick={() => onSelect(stat.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            selectedType === stat.value
              ? 'bg-hoop-orange text-white shadow-md'
              : 'bg-court-elevated text-gray-400 hover:text-gray-200 hover:bg-court-border'
          }`}
          type="button"
        >
          {stat.label}
        </button>
      ))}
    </div>
  )
}
