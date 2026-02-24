# Technology Stack

**Analysis Date:** 2026-02-24

## Languages

**Primary:**
- TypeScript 5.x - Used throughout entire codebase (server and client)
- JSX/TSX - React component definitions

**Secondary:**
- JavaScript (ES2017 target) - Development tooling configuration
- CSS (Tailwind v4) - Styling

## Runtime

**Environment:**
- Node.js 20 (from `@types/node` configuration)

**Package Manager:**
- npm - `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI framework
- React DOM 19.2.3 - React rendering

**Testing:**
- Jest 30.2.0 - Test runner
- Testing Library React 16.3.2 - Component testing utilities
- Testing Library User Event 14.6.1 - User interaction simulation
- ts-jest 29.4.6 - TypeScript support for Jest

**Build/Dev:**
- TypeScript 5.x - Language compilation
- ESLint 9.x - Code linting with Next.js configuration
- Tailwind CSS 4.x - Utility-first CSS
- PostCSS 4.x (via @tailwindcss/postcss) - CSS processing

## Key Dependencies

**Critical:**
- openai 6.21.0 - LLM client library for OpenAI-compatible providers
- zod 4.3.6 - TypeScript-first schema validation and runtime type checking
- server-only 0.0.1 - Ensures server-only code doesn't bundle to client

**Type Definitions:**
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions
- @types/jest 30.0.0 - Jest type definitions

**Testing Infrastructure:**
- jest-environment-jsdom 30.2.0 - DOM environment for tests
- @jest/globals 30.2.0 - Jest global types

## Configuration

**Environment:**
- Required variables configured in `.env.local`
- Environment validation via Zod schemas in `src/lib/server-config.ts` and `src/lib/config.ts`
- Distinction between:
  - Server-only config: `SQUADI_API_TOKEN`, `SQUADI_API_BASE_URL` (requires SQUADI_ prefix for server)
  - Client-side config: `NEXT_PUBLIC_SQUADI_API_BASE_URL` (NEXT_PUBLIC prefix for browser access)
  - LLM config: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (server-only, supports multiple providers)

**Build:**
- `next.config.ts` - Next.js configuration (minimal, default settings)
- `tsconfig.json` - TypeScript configuration with strict mode enabled, path alias `@/*` → `./src/*`
- `jest.config.ts` - Jest with jsdom environment, 80% coverage threshold enforced
- `eslint.config.mjs` - ESLint with Next.js core-web-vitals and TypeScript configurations
- `postcss.config.mjs` - PostCSS configuration for Tailwind v4

## Platform Requirements

**Development:**
- Node.js 20.x
- npm for dependency management
- TypeScript 5.x compiler
- Modern browser with JavaScript support

**Production:**
- Next.js server deployment (Node.js 20.x compatible environment)
- Environment variables configured for:
  - Squadi Basketball API (API token and base URL)
  - LLM provider (base URL, API key, model name)
- No database or external storage required at deployment (all data fetched from Squadi API)

---

*Stack analysis: 2026-02-24*
