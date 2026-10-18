# site

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Public marketing site (visimer.com), a client-rendered Vite SPA deployed on Vercel. One bundle serves three routes: `/` (landing), `/playground` and `/hero-loop`. Run with `pnpm dev:site` (http://localhost:5174, `strictPort`); build with `pnpm build:site`.

## Key Files
| File | Description |
|------|-------------|
| `index.html` | SEO/OG/JSON-LD metadata, font links, and a `hero-boot` HTML-comment marker inside `#root` |
| `vite.config.ts` | React plugin + `heroBoot()` plugin that replaces the `hero-boot` HTML-comment marker with `heroBootHtml()` (throws if marker is missing); optimizeDeps excludes workspace packages |
| `vercel.json` | Vite framework, corepack pnpm install/build, output `dist`; rewrites `/ingest/*` to PostHog US hosts and `/playground` to `/index.html` |
| `.env.example` | `VITE_POSTHOG_KEY` (empty disables analytics), `VITE_POSTHOG_HOST` (default `/ingest`) |
| `.gitignore` | `.vercel`, `.env*` except `.env.example` |
| `README.md` | Short intro and local dev notes |
| `package.json` | Scripts `dev`, `build`, `typecheck`; deps core, dom, codemirror, react (`workspace:*`), posthog-js, mermaid |
| `tsconfig.json` | Extends base, `jsx: react-jsx` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | App code (see `src/AGENTS.md`) |
| `public/` | Static assets (see `public/AGENTS.md`) |
| `scripts/` | `record-hero.tsx` recorder (see `scripts/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- The hero's pre-React markup is generated from `src/hero-diagram.ts`; never hand-edit it in `index.html`.
- Analytics are optional and site-only; never import `analytics.ts` from packages or playgrounds.
- Adding a route requires both `src/main.tsx` and a `vercel.json` rewrite (as done for `/playground`).
- The Vercel build runs `pnpm build` in this dir (vite build), unlike root `pnpm build`.

### Testing Requirements
`pnpm --filter site typecheck`, `pnpm build:site`. No automated tests.

### Common Patterns
Package source edits hot-reload (workspace packages excluded from pre-bundle).

## Dependencies

### Internal
`@visimer/core`, `@visimer/dom`, `@visimer/codemirror`, `@visimer/react`.

### External
posthog-js ^1.407.2, react ^18.3.1, mermaid ^11.16.1, @codemirror/* (state ^6.7.1, view ^6.43.6, commands ^6.10.4, language ^6.12.4), vite ^6.3.5.

## Manual Notes
