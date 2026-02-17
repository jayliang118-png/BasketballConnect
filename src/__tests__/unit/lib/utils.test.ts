import {
  formatDate,
  formatScore,
  buildFullName,
  filterBySearchTerm,
  formatStatValue,
} from '@/lib/utils'

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-03-15T10:30:00Z')

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats a date-only string', () => {
    const result = formatDate('2024-01-01')

    expect(result).toBeTruthy()
  })

  it('returns a human-readable format', () => {
    const result = formatDate('2024-12-25T00:00:00Z')

    // Should contain the year and some date info
    expect(result).toContain('2024')
  })

  it('handles edge case of empty string gracefully', () => {
    const result = formatDate('')

    expect(typeof result).toBe('string')
  })

  it('handles invalid date strings gracefully', () => {
    const result = formatDate('not-a-date')

    expect(typeof result).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// formatScore
// ---------------------------------------------------------------------------

describe('formatScore', () => {
  it('returns the score as a string for a valid number', () => {
    expect(formatScore(42)).toBe('42')
  })

  it('returns a dash or placeholder for undefined', () => {
    const result = formatScore(undefined)

    expect(result).toBe('-')
  })

  it('formats zero correctly', () => {
    expect(formatScore(0)).toBe('0')
  })

  it('formats large numbers', () => {
    expect(formatScore(999)).toBe('999')
  })

  it('formats negative scores', () => {
    const result = formatScore(-5)

    expect(result).toBe('-5')
  })
})

// ---------------------------------------------------------------------------
// buildFullName
// ---------------------------------------------------------------------------

describe('buildFullName', () => {
  it('concatenates first and last name with a space', () => {
    expect(buildFullName('LeBron', 'James')).toBe('LeBron James')
  })

  it('trims whitespace from inputs', () => {
    expect(buildFullName('  Michael  ', '  Jordan  ')).toBe('Michael Jordan')
  })

  it('handles empty first name', () => {
    expect(buildFullName('', 'Bryant')).toBe('Bryant')
  })

  it('handles empty last name', () => {
    expect(buildFullName('Kobe', '')).toBe('Kobe')
  })

  it('handles both empty', () => {
    expect(buildFullName('', '')).toBe('')
  })

  it('handles single character names', () => {
    expect(buildFullName('A', 'B')).toBe('A B')
  })
})

// ---------------------------------------------------------------------------
// filterBySearchTerm
// ---------------------------------------------------------------------------

describe('filterBySearchTerm', () => {
  interface TestItem {
    readonly id: number
    readonly name: string
    readonly city: string
  }

  const items: readonly TestItem[] = [
    { id: 1, name: 'Lakers', city: 'Los Angeles' },
    { id: 2, name: 'Celtics', city: 'Boston' },
    { id: 3, name: 'Bulls', city: 'Chicago' },
    { id: 4, name: 'Heat', city: 'Miami' },
  ] as const

  const getSearchableText = (item: TestItem): string =>
    `${item.name} ${item.city}`

  it('returns all items when search term is empty', () => {
    const result = filterBySearchTerm(items as TestItem[], '', getSearchableText)

    expect(result).toHaveLength(4)
  })

  it('filters items by matching name', () => {
    const result = filterBySearchTerm(items as TestItem[], 'Lakers', getSearchableText)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Lakers')
  })

  it('filters items by matching city', () => {
    const result = filterBySearchTerm(items as TestItem[], 'Boston', getSearchableText)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Celtics')
  })

  it('is case-insensitive', () => {
    const result = filterBySearchTerm(items as TestItem[], 'lakers', getSearchableText)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Lakers')
  })

  it('returns empty array when no matches', () => {
    const result = filterBySearchTerm(items as TestItem[], 'Knicks', getSearchableText)

    expect(result).toHaveLength(0)
  })

  it('handles empty items array', () => {
    const result = filterBySearchTerm([], 'test', getSearchableText)

    expect(result).toHaveLength(0)
  })

  it('matches partial strings', () => {
    const result = filterBySearchTerm(items as TestItem[], 'Chi', getSearchableText)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Bulls')
  })

  it('trims search term whitespace', () => {
    const result = filterBySearchTerm(items as TestItem[], '  Heat  ', getSearchableText)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Heat')
  })

  it('does not mutate the original array', () => {
    const original = [...items]
    filterBySearchTerm(items as TestItem[], 'Lakers', getSearchableText)

    expect(items).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// formatStatValue
// ---------------------------------------------------------------------------

describe('formatStatValue', () => {
  it('formats percentage stat types with % symbol', () => {
    const result = formatStatValue(75.5, 'percentage')

    expect(result).toContain('%')
  })

  it('formats percentage with one decimal place', () => {
    const result = formatStatValue(75.555, 'percentage')

    expect(result).toBe('75.6%')
  })

  it('formats regular number stats without symbol', () => {
    const result = formatStatValue(25, 'points')

    expect(result).toBe('25')
  })

  it('formats decimal stats to one decimal place', () => {
    const result = formatStatValue(8.666, 'average')

    expect(result).toBe('8.7')
  })

  it('formats whole numbers without unnecessary decimals for non-average types', () => {
    const result = formatStatValue(10, 'points')

    expect(result).toBe('10')
  })

  it('handles zero', () => {
    const result = formatStatValue(0, 'points')

    expect(result).toBe('0')
  })

  it('handles zero percentage', () => {
    const result = formatStatValue(0, 'percentage')

    expect(result).toBe('0.0%')
  })
})
