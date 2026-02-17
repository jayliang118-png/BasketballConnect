// ---------------------------------------------------------------------------
// StatsResultTable - Renders leaderboard stats inline in chat messages
// ---------------------------------------------------------------------------

'use client'

interface StatEntry {
  readonly firstName?: string
  readonly lastName?: string
  readonly name?: string
  readonly teamName?: string
  readonly total?: number
  readonly average?: number
  readonly value?: number
}

interface StatsResultTableProps {
  readonly data: unknown
}

function isStatEntry(item: unknown): item is StatEntry {
  return typeof item === 'object' && item !== null
}

function getPlayerName(entry: StatEntry): string {
  if (entry.firstName || entry.lastName) {
    return `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim()
  }
  return typeof entry.name === 'string' ? entry.name : 'Unknown'
}

function getStatValue(entry: StatEntry): string {
  if (typeof entry.total === 'number') return String(entry.total)
  if (typeof entry.average === 'number') return entry.average.toFixed(1)
  if (typeof entry.value === 'number') return String(entry.value)
  return '-'
}

export function StatsResultTable({ data }: StatsResultTableProps) {
  const items = Array.isArray(data) ? data : [data]
  const entries = items.filter(isStatEntry)
  const displayEntries = entries.slice(0, 10)

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <h4 className="text-xs font-semibold text-hoop-orange mb-2">
        Leaderboard ({entries.length})
      </h4>
      <div className="space-y-1">
        {displayEntries.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-2 py-1.5 rounded bg-court-dark/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono w-4 text-right">
                {index + 1}
              </span>
              <div>
                <span className="text-xs text-gray-200 font-medium">
                  {getPlayerName(entry)}
                </span>
                {entry.teamName && (
                  <span className="text-[10px] text-gray-500 ml-1">
                    ({entry.teamName})
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-mono text-hoop-orange font-bold">
              {getStatValue(entry)}
            </span>
          </div>
        ))}
      </div>
      {entries.length > 10 && (
        <p className="text-xs text-gray-500 mt-2">
          ...and {entries.length - 10} more entries
        </p>
      )}
    </div>
  )
}
