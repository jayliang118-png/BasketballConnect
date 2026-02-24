# External Integrations

**Analysis Date:** 2026-02-24

## APIs & External Services

**Squadi Basketball API:**
- Service: Squadi Basketball API - Primary data source for all sports information
  - SDK/Client: Custom fetch wrapper in `src/lib/api-client.ts` and `src/lib/server-api-client.ts`
  - Auth: Bearer token via `SQUADI_API_TOKEN` (server) and `NEXT_PUBLIC_SQUADI_API_TOKEN` (client)
  - Base URL: `SQUADI_API_BASE_URL` or defaults to `https://api-basketball.squadi.com`
  - Used for: Organisations, competitions, divisions, teams, players, fixtures, games, stats

**LLM Providers (OpenAI-compatible):**
- Service: Any OpenAI-compatible LLM provider
  - Supported providers configured in `.env.example`:
    - DeepSeek (https://api.deepseek.com)
    - OpenAI (https://api.openai.com/v1)
    - Anthropic (via LiteLLM proxy)
    - Groq (https://api.groq.com/openai/v1)
    - Together.xyz (https://api.together.xyz/v1)
    - Ollama local (http://localhost:11434/v1)
  - SDK/Client: openai npm package (6.21.0) in `src/lib/chat/llm-client.ts`
  - Auth: API key via `LLM_API_KEY`
  - Configuration: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
  - Used for: Chat API endpoint with function calling to query Squadi API

## Data Storage

**Databases:**
- Type: Not applicable - No database
- Approach: Data fetched on-demand from Squadi Basketball API
- Client caching: React Context API for global state
- Server caching: Next.js built-in caching via `revalidate` parameter in `src/lib/server-api-client.ts`
- Session storage: Local browser storage for favorites (in `src/context/FavoritesContext.tsx`)

**File Storage:**
- Approach: None - Assets served from Next.js public directory or external CDN via Squadi API

**Caching:**
- Strategy: Multi-layered
  - Server-side: Next.js automatic caching with revalidation timestamps
  - Client-side: React Context for organizations, players, stats, fixtures, teams
  - Lazy-loaded: Search index cached in memory via `src/lib/search-index-cache.ts`

## Authentication & Identity

**Auth Provider:**
- Type: Custom token-based (Squadi API provides tokens)
- Implementation: Bearer tokens stored in environment variables
  - Server token: `SQUADI_API_TOKEN` (server-only, via `server-only` package)
  - Client token: `NEXT_PUBLIC_SQUADI_API_TOKEN` (exposed to browser)
- No user authentication/sign-in system - Public data access

## Monitoring & Observability

**Error Tracking:**
- Service: None detected
- Approach: Error handling via try-catch in `src/app/api/chat/route.ts`

**Logs:**
- Approach: Console logging (development), error messages returned in API responses
- Location: API errors surfaced to client via `src/lib/api-client.ts` ApiError class

## CI/CD & Deployment

**Hosting:**
- Platform: Any Node.js 20.x compatible hosting (Vercel optimized for Next.js)
- Build: `npm run build`
- Start: `npm start`

**CI Pipeline:**
- Service: Not detected in codebase
- Suggested: GitHub Actions, Vercel CI (automatic for Vercel deployments)

## Environment Configuration

**Required env vars:**

Server-side (sensitive, server-only):
- `SQUADI_API_TOKEN` - Bearer token for Squadi Basketball API (required)
- `SQUADI_API_BASE_URL` - Squadi API endpoint (optional, defaults to `https://api-basketball.squadi.com`)
- `LLM_BASE_URL` - LLM provider endpoint (required for chat feature)
- `LLM_API_KEY` - LLM provider API key (required for chat feature)
- `LLM_MODEL` - LLM model name (required for chat feature, e.g., `deepseek-chat`, `gpt-4o`)

Client-side (public, browser-accessible):
- `NEXT_PUBLIC_SQUADI_API_TOKEN` - Public token for Squadi Basketball API (if different from server)
- `NEXT_PUBLIC_API_BASE_URL` - Client-side API base URL (optional, defaults to `/api/basketball`)

**Secrets location:**
- Development: `.env.local` (excluded from git)
- Production: Platform-specific secret management (Vercel Environment Variables, etc.)
- Example template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- Service: None detected
- Approach: API routes in `src/app/api/` for server-side logic only

**Outgoing:**
- Service: None detected
- Approach: Data fetched on-demand from Squadi API, no push/webhook subscriptions

## API Integration Details

**Chat API Route:**
- Endpoint: `POST /api/chat`
- Location: `src/app/api/chat/route.ts`
- Function: Orchestrates LLM conversation with Squadi API function calling
- Max concurrent tool calls: 5 rounds of LLM + tool execution
- Request timeout: 60 seconds
- Schema validation: Zod schema in `src/schemas/chat.ts`

**Tool Functions Available to LLM:**
- `search_organisations` - Search all basketball organisations
- `get_competitions` - Get competitions for an organisation
- `get_divisions` - Get divisions (age groups) for a competition
- `get_teams` - Get teams in a competition/division
- `get_team_detail` - Get team roster and details
- `get_player_profile` - Get individual player profile
- `get_fixtures` - Get match schedule
- `get_game_summary` - Get match scores and player stats
- `get_scoring_stats` - Get leaderboards (points, assists, etc.)
- `get_game_action_log` - Get play-by-play log

**Service Layers:**
- Competition: `src/services/competition.service.ts`
- Division: `src/services/division.service.ts`
- Team: `src/services/team.service.ts`
- Player: `src/services/player.service.ts`
- Fixture: `src/services/fixture.service.ts`
- Game: `src/services/game.service.ts`
- Stats: `src/services/stats.service.ts`
- Ladder: `src/services/ladder.service.ts`

---

*Integration audit: 2026-02-24*
