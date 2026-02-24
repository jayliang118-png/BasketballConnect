# Codebase Structure

**Analysis Date:** 2026-02-24

## Directory Layout

```
BasketballConnect/
├── .github/                    # GitHub workflows
├── .planning/codebase/         # Generated documentation (this folder)
├── coverage/                   # Jest coverage reports
├── node_modules/               # Dependencies
├── out/                        # Static export output
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── __tests__/              # Test files (mirrors src structure)
│   ├── app/                    # Next.js App Router pages and API routes
│   ├── components/             # React components organized by feature
│   ├── context/                # React Context providers
│   ├── data/                   # Server-side data fetching functions
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and configuration
│   ├── schemas/                # Zod validation schemas
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript type definitions
│   ├── globals.css             # Global Tailwind styles
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Root page (redirects to /orgs)
├── tests/                      # Legacy test files (not used)
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Environment variable template
├── eslint.config.mjs           # ESLint configuration
├── jest.config.ts              # Jest test runner config
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── package-lock.json           # Lockfile
├── postcss.config.mjs           # PostCSS/Tailwind config
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router - pages (directories with page.tsx) and API routes
- Contains: Page components, API route handlers, layout components, error/loading boundaries
- Key files:
  - `layout.tsx` - Root layout with theme provider wrappers
  - `page.tsx` - Home page (redirects to /orgs)
  - `api/chat/route.ts` - LLM chat endpoint
  - `api/basketball/[...path]/route.ts` - Squadi API proxy
- Structure: Dynamic routes use `[paramName]` directories; API routes use `api/` prefix
- Revalidation: Each page sets `export const revalidate = X` for ISR

**src/components/**
- Purpose: Reusable React components organized by feature domain
- Contains: UI components, feature-specific containers, tabs, lists, cards
- Subdirectories (18 feature areas):
  - `common/` - Shared UI components (Card, LoadingSpinner, ErrorMessage, FavoriteButton, etc.)
  - `layout/` - Layout components (Header, Footer, BreadcrumbsFromUrl, BreadcrumbNameSetter)
  - `chat/` - Chat UI (ChatPanel, ChatMessage, result cards for chat results)
  - `divisions/` - Division views (DivisionDetailTabs)
  - `teams/` - Team components (TeamList, TeamDetail, TeamFixtures, TeamRoster)
  - `fixtures/` - Fixture/match components (FixtureList, MatchCard)
  - `game/` - Game detail components (GameSummary, ActionLog, match UI)
  - `ladder/` - Ladder/standings view (LadderTable)
  - `stats/` - Statistics components (Leaderboard, player stats)
  - `players/` - Player components (PlayerStats)
  - `search/` - Search UI (GlobalSearchDropdown)
  - `favorites/` - Favorites UI (FavoritesDropdown)
  - `organisations/` - Organisation grid (OrganisationGrid)
  - `competitions/` - Competition views
  - `dashboard/` - Dashboard views
  - `providers/` - Context providers (ClientProviders)

**src/hooks/**
- Purpose: Custom React hooks for data fetching, state, and side effects
- Contains: 16 specialized hooks
- Key hooks:
  - `use-api-data.ts` - Generic hook for API fetching with polling
  - `use-chat.ts` - Chat conversation state management
  - `use-ladder.ts` - Ladder data with polling support
  - `use-fixtures.ts` - Fixture list fetching
  - `use-search-prefetch.ts` - Search results prefetching and caching
  - `use-search.ts`, `use-global-search.ts` - Search functionality
  - `use-favorites.ts`, `use-theme.ts` - Context wrappers
  - `use-game.ts`, `use-player.ts`, `use-teams.ts` - Domain-specific data
  - `use-debounce.ts` - Debounced values
  - `use-navigation.ts` - Navigation helpers

**src/context/**
- Purpose: React Context providers for global client-side state
- Contains: 7 context providers
- Key contexts:
  - `FavoritesContext.tsx` - User favorites (teams, players, matches) with localStorage persistence
  - `ThemeContext.tsx` - Light/dark theme preference with localStorage
  - `SearchContext.tsx` - Global search query state
  - `GlobalSearchIndexContext.tsx` - Pre-built search index cache
  - `ChatContext.tsx` - Chat conversation history and state
  - `NavigationContext.tsx` - Navigation state
  - `BreadcrumbNamesContext.tsx` - Breadcrumb labels for navigation

**src/services/**
- Purpose: API service layer - encapsulates domain-specific API calls
- Contains: 9 service files
- Services:
  - `competition.service.ts` - Competition list fetching
  - `division.service.ts` - Division data
  - `fixture.service.ts` - Fixture/match schedule
  - `game.service.ts` - Game details (summary, events, action log)
  - `ladder.service.ts` - League ladder standings
  - `organisation.service.ts` - Organisation data
  - `player.service.ts` - Player profiles and stats
  - `stats.service.ts` - Division-wide statistics
  - `team.service.ts` - Team data, roster, schedule

**src/data/**
- Purpose: Server-side data fetching with Next.js ISR caching
- Contains: 8 data files (mirrors services with server-only wrapping)
- Files:
  - `competitions.ts` - Get competitions with caching
  - `divisions.ts` - Get divisions with caching
  - `fixtures.ts` - Get fixtures with caching
  - `games.ts` - Get game details with caching
  - `organisations.ts` - Get organisations with caching
  - `players.ts` - Get player data with caching
  - `stats.ts` - Get statistics with caching
  - `teams.ts` - Get teams with caching
- Pattern: Import 'server-only', wrap services, set revalidate constant, use Promise.all for parallel fetches

**src/lib/**
- Purpose: Utility functions, configuration, and infrastructure code
- Contains:
  - `api-client.ts` - Client-side typed fetch wrapper (buildUrl, ApiError class)
  - `server-api-client.ts` - Server-side fetch with token injection
  - `server-config.ts` - Server configuration (API base URL, token)
  - `config.ts` - Client configuration
  - `utils.ts` - Pure utilities (formatDate, buildFullName, extractArray, filterBySearchTerm, formatStatValue)
  - `search-index-helpers.ts` - Search index building utilities
  - `search-index-cache.ts` - Search cache management
  - `favorites-migration.ts` - Legacy favorites migration
  - `ladder-calculator.ts` - Ladder position calculations from match data
- Subdirectory `chat/`:
  - `llm-client.ts` - OpenAI client initialization
  - `system-prompt.ts` - LLM system prompt with instructions
  - `tool-definitions.ts` - Chat tool definitions for LLM
  - `tool-executor.ts` - Executes tool calls (searches teams, fixtures, players)
  - `response-formatter.ts` - Formats tool results for display

**src/schemas/**
- Purpose: Zod validation schemas for API responses
- Contains: 11 schema files
- Schemas:
  - `common.schema.ts` - Shared types (Guid, Id, etc.)
  - `competition.schema.ts` - Competition response validation
  - `division.schema.ts` - Division response validation
  - `fixture.schema.ts` - Fixture/match schedule validation
  - `game.schema.ts` - Game summary, action log, events validation
  - `organisation.schema.ts` - Organisation response validation
  - `player.schema.ts` - Player profile response validation
  - `stats.schema.ts` - Statistics response validation
  - `team.schema.ts` - Team response validation
  - `global-search.ts` - Global search result validation
  - `chat.ts` - Chat API request/response validation
  - `index.ts` - Barrel export of all schemas

**src/types/**
- Purpose: TypeScript type definitions for domain models
- Contains: 17 type files (mirrors schemas but hand-written types)
- Types:
  - `common.ts` - Shared types
  - `competition.ts` - Competition types
  - `division.ts` - Division types
  - `fixture.ts` - Fixture types
  - `game.ts` - Game types
  - `organisation.ts` - Organisation types
  - `player.ts` - Player types
  - `stats.ts` - Statistics types
  - `team.ts` - Team types
  - `global-search.ts` - Search result types
  - `favorites.ts` - Favorites state types
  - `chat.ts` - Chat types (messages, roles, API response)
  - `navigation.ts` - Navigation types
  - `index.ts` - Barrel export

**src/__tests__/unit/**
- Purpose: Unit tests for utilities, schemas, and services
- Contains: Tests organized by layer
- Test files:
  - `lib/api-client.test.ts` - API client factory and error handling
  - `lib/utils.test.ts` - Utility function tests
  - `lib/ladder-calculator.test.ts` - Ladder calculation tests
  - `schemas/*.test.ts` - Schema validation tests
  - `services/*.test.ts` - Service layer tests

**public/**
- Purpose: Static assets served by Next.js
- Contains: favicon.ico and other static files

**Configuration Files:**
- `package.json` - Dependencies (Next.js, React, Zod, Jest, TypeScript), scripts
- `tsconfig.json` - TypeScript config with `@/*` path alias pointing to `./src/*`
- `jest.config.ts` - Jest test runner with jsdom preset
- `next.config.ts` - Next.js config (minimal, empty object)
- `postcss.config.mjs` - PostCSS with Tailwind CSS
- `eslint.config.mjs` - ESLint configuration
- `.env.example` - Template for environment variables

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout with theme, search, favorites providers
- `src/app/page.tsx` - Home page (redirects to /orgs)
- `src/app/orgs/page.tsx` - Organisations listing (default landing)
- `src/app/api/chat/route.ts` - Chat endpoint
- `src/app/api/basketball/[...path]/route.ts` - API proxy

**Configuration:**
- `src/lib/config.ts` - Client-side API configuration
- `src/lib/server-config.ts` - Server-side token and API URL
- `.env.local` - Runtime secrets (not in git)

**Core Logic:**
- `src/services/` - API service layer (9 services)
- `src/data/` - Server data functions with ISR
- `src/lib/ladder-calculator.ts` - Ladder position calculations
- `src/lib/chat/` - LLM integration (system prompt, tools, executor)

**Testing:**
- `src/__tests__/unit/` - Test suites
- `jest.config.ts` - Test configuration
- `run-test.js` - Manual test runner (legacy)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `TeamList.tsx`, `FixtureCard.tsx`)
- Services: camelCase with `.service.ts` suffix (e.g., `team.service.ts`)
- Hooks: camelCase with `use-` prefix (e.g., `use-api-data.ts`)
- Schemas: camelCase with `.schema.ts` suffix (e.g., `team.schema.ts`)
- Types: camelCase with `.ts` extension (e.g., `team.ts`)
- Context providers: PascalCase with `Context.tsx` suffix (e.g., `FavoritesContext.tsx`)
- API routes: Lowercase with brackets for dynamic segments (e.g., `[...path]`)

**Directories:**
- Features: lowercase plural (e.g., `teams/`, `fixtures/`, `organisations/`)
- Utilities: lowercase (e.g., `lib/`, `services/`, `schemas/`)
- React contexts: lowercase `context/`
- Tests: `__tests__/unit/` structure mirrors src organization

**Types/Variables:**
- Types: PascalCase (e.g., `TeamData`, `GameSummary`)
- Interfaces: PascalCase prefixed with `I` if distinguishing from types (rare; mostly using `type`)
- Constants: UPPER_SNAKE_CASE (e.g., `REVALIDATE_SECONDS`, `MAX_TOOL_ROUNDS`)
- Functions: camelCase (e.g., `buildFullName()`, `formatDate()`)
- Hook return objects: camelCase (e.g., `{ data, isLoading, error, refetch }`)

## Where to Add New Code

**New Feature (e.g., new domain like "seasons"):**
1. Type definitions: Create `src/types/season.ts` with domain types
2. Schema: Create `src/schemas/season.schema.ts` with Zod validation
3. Service: Create `src/services/season.service.ts` calling API client
4. Data function: Create `src/data/seasons.ts` with server-side fetcher (server-only)
5. Hooks: Create `src/hooks/use-seasons.ts` for client-side fetching
6. Components: Create `src/components/seasons/` subdirectory for UI
7. Context (if needed): Add to `src/context/` for global state
8. Tests: Add tests to `src/__tests__/unit/schemas/`, `services/`, and component tests

**New Component within Feature:**
- Primary code: `src/components/[feature]/ComponentName.tsx`
- Tests: `src/__tests__/unit/components/[feature]/ComponentName.test.ts` (if unit testing UI logic)
- Export in: Add to barrel export if feature has index.ts

**New Utility Function:**
- Shared helpers: `src/lib/utils.ts` (preferred for small, pure functions)
- Specialized utilities: Create new file in `src/lib/` if substantial (e.g., `src/lib/calculation.ts`)
- Tests: Add to `src/__tests__/unit/lib/utils.test.ts` or create new test file
- Consider using as function export, not default export

**New Page/Route:**
- Page: Create `src/app/[route]/page.tsx` (server component by default)
- Metadata: Add `export const metadata: Metadata = { ... }` or `generateMetadata()` function
- Revalidation: Set `export const revalidate = X` for ISR
- Loading: Optionally create `loading.tsx` for loading state
- Error: Optionally create `error.tsx` for error boundary
- Fetch data: Use server data functions from `src/data/`

**New API Endpoint:**
- Route: Create `src/app/api/[endpoint]/route.ts`
- Methods: Export `GET`, `POST`, `PUT`, etc. as named functions
- Error handling: Wrap in try-catch, return NextResponse with appropriate status
- Validation: Use Zod schemas for request body validation
- Example: See `src/app/api/chat/route.ts` for pattern

**New Hook:**
- File: `src/hooks/use-[name].ts` with `'use client'` directive
- Pattern: Use existing hooks as examples (`use-api-data.ts`, `use-chat.ts`)
- Return: Always return object with named properties (not tuple)
- Deps: Use dependency arrays correctly, consider linting rules
- Tests: Add to `src/__tests__/unit/hooks/` if complex logic

## Special Directories

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (auto-generated by npm install)
- Committed: No (.gitignore)
- Action: Never modify; use package.json to manage versions

**coverage/:**
- Purpose: Jest test coverage reports (HTML, LCOV)
- Generated: Yes (by `npm run test:coverage`)
- Committed: No (.gitignore)
- Action: View in browser for coverage analysis

**out/:**
- Purpose: Static site export for `next export` (deployment format)
- Generated: Yes (by `npm run build` with static export config)
- Committed: No (.gitignore)
- Action: Deploy `out/` directory to static hosting

**.next/:**
- Purpose: Next.js build cache and compiled files
- Generated: Yes (by `npm run build` or `npm run dev`)
- Committed: No (.gitignore)
- Action: Delete to force rebuild

**.env.local:**
- Purpose: Runtime environment variables (development)
- Generated: No (created manually)
- Committed: No (.gitignore protects secrets)
- Action: Copy from `.env.example` and fill in values

**.planning/codebase/:**
- Purpose: Generated codebase documentation (this file + ARCHITECTURE.md, CONVENTIONS.md, TESTING.md, etc.)
- Generated: Yes (by GSD tools)
- Committed: Yes (documentation is version controlled)
- Action: Reference during development, update when architecture changes

---

*Structure analysis: 2026-02-24*
