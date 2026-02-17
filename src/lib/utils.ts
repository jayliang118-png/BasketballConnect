// ---------------------------------------------------------------------------
// Pure utility functions for the Basketball Connect app
// ---------------------------------------------------------------------------

/**
 * Formats a date string into a human-readable format.
 * Returns 'Invalid Date' for unparseable strings.
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a score for display. Returns '-' for undefined values.
 */
export function formatScore(score: number | undefined): string {
  if (score === undefined) {
    return '-'
  }

  return String(score)
}

/**
 * Builds a full name from first and last name, trimming whitespace.
 * Handles cases where either part is empty.
 */
export function buildFullName(first: string, last: string): string {
  const trimmedFirst = first.trim()
  const trimmedLast = last.trim()

  return [trimmedFirst, trimmedLast].filter(Boolean).join(' ')
}

/**
 * Filters items by a search term using a function to extract searchable text.
 * Case-insensitive. Returns all items when search term is empty.
 * Does not mutate the original array.
 */
export function filterBySearchTerm<T>(
  items: readonly T[],
  searchTerm: string,
  getSearchableText: (item: T) => string,
): readonly T[] {
  const trimmed = searchTerm.trim().toLowerCase()

  if (!trimmed) {
    return [...items]
  }

  return items.filter((item) => {
    const text = getSearchableText(item).toLowerCase()
    return text.includes(trimmed)
  })
}

/**
 * Extracts an array from an API response that may be:
 * - A plain array
 * - An object with a 'result' array property
 * - An object with a 'data' array property
 * - An object whose first array-valued property is the data
 * Returns an empty array if extraction fails.
 */
export function extractArray(response: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response as readonly Record<string, unknown>[]
  }

  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>
    // Check common wrapper keys first
    for (const key of ['result', 'data', 'results', 'items', 'records']) {
      if (Array.isArray(obj[key])) {
        return obj[key] as readonly Record<string, unknown>[]
      }
    }
    // Fallback: find first array-valued property
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        return value as readonly Record<string, unknown>[]
      }
    }
  }

  return []
}

/**
 * Formats a stat value for display based on the stat type.
 * - 'percentage' type: formatted to 1 decimal with % suffix
 * - 'average' type: formatted to 1 decimal
 * - other types: integer format
 */
export function formatStatValue(value: number, statType: string): string {
  if (statType === 'percentage') {
    return `${value.toFixed(1)}%`
  }

  if (statType === 'average') {
    return value.toFixed(1)
  }

  return String(value)
}
