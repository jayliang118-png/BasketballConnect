# Testing Patterns

**Analysis Date:** 2026-02-24

## Test Framework

**Runner:**
- Jest v30.2.0
- Config: `jest.config.ts`

**Assertion Library:**
- Jest built-in (expect API)
- Testing Library for React components (`@testing-library/react` v16.3.2, `@testing-library/jest-dom` v6.9.1)

**Run Commands:**
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

## Test File Organization

**Location:**
- Co-located pattern with main source code
- Tests in: `src/__tests__/` directory with parallel structure
- Sub-directories: `unit/`, `integration/`, `e2e/`
- E2E tests in: `src/__tests__/e2e/` or separate `tests/` directory

**Naming:**
- Unit tests: `[feature].test.ts` or `[feature].spec.ts`
- Example: `utils.test.ts`, `api-client.test.ts`, `game.schema.test.ts`

**Structure:**
```
src/__tests__/
├── unit/
│   ├── schemas/
│   │   ├── game.schema.test.ts
│   │   ├── common.schema.test.ts
│   │   └── ...
│   ├── services/
│   │   ├── competition.service.test.ts
│   │   ├── game.service.test.ts
│   │   └── ...
│   ├── lib/
│   │   ├── api-client.test.ts
│   │   ├── utils.test.ts
│   │   └── ladder-calculator.test.ts
│   └── ...
├── integration/
├── e2e/
├── setup.ts
└── ...
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from '@jest/globals'

describe('functionName', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('describes behavior when condition', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

**Patterns:**
- Use `describe` blocks to group related tests (one per main function/component)
- Use `it` (not `test`) for individual test cases
- Clear descriptions: "should [expected behavior]" or "handles [edge case]"
- `afterEach` for cleanup (restore mocks)

## Mocking

**Framework:** Jest built-in mocking

**Patterns:**
```typescript
// Mock API client before imports
const mockGet = jest.fn()
jest.mock('@/lib/api-client', () => ({
  createApiClient: jest.fn(() => ({ get: mockGet })),
}))

jest.mock('@/lib/config', () => ({
  config: {
    apiBaseUrl: 'https://api-basketball.squadi.com',
    apiToken: 'test-token',
  },
}))

// Then import the module being tested
import { fetchCompetitions } from '@/services/competition.service'

// Use mock in tests
mockGet.mockResolvedValue([])
mockGet.mockRejectedValue(new Error('Server error'))
```

**Fetch Mocking:**
```typescript
function mockFetchSuccess(data: unknown, status = 200): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

function mockFetchFailure(status: number, body: string): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve({ message: body }),
    text: () => Promise.resolve(body),
  })
}
```

**What to Mock:**
- External dependencies (API client, config, fetch)
- Service layer functions when testing higher-level consumers
- Context providers in component tests

**What NOT to Mock:**
- Utility functions (format, filter, build functions)
- Pure helpers without side effects
- Type/schema definitions (Zod validators)

## Fixtures and Factories

**Test Data:**
```typescript
// Inline fixture objects
const validGameSummary = {
  playing: [
    {
      teamId: 116550,
      shirt: '4',
      photoUrl: null,
      firstName: 'Antong',
      lastName: 'Liang',
      // ...
    },
  ],
  // ...
}

// Seed common data in describe block
const items: readonly TestItem[] = [
  { id: 1, name: 'Lakers', city: 'Los Angeles' },
  { id: 2, name: 'Celtics', city: 'Boston' },
  // ...
] as const
```

**Location:**
- Inline in test files within describe blocks
- No separate fixtures directory detected
- Data close to where it's used

## Coverage

**Requirements:** 80% threshold enforced
- `jest.config.ts` defines: branches, functions, lines, statements all at 80%

**Coverage Configuration:**
```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}

collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/app/layout.tsx',
  '!src/app/page.tsx',
  '!src/__tests__/**',
]
```

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, utilities, services
- Location: `src/__tests__/unit/`
- Approach: Test functions in isolation with mocked dependencies
- Example: `utils.test.ts` tests utility functions with various inputs
- Example: `api-client.test.ts` tests URL building, headers, error handling

**Integration Tests:**
- Scope: Service layer with mocked API responses
- Location: `src/__tests__/integration/` (structure available, limited tests)
- Approach: Test service functions calling mocked API client
- Example: Service tests mock `client.get()` and verify correct endpoints called
- Example: Test data transformations and error propagation

**E2E Tests:**
- Framework: Playwright (`@playwright/test` available but not installed)
- Location: `src/__tests__/e2e/` or `tests/`
- Files: `tests/basic.spec.ts`, `tests/basketball-hub.spec.ts` (not yet configured)
- Status: Defined structure but not fully integrated with Jest runner

## Common Patterns

**Async Testing:**
```typescript
it('calls the correct endpoint', async () => {
  mockGet.mockResolvedValue([])

  await fetchCompetitions('org-key-123')

  expect(mockGet).toHaveBeenCalledWith(
    '/livescores/competitions/list',
    { organisationUniqueKey: 'org-key-123' }
  )
})

it('propagates errors from the API client', async () => {
  mockGet.mockRejectedValue(new Error('Server error'))

  await expect(fetchCompetitions('org-key')).rejects.toThrow('Server error')
})
```

**Error Testing:**
```typescript
it('wraps non-Error thrown values into a proper Error', async () => {
  mockGet.mockRejectedValue('raw string error')

  await expect(fetchCompetitions('org-key')).rejects.toThrow(
    'Failed to fetch competitions'
  )
})

it('throws ApiError on non-OK status', async () => {
  mockFetchFailure(404, 'Not found')

  await expect(client.get('/missing')).rejects.toThrow(ApiError)
})

it('includes status code in ApiError', async () => {
  mockFetchFailure(401, 'Unauthorized')

  try {
    await client.get('/protected')
    fail('Expected ApiError to be thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(401)
  }
})
```

**Schema Validation Testing:**
```typescript
describe('GameSummarySchema', () => {
  it('accepts a valid game summary', () => {
    const result = GameSummarySchema.safeParse(validGameSummary)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.matchData.team1Score).toBe(72)
    }
  })

  it('rejects missing required fields', () => {
    const { teamData: _td, ...noTeamData } = validGameSummary
    const result = GameSummarySchema.safeParse(noTeamData)
    expect(result.success).toBe(false)
  })

  it('accepts response with empty result array', () => {
    const data = { ...validActionLogResponse, result: [] }
    const result = ActionLogResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
```

**Utility Function Testing:**
```typescript
describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-03-15T10:30:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles invalid date strings gracefully', () => {
    const result = formatDate('not-a-date')
    expect(typeof result).toBe('string')
  })

  it('returns empty string for empty input', () => {
    const result = formatDate('')
    expect(typeof result).toBe('string')
  })
})
```

## Setup and Teardown

**Setup File:** `src/__tests__/setup.ts`
- Imports `@testing-library/jest-dom` for DOM matchers
- Runs before all tests

**Per-Test Cleanup:**
```typescript
afterEach(() => {
  jest.restoreAllMocks()
})
```

**Module Name Mapping:**
- `jest.config.ts` defines: `'^@/(.*)$': '<rootDir>/src/$1'`
- Allows using `@/` imports in tests

## Test Execution

**Ignored Paths:**
- `/node_modules/`
- `/.next/`
- `/src/__tests__/e2e/`
- `/src/__tests__/setup.ts`

**Current Test Status:**
- Most unit tests passing (schemas, utils, services, api-client)
- Some failures in newer service tests (stats.service.test.ts - parameter mismatch)
- Some failures in schema tests (validation logic mismatch)
- E2E tests need Playwright setup (missing module)

---

*Testing analysis: 2026-02-24*
