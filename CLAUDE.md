# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Next.js dev server (http://localhost:3000)
npm run build            # Production build (uses tsc via next build)
npm run start            # Serve production build
npm run lint             # ESLint (flat config, extends eslint-config-next)

npm test                 # Run Jest unit + integration tests (jsdom)
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage — 80% threshold on all four metrics (branches/functions/lines/statements)
npx jest path/to/file.test.ts                  # Run a single test file
npx jest -t "test name substring"              # Run tests matching a name

npx playwright test tests/basketball-hub.spec.ts    # Playwright E2E (tests live in /tests, NOT /src)
```

Jest is configured to ignore `/src/__tests__/e2e/` and `/src/__tests__/setup.ts`. There is no `playwright.config.ts` — Playwright runs with defaults. Playwright specs in `/tests/` must be run via `npx playwright test`, not Jest.

## Environment

Two sets of env vars, read from different modules — do not mix them:

- **Server-only** (`src/lib/server-config.ts`, guarded by `server-only`): `SQUADI_API_TOKEN`, `SQUADI_API_BASE_URL`, plus `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (read directly in `src/app/api/chat/route.ts` and `src/lib/chat/llm-client.ts`).
- **Client-safe** (`src/lib/config.ts`): `NEXT_PUBLIC_API_BASE_URL` (defaults to `/api/basketball`, the internal proxy path).

`getServerConfig()` is lazy-cached — prefer it over the deprecated eager `serverConfig` proxy when writing new server code. The proxy exists for backwards compatibility and will fail at module load if env vars are missing.

`.env.example` is the canonical reference for required environment variables. Some local `.env` files may contain legacy `NEXT_PUBLIC_SQUADI_*` vars that are no longer read by any code — these are safe to remove.

## Architecture

This is a Next.js 16 App Router app over the **Squadi Basketball public API** (`api-basketball.squadi.com`). There is no database and no user auth — all personalization is client-side via `localStorage`.

### Two data paths to the upstream API

1. **Server components / Route handlers → `serverFetch`** (`src/lib/server-api-client.ts`): direct call to Squadi with `Authorization: ${SQUADI_API_TOKEN}`. Supports Next.js ISR via `{ next: { revalidate } }`. Used by `src/data/*.ts` modules (all `import 'server-only'`) for SSR pages.
2. **Client components → `createApiClient`** (`src/lib/api-client.ts`) → hits **`/api/basketball/[...path]`** proxy (`src/app/api/basketball/[...path]/route.ts`) → proxy attaches the server-side token and forwards to Squadi. The token is **never** shipped to the browser. Used by `src/services/*.ts` (called from client hooks).

When adding a new Squadi endpoint, decide which path: SSR with caching → add to `src/data/`; interactive/polling client UI → add to `src/services/` + a hook.

### Layering

```
src/
  app/                 App Router routes + API route handlers
    api/basketball/    Token-injecting proxy to Squadi
    api/chat/          LLM chat orchestrator (OpenAI-compatible, tool-calling loop)
    orgs/ games/ players/   Page routes (some with dynamic [segments])
  data/                Server-only fetchers (SSR/ISR) — validated with Zod schemas
  services/            Client-side fetchers (via /api/basketball proxy)
  schemas/             Zod schemas for all Squadi API responses; barrel in schemas/index.ts
  types/               TS types (often derived from schemas)
  hooks/               React hooks — data fetching, polling, search, favorites, notifications
  context/             8 Context providers, composed in components/providers/ClientProviders.tsx
  components/          Feature-grouped UI (teams/, players/, game/, fixtures/, chat/, ...)
  lib/                 Infra: api-client, server-api-client, config, server-config, chat/, etc.
  __tests__/           Jest unit + integration tests mirroring src/ structure
tests/                 Playwright E2E specs
```

Path alias `@/*` → `src/*` (see `tsconfig.json` and `jest.config.ts`).

### Styling

Tailwind CSS v4 is used for all styling. There is no `tailwind.config.ts` — v4 is configured via `@import "tailwindcss"` and an `@theme` block in `src/app/globals.css`, which defines custom basketball-themed design tokens (e.g., `--color-court-dark`, `--color-hoop-orange`, `--color-jersey-blue`). PostCSS (`postcss.config.mjs`) runs the `@tailwindcss/postcss` plugin.

### Key client patterns

- **`useApiData(fetcher, deps, { pollingInterval })`** (`src/hooks/use-api-data.ts`) is the generic fetch hook. It auto-pauses polling when `document.visibilityState === 'hidden'` and resumes on visibility change. It maps HTTP 403/404/5xx to user-friendly error strings.
- **`useConditionalPolling`** wraps the above for scenarios where polling should only run under certain conditions (e.g., game is LIVE).
- **Context composition order matters** — see `components/providers/ClientProviders.tsx`. `NotificationPoller` is a render-less component inside `NotificationProvider` that drives background polling.
- **Favorites / notifications / theme** persist to `localStorage` (keys prefixed `basketball-hub-*`). Any state that needs to survive reload lives here — there is no server-side user store.

### Chat subsystem (`src/app/api/chat/route.ts` + `src/lib/chat/`)

The `/api/chat` route runs a bounded tool-calling loop (max 5 rounds, 60s timeout) against any OpenAI-compatible LLM. Tools defined in `lib/chat/tool-definitions.ts` are executed via `lib/chat/tool-executor.ts`, which calls the same Squadi services. Adding a new chat capability means: (1) add tool definition, (2) add case in `tool-executor`, (3) optionally update `system-prompt.ts`.

## Conventions specific to this repo

- **All upstream responses are validated with Zod** before being returned from `data/` or `services/`. Don't return `unknown` or skip validation — extend the relevant schema in `src/schemas/`.
- **`extractArray(raw)`** in `src/lib/utils.ts` normalizes Squadi responses that may be either a bare array or `{ data: [...] }` — use it when a new endpoint's shape is inconsistent.
- **`import 'server-only'`** at the top of any module that must never be bundled into client code (all files in `src/data/`, `src/lib/server-api-client.ts`, `src/lib/server-config.ts`).
- **`readonly` / immutable types everywhere** — interfaces use `readonly` fields and `readonly T[]` for arrays. Match this style in new code.
- **Dark mode is the default** — `<html class="dark">` with an inline script in `layout.tsx` that reads `localStorage['basketball-hub-theme']` before hydration to avoid FOUC. Do not remove this script.

## Planning directory

`.planning/` is created on demand by `/gsd:*` slash commands (specifically `/gsd:new-project` or `/gsd:new-milestone`) to store milestone state (`PROJECT.md`, `ROADMAP.md`, `STATE.md`, `phases/`, `research/`). If the directory doesn't exist yet, initializing a project or milestone will scaffold it. Treat these files as project source-of-truth for in-flight milestones, not as generic docs.

## CI/CD

A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and on manual dispatch. It installs dependencies, builds, and deploys the static export (`./out`) to GitHub Pages via `actions/deploy-pages`.
