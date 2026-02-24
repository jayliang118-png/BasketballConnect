# Codebase Concerns

**Analysis Date:** 2026-02-24

## Tech Debt

**Large Component Files:**
- Issue: `PlayerStats.tsx` (532 lines) exceeds recommended 400-line limit and contains complex state management for match log data fetching and display
- Files: `src/components/players/PlayerStats.tsx`
- Impact: Difficult to maintain, test, and modify. Complex intertwined concerns (data fetching, UI rendering, filtering)
- Fix approach: Extract match log rendering, data formatting utilities, and competition-matching logic into separate smaller components

**Prefetch Hook Complexity:**
- Issue: `use-search-prefetch.ts` (265 lines) contains complex async orchestration with multiple nested API calls and error handling
- Files: `src/hooks/use-search-prefetch.ts`
- Impact: Difficult to debug and test. Hard to understand data flow and error recovery
- Fix approach: Break into smaller hooks for each entity type (orgs, competitions, divisions, teams, players) with separate responsibility

**Tool Definitions File:**
- Issue: `tool-definitions.ts` (219 lines) is a monolithic configuration file containing all chat tool specifications
- Files: `src/lib/chat/tool-definitions.ts`
- Impact: Single point of failure for chat functionality. Hard to navigate and modify individual tools
- Fix approach: Split tool definitions by category or use a plugin pattern for registration

**Game Summary Component:**
- Issue: `GameSummary.tsx` (299 lines) contains mixed responsibilities for scoring display, stats calculation, and UI rendering
- Files: `src/components/game/GameSummary.tsx`
- Impact: High cognitive complexity. Changes to scoring logic require component modifications
- Fix approach: Extract stats calculation logic into service utilities

## Missing Error Boundaries

**Unprotected Game Routes:**
- Issue: `/games/[matchId]/page.tsx` lacks error.tsx boundary
- Files: `src/app/games/[matchId]/page.tsx`, `src/app/games/[matchId]/` (directory)
- Impact: Global errors on game pages will show generic error UI, reducing user experience. Errors won't be caught at appropriate level
- Fix approach: Add `src/app/games/[matchId]/error.tsx` with appropriate error handling and recovery UI

## Performance Bottlenecks

**Live Polling Without Boundaries:**
- Issue: `use-api-data.ts` polling (line 72) silently swallows errors and has no backoff strategy
- Files: `src/hooks/use-api-data.ts`
- Impact: Failed API calls will continuously retry at fixed interval, potentially flooding API on connection issues. Network-heavy operations on background tab
- Fix approach: Implement exponential backoff, max retry limits, and circuit breaker pattern. Add visibility-aware polling already present (line 71) more comprehensively

**Uncontrolled Search Indexing:**
- Issue: `use-search-prefetch.ts` makes sequential API calls for each organization without request queuing or rate limiting (lines 97-150+)
- Files: `src/hooks/use-search-prefetch.ts`
- Impact: Can overwhelm API during initial page load. Multiple organizations trigger serial network requests with delays but no concurrency limit
- Fix approach: Implement request queue with configurable concurrency limits. Batch requests where possible

**Expensive String Matching in Competition Lookup:**
- Issue: `PlayerStats.tsx` `findCompetition()` function (lines 93-125) performs linear searches with UUID string matching on every match row
- Files: `src/components/players/PlayerStats.tsx`
- Impact: O(n*m) complexity on render. Performance degrades significantly with many matches or competitions
- Fix approach: Build lookup maps or hash tables during data load. Use useMemo to prevent recalculation

**Complex Sorting and Filtering:**
- Issue: `TeamFixtures.tsx` performs filtering and sorting operations that recalculate on every render (lines 14-26, 87-94)
- Files: `src/components/teams/TeamFixtures.tsx`
- Impact: Unnecessary rerenders when data hasn't changed. Filter operations on large fixture lists are expensive
- Fix approach: Memoize filter/sort results and add dependency optimization

## Security Considerations

**Script Injection in Layout:**
- Issue: `dangerouslySetInnerHTML` in layout.tsx contains theme preference script (line 44-46)
- Files: `src/app/layout.tsx` (lines 44-46)
- Current mitigation: Script is static and doesn't contain dynamic content from user input
- Recommendations: While currently safe, consider migrating to `<script>` tag in `next/script` component or moving logic to middleware. Document why this pattern is necessary

**Missing Input Validation in Tool Executor:**
- Issue: Tool execution in chat route (line 100) parses JSON arguments without type validation before passing to tools
- Files: `src/app/api/chat/route.ts` (lines 99-111)
- Impact: Tools receive unchecked data. If tool args are not validated, malformed inputs could cause unexpected behavior
- Fix approach: Validate tool arguments against schemas before execution. Use Zod schemas for all tool parameters

**Error Messages May Leak Context:**
- Issue: API error responses return raw error body text without sanitization (line 59)
- Files: `src/lib/server-api-client.ts` (lines 58-62)
- Impact: If backend returns sensitive information in error messages, it could be exposed to clients
- Fix approach: Log full error server-side, return generic message to client

## Fragile Areas

**Competition ID Matching:**
- Files: `src/components/players/PlayerStats.tsx` (lines 93-125)
- Why fragile: Attempts multiple matching strategies (ID, unique key, UUID string matching, name matching). Fallback logic is brittle and order-dependent
- Safe modification: Add comprehensive test cases for each matching scenario. Document which strategy should be preferred
- Test coverage: No unit tests for `findCompetition()` logic. Mock data with various ID formats

