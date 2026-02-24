# Architecture

**Analysis Date:** 2026-02-24

## Pattern Overview

**Overall:** Layered frontend architecture with Next.js App Router + React, featuring separated concerns across data fetching, state management, and presentation layers. The system uses a client-server split where server-side functions handle data access and the client layer manages UI state and user interactions.

**Key Characteristics:**
- Client/server component architecture (Next.js 16+ App Router)
- Context API for global client-side state (favorites, theme, search, chat)
- Service layer for API calls with client-side API client
- Server-side data fetching with `server-only` module isolation
- Hook-based data loading pattern with polling support
- Zod schema validation for API responses
- Feature-based component organization

## Layers

**API Layer:**
- Purpose: Interface with the Squadi Basketball API via authenticated requests
- Location: `src/lib/api-client.ts` (client-side), `src/lib/server-api-client.ts` (server-side)
- Contains: Typed fetch wrappers with error handling, URL building, query parameter construction
- Depends on: None
- Used by: Services layer and server data functions

**Service Layer:**
- Purpose: Encapsulate API calls and data transformation for domain entities
- Location: `src/services/*.service.ts` (9 services: competition, division, fixture, game, ladder, organisation, player, stats, team)
- Contains: Async functions that call API client and parse responses using extractArray utility
- Depends on: API client, config, Zod schemas
- Used by: Server-side data functions, hooks

**Server Data Functions:**
- Purpose: Fetch and cache data on the server using Next.js revalidation
- Location: `src/data/*.ts` (8 domain areas: competitions, divisions, fixtures, games, organisations, players, stats, teams)
- Contains: Server-only functions with `revalidate` config (typically 1800 or 3600 seconds)
- Depends on: Services, Zod schemas, utils
- Used by: Page components, Server components

**State Management Layer:**
- Purpose: Manage client-side global state for features that span multiple components
- Location: `src/context/*.tsx` (7 contexts: Favorites, Theme, Search, GlobalSearchIndex, Navigation, Chat, BreadcrumbNames)
- Contains: React Context with providers and hooks
- Depends on: localStorage for persistence (FavoritesContext), localStorage for theme
- Used by: Client components through context hooks

**Hooks Layer:**
- Purpose: Encapsulate logic for data fetching, client-side state, and side effects
- Location: `src/hooks/use-*.ts` (16 hooks)
- Key hooks:
  - `use-api-data.ts` - Generic data fetching with polling support
  - `use-chat.ts` - Chat conversation state
  - `use-ladder.ts` - Ladder data with polling
  - `use-search-prefetch.ts` - Search results caching
  - `use-favorites.ts`, `use-theme.ts` - Context wrappers
- Depends on: Context, utilities, api-client
- Used by: Client components

**Component Layer:**
- Purpose: Render UI and manage component-level state
- Location: `src/components/` organized by feature domain (18 subdirectories)
- Contains: React components, tab management, data display, forms, cards, lists
- Depends on: Hooks, utilities, schemas, context
- Used by: Page routes

**Page/Route Layer:**
- Purpose: Serve as entry points for URLs and orchestrate server-side data fetching
- Location: `src/app/` with Next.js App Router structure
- Metadata: Generated dynamically in page components
- Revalidation: Page-specific ISR config (typically 1800-3600 seconds)
- Entry routes: `/orgs`, `/orgs/[orgKey]/competitions/[compKey]/divisions/[divId]`, `/players/[playerId]`, `/games/[matchId]`
- Used by: Next.js router

**API Routes:**
- Purpose: Server endpoints for specialized functionality (chat, proxy)
- Location: `src/app/api/`
- Key routes:
  - `POST /api/chat` - LLM-powered chat with tool calling
  - `GET /api/basketball/[...path]` - Proxy to Squadi API with server-side token

**Utility & Schema Layer:**
- Purpose: Shared utilities and validation
- Location: `src/lib/utils.ts`, `src/schemas/` (11 schema files)
- Utilities: Formatting (dates, scores, names), filtering, array extraction, stat formatting
- Schemas: Zod validation for all domain types (game, fixture, team, stats, etc.)
- Used by: All other layers

## Data Flow

**Server-Side Rendering Flow:**
1. Page component (async/server) loads with route params
2. Page calls `src/data/*` functions (server-only)
3. Data functions call `src/services/*.service.ts`
4. Services call `src/lib/server-api-client.ts` which adds auth token
5. API client fetches from Squadi Basketball API (`https://api.squadi.com`)
6. Response validated with Zod schema
7. Parsed data passed to page component JSX
8. Page renders with metadata (generateMetadata)

**Client-Side Data Fetching Flow:**
1. Client component mounts
2. Component uses `use-api-data(fetcher, deps, options)` hook
3. Hook calls fetcher function that uses `src/lib/api-client.ts`
4. Client sends GET request to `/api/basketball/[...path]` proxy
5. Proxy attaches server-side auth token and forwards to Squadi API
6. Hook manages loading, error, and data states
7. Component renders based on hook result
8. Optional polling interval triggers refetches (used in ladder, fixture lists)

**State Management Flow:**
1. User actions trigger context methods (e.g., toggleFavorite)
2. Context updates internal state immutably using functional setState
3. State persisted to localStorage (async, catches errors)
4. Components subscribed to context re-render
5. Breadcrumb context updated on route changes (BreadcrumbNamesContext)

**Chat Flow:**
1. User sends message in ChatPanel component
2. ChatPanel calls chat hook which calls `/api/chat`
3. Chat route receives message + history
4. Validates with `chatApiRequestSchema`
5. Calls LLM client (OpenAI) with system prompt + history
6. LLM returns tool calls (function calls for basketball data)
7. Tool executor resolves each tool call (searches teams, fixtures, etc.)
8. Tool results sent back to LLM for context
9. LLM generates final response
10. Response formatter builds rich result blocks
11. Results returned to client and rendered in chat UI

