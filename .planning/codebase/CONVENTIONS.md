# Coding Conventions

**Analysis Date:** 2026-02-24

## Naming Patterns

**Files:**
- Service files: `[domain].service.ts` (e.g., `game.service.ts`, `player.service.ts`)
- Schema files: `[domain].schema.ts` (e.g., `game.schema.ts`, `competition.schema.ts`)
- Hook files: `use-[feature].ts` (kebab-case, e.g., `use-api-data.ts`, `use-debounce.ts`, `use-ladder.ts`)
- Component files: PascalCase `.tsx` (e.g., `Card.tsx`, `ChatWindow.tsx`)
- Context files: `[Name]Context.tsx` (e.g., `SearchContext.tsx`, `ThemeContext.tsx`)
- Test files: `[name].test.ts` or `[name].spec.ts` (co-located in `src/__tests__/` directory structure)

**Functions:**
- Service functions: camelCase, verb prefix for actions (e.g., `fetchCompetitions`, `fetchPlayer`, `fetchGameSummary`)
- Hook functions: `useX` pattern (e.g., `useApiData`, `useDebounce`, `useLadder`)
- Helper functions: camelCase descriptive names (e.g., `formatDate`, `buildFullName`, `filterBySearchTerm`, `formatStatValue`)
- React components: PascalCase (e.g., `function Card(...)`, `export function SearchProvider(...)`)

**Variables:**
- Constants: camelCase for regular variables, UPPER_SNAKE_CASE for module-level constants (e.g., `BASE_URL`, `TOKEN`)
- React hooks state: camelCase (e.g., `searchTerm`, `setSearchTerm`, `debouncedValue`, `isLoading`)
- DOM elements: camelCase (e.g., `baseClasses`, `animationClass`)
- Objects: camelCase (e.g., `mockData`, `validGameSummary`)

**Types:**
- Type aliases: PascalCase (e.g., `SearchableEntityType`, `ChatResultType`)
- Interface names: PascalCase ending in `Props` for component props (e.g., `CardProps`, `SearchProviderProps`)
- Type inference from schemas: `Z.infer<typeof SchemaName>` (e.g., `z.infer<typeof GameSummarySchema>`)
- Readonly types: Use `readonly` modifier extensively (e.g., `readonly children: React.ReactNode`)

## Code Style

**Formatting:**
- ESLint with Next.js core web vitals and TypeScript config: `eslint.config.mjs`
- No explicit prettier config detected - uses ESLint defaults
- Expect consistent formatting via ESLint

**Linting:**
- ESLint v9 with `eslint-config-next` and TypeScript support
- Configuration: `eslint.config.mjs` defines rules
- Run with: `npm run lint`

## Import Organization

**Order:**
1. React and external libraries (`react`, `react-dom`, third-party packages)
2. Internal utilities and helpers (`@/lib/`, `@/services/`)
3. Types and schemas (`@/types/`, `@/schemas/`)
4. Context imports
5. Component-specific imports

**Example:**
```typescript
'use client'

import { createContext, useCallback, useMemo, useState } from 'react'

import { createApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'

export interface SearchContextValue {
  readonly searchTerm: string
  // ...
}
```

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Always use `@/` imports for project code

**Barrel Files:**
- Central export file: `src/types/index.ts` re-exports all public types
- Use for organizing and exporting types across domain areas

## Error Handling

**Patterns:**
- Service functions wrap API calls in try-catch blocks
- Re-throw errors with context: normalize non-Error values into proper Error objects
- Pattern: `throw error instanceof Error ? error : new Error('User-friendly message')`
- Custom error classes for API errors: `ApiError` extends Error with `status` and `body` properties

**Example:**
```typescript
export async function fetchGameSummary(
  matchId: number,
  competitionUniqueKey: string,
): Promise<unknown> {
  try {
    const data = await client.get('/livescores/matches/public/gameSummary', {
      matchId,
      competitionUniqueKey,
    })
    return data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch game summary')
  }
}
```

**API Client Error:**
```typescript
export class ApiError extends Error {
  public readonly status: number
  public readonly body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}
```

## Logging

**Framework:** `console` methods not detected in production code patterns
- Avoid console.log in implementation
- Hook system warns on console.log usage via PostToolUse

**Patterns:**
- Limited logging observed - error handling is primary pattern
- Errors are thrown/propagated rather than logged

## Comments

**When to Comment:**
- JSDoc comments on exported functions with parameters and return types
- Section dividers: `// ---------------------------------------------------------------------------`
- Complex logic explanations before conditional blocks
- API endpoint documentation above service functions

**JSDoc/TSDoc:**
- Used extensively in service functions
- Example pattern:
```typescript
/**
 * Fetches the game summary for a match.
 * GET /livescores/matches/public/gameSummary?matchId=X&competitionUniqueKey=X
 */
export async function fetchGameSummary(
  matchId: number,
  competitionUniqueKey: string,
): Promise<unknown> {
```

## Function Design

**Size:** Functions are small and focused
- Service functions: 10-30 lines (API wrapping)
- Utility functions: 5-20 lines (single responsibility)
- Components: 30-50 lines (single feature)

**Parameters:**
- Use readonly object parameters for options: `interface UseApiDataOptions { readonly pollingInterval?: number | null }`
- Readonly arrays for collections
- Destructure in function signatures

**Return Values:**
- Service functions return `unknown` initially, rely on consumers to validate with Zod schemas
- Utility functions return specific types
- React hooks return interfaces: `UseApiDataResult<T>` pattern
- Always define result interfaces for hooks

## Module Design

**Exports:**
- Named exports for functions and components (avoid default exports)
- Type exports separated from value exports
- Example: `export async function fetchPlayer(...)` or `export function useApiData<T>(...)`

**Barrel Files:**
- Central `src/types/index.ts` for all type exports
- Organize by domain: each domain file exports its types, then index re-exports

**Immutability:**
- Readonly properties throughout: `readonly children: React.ReactNode`
- Use spread operator for object updates: `{ ...user, name }`
- Array copying: `[...items]` returns new array without mutation
- Example in `filterBySearchTerm`: `return [...items]` when returning all items

**API Response Format:**
- Services return `unknown` type, delegating to Zod validation
- Schemas define the expected shape
- Consumers validate responses before use

---

*Convention analysis: 2026-02-24*