**Event Listener Cleanup:**
- Files: `src/components/favorites/FavoritesDropdown.tsx`, `src/components/search/GlobalSearchDropdown.tsx`, `src/components/common/Modal.tsx`, `src/hooks/use-search-prefetch.ts`
- Why fragile: Event listeners are added but cleanup depends on exact useEffect dependency arrays
- Safe modification: Add explicit listener cleanup tests. Use AbortController consistently
- Test coverage: No tests for event listener cleanup scenarios

**Polling State Management:**
- Files: `src/hooks/use-api-data.ts` (lines 66-88)
- Why fragile: `pollingInterval` dependency can change unexpectedly. Multiple useState calls with interdependencies (`fetchCount`, `cancelled`)
- Safe modification: Test with rapid pollingInterval changes. Verify cleanup happens correctly
- Test coverage: Gaps in testing visibility state transitions and interval cleanup

## Dependencies at Risk

**OpenAI SDK Major Version:**
- Risk: `openai@^6.21.0` uses caret versioning. Version 7.x may have breaking changes
- Impact: Future npm updates could break chat functionality
- Migration plan: Pin to specific version or use exact version specifier. Test major version upgrades in staging first

**Recent React 19 Compatibility:**
- Risk: React 19.2.3 is relatively new. Ecosystem packages may have compatibility issues
- Impact: May encounter library conflicts or unexpected behavior changes
- Migration plan: Keep dependencies current. Monitor next.js and testing library updates

## Test Coverage Gaps

**Chat Tool Integration:**
- What's not tested: End-to-end tool execution flow in chat route, error handling for malformed tool responses
- Files: `src/app/api/chat/route.ts`, `src/lib/chat/tool-executor.ts`
- Risk: Tool execution failures or timeout handling not verified. Tool result formatting could fail silently
- Priority: High - chat is user-facing feature

**Search Prefetch Orchestration:**
- What's not tested: Complete prefetch flow with multiple organizations, error recovery, abort signal handling
- Files: `src/hooks/use-search-prefetch.ts`
- Risk: Silent failures in search indexing. If one org fails, others may not be attempted
- Priority: High - affects core search functionality

**Polling State Transitions:**
- What's not tested: Visibility state changes during polling, rapid interval changes, error persistence
- Files: `src/hooks/use-api-data.ts`
- Risk: Polling may not stop correctly on tab hide or may start duplicate intervals
- Priority: Medium - affects real-time features

**Player Stats Data Transformation:**
- What's not tested: Complex match row data transformation, competition matching scenarios
- Files: `src/components/players/PlayerStats.tsx`
- Risk: Display bugs in player match logs or incorrect competition linking
- Priority: Medium - user-visible data correctness

**Error Boundary Behavior:**
- What's not tested: Error pages display, recovery mechanisms, missing error boundaries on some routes
- Files: `src/app/games/[matchId]/`, error.tsx files
- Risk: Generic error fallbacks shown instead of route-specific error handling
- Priority: Medium - UX during failures

## Scaling Limits

**Search Index Memory:**
- Current capacity: Entire search index built client-side in memory
- Limit: Performance degrades with organization/competition/team scale. Prefetch could timeout with 1000+ organizations
- Scaling path: Implement server-side search indexing with streaming results. Add pagination to search results

**API Call Concurrency:**
- Current capacity: useApiData creates one fetch per hook instance. Multiple components can trigger requests simultaneously
- Limit: Could exceed API rate limits with many concurrent requests on complex pages
- Scaling path: Implement request deduplication, request queue management, and backpressure

**Polling Scale:**
- Current capacity: Each useApiData instance with polling creates separate interval. No deduplication
- Limit: Many polling hooks on one page multiply requests by count of instances
- Scaling path: Implement shared polling infrastructure, centralized cache with subscribers

## Missing Critical Features

**Request Cancellation:**
- Problem: No way to cancel in-flight requests. AbortSignal used in prefetch but not in main API client
- Blocks: Can't gracefully handle component unmounts or user navigation during slow requests
- Fix approach: Integrate AbortController into main API clients and service layer

**Cache Invalidation Strategy:**
- Problem: No explicit cache invalidation. Polling is only mechanism for updates
- Blocks: User actions that update data (favorites, etc.) don't refresh displayed data
- Fix approach: Add mutation hooks with cache invalidation patterns

**Rate Limiting & Backoff:**
- Problem: No exponential backoff or rate limit awareness
- Blocks: Recovery from API throttling is non-existent. Can make situations worse with retry storms
- Fix approach: Implement exponential backoff, respect `Retry-After` headers, circuit breaker

## Memory Leak Risks

**Event Listener in Search Prefetch:**
- Files: `src/hooks/use-search-prefetch.ts` (line 101)
- Risk: `signal.addEventListener('abort', ...)` may not clean up if component unmounts before abort
- Mitigation: AbortSignal cleanup is handled but test coverage is missing

**Multiple Polling Instances:**
- Files: `src/hooks/use-api-data.ts` (line 77)
- Risk: setInterval created per pollingInterval instance. If deps change frequently, old intervals may leak
- Mitigation: Return cleanup in useEffect correctly but depends on accurate dependency arrays

---

*Concerns audit: 2026-02-24*