## Key Abstractions

**ApiClient Interface:**
- Purpose: Typed wrapper around fetch for type-safe API calls
- Examples: `src/lib/api-client.ts`, `src/lib/server-api-client.ts`
- Pattern: Function factory that returns object with typed `get<T>` method
- Benefits: Testable, reusable, consistent error handling

**Service Pattern:**
- Purpose: Encapsulate domain logic and API integration
- Examples: `src/services/fixture.service.ts`, `src/services/game.service.ts`
- Pattern: Async functions that call API client and extract/validate data
- Pattern: Each service handles one domain entity
- Benefits: Reusable across pages and hooks, centralizes API logic

**UseApiData Hook:**
- Purpose: Generic data fetching with loading/error states and polling
- Pattern: Accept fetcher function (nullable), dependencies array, options
- Pattern: Manages cancel flag to prevent state updates on unmount
- Pattern: Optional polling with visibility detection (pauses when tab hidden)
- Benefits: Eliminates repetitive useState/useEffect patterns

**Context with LocalStorage:**
- Purpose: Persist client-side state across page reloads
- Examples: FavoritesContext (localStorage key: 'basketball-hub-favorites')
- Pattern: Hydration check to prevent hydration mismatch
- Pattern: useCallback for memoized update functions
- Benefits: User preferences preserved, offline-capable

**Zod Schema Validation:**
- Purpose: Runtime validation of API responses
- Examples: `src/schemas/game.schema.ts`, `src/schemas/fixture.schema.ts`
- Pattern: Define schemas for each API response type
- Pattern: Export inferred types (`z.infer<typeof Schema>`)
- Benefits: Type safety, error detection early, API contract enforcement

**Server Data Functions:**
- Purpose: Centralize server-side fetching with ISR support
- Examples: `src/data/competitions.ts`, `src/data/games.ts`
- Pattern: Use `'server-only'` to prevent client-side inclusion
- Pattern: Set `revalidate` constant for ISR (e.g., 1800 seconds)
- Pattern: Chain promises for parallel fetches where appropriate
- Benefits: Caching, reduced client JS, SEO-friendly

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Navigation to `/`
- Responsibilities: Redirects to `/orgs` (landing page is org list)

**Organisations List:**
- Location: `src/app/orgs/page.tsx`
- Triggers: Navigation to `/orgs`
- Responsibilities: Fetches organisations, renders OrganisationGrid, sets breadcrumbs
- Revalidates: Every 1 hour (3600 seconds)

**Division Detail:**
- Location: `src/app/orgs/[orgKey]/competitions/[compKey]/divisions/[divId]/page.tsx`
- Triggers: Navigation to nested division route
- Responsibilities: Fetches competition metadata, renders DivisionDetailTabs
- Tabs render: Teams, Fixtures, Ladder, Leaderboard
- Revalidates: Every 30 minutes (1800 seconds)
- Metadata: Dynamic title with division and competition names

**Team Detail:**
- Location: `src/app/orgs/[orgKey]/competitions/[compKey]/divisions/[divId]/teams/[teamKey]/page.tsx`
- Triggers: Click team in division
- Responsibilities: Fetches team data and roster, renders TeamDetail component

**Game Detail:**
- Location: `src/app/orgs/[orgKey]/competitions/[compKey]/divisions/[divId]/teams/[teamKey]/games/[matchId]/page.tsx`
- Triggers: Click fixture/match in teams or fixtures list
- Responsibilities: Fetches game summary and action log, renders game UI
- Polling: Uses live polling for in-progress games

**Player Profile:**
- Location: `src/app/players/[playerId]/page.tsx`
- Triggers: Click player in team roster or search
- Responsibilities: Fetches player stats and match history, renders PlayerStats component

**Chat API:**
- Location: `src/app/api/chat/route.ts`
- Triggers: User sends message in ChatPanel
- Responsibilities: Orchestrates LLM conversation with tool calls

**Basketball API Proxy:**
- Location: `src/app/api/basketball/[...path]/route.ts`
- Triggers: Client-side API calls through `/api/basketball/*`
- Responsibilities: Adds server-side auth token, forwards to Squadi API

## Error Handling

**Strategy:** Try-catch with error propagation, user-friendly error messages in UI, no silent failures.

**Patterns:**
- API Layer: ApiError class with status and body properties for debugging
- Service Layer: Catches and rethrows or transforms errors from API client
- Hooks: Catch block converts errors to readable string for UI
- Components: ErrorBoundary component wraps sections, ErrorMessage component shows errors
- Pages: Page-level error.tsx for 500 errors, loading.tsx for loading states

## Cross-Cutting Concerns

**Logging:** Console methods used selectively; no logging framework. Chat route logs request/response for debugging LLM interactions.

**Validation:** Zod schemas validate all API responses before use. Chat API validates request body with `chatApiRequestSchema`. Client-side hooks validate fetcher function exists before calling.

**Authentication:** Server-side token managed in `src/lib/server-config.ts` (reads from `BASKETBALL_HUB_SQUADI_API_TOKEN` env var). Token attached to server API requests. Client requests proxied through `/api/basketball/` to avoid exposing token to browser.

**Configuration:** Environment-based config in `src/lib/config.ts` (client) and `src/lib/server-config.ts` (server). API base URL and token managed separately. `next.config.ts` is minimal (empty config object).

---

*Architecture analysis: 2026-02-24*
