# site

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Public marketing site (https://kilauea.dev), a client-rendered Vite SPA deployed as a Cloudflare Worker with static assets. One bundle serves three routes: `/` (landing), `/playground` and `/hero-loop`. Run with `pnpm dev:site` (http://localhost:5174, `strictPort`); build with `pnpm build:site`; deploy with `pnpm deploy:site` (`vite build && wrangler deploy`).

## Key Files
| File | Description |
|------|-------------|
| `index.html` | SEO/OG/JSON-LD metadata, font links, and a `hero-boot` HTML-comment marker inside `#root` |
| `vite.config.ts` | React plugin + `heroBoot()` plugin that replaces the `hero-boot` HTML-comment marker with `heroBootHtml()` (throws if marker is missing); optimizeDeps excludes workspace packages |
| `wrangler.jsonc` | Worker `kilauea-site`: pinned `account_id`, `main: src/worker.ts`, assets from `dist` with `single-page-application` fallback, custom domain `kilauea.dev` |
| `src/worker.ts` | Proxies `/ingest/*` to PostHog (`/static/*` → us-assets, rest → us.i.posthog.com); everything else → `env.ASSETS` |
| `.env.example` | `VITE_POSTHOG_KEY` (empty disables analytics), `VITE_POSTHOG_HOST` (default `/ingest`) |
| `.gitignore` | `.env*` except `.env.example` |
| `README.md` | Short intro and local dev notes |
| `package.json` | Scripts `dev`, `build`, `typecheck`, `deploy`; deps core, dom, codemirror, react (`workspace:*`), posthog-js; devDep `wrangler` |
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
- Adding a client route only needs `src/main.tsx`: unknown paths fall back to `index.html` (`not_found_handling`). Server-side paths go in `src/worker.ts`.
- Deploys target the account pinned in `wrangler.jsonc`; a `CLOUDFLARE_ACCOUNT_ID` in the shell is ignored because of it. `wrangler login` (OAuth) is enough; no API token is needed.

### Testing Requirements
`pnpm --filter site typecheck`, `pnpm build:site`. No automated tests.

### Common Patterns
Package source edits hot-reload (workspace packages excluded from pre-bundle).

## Dependencies

### Internal
`@kilauea/core`, `@kilauea/dom`, `@kilauea/codemirror`, `@kilauea/react`.

### External
posthog-js ^1.407.2, react ^18.3.1, mermaid ^11.16.1, @codemirror/* (state ^6.7.1, view ^6.43.6, commands ^6.10.4, language ^6.12.4), vite ^6.3.5.

## Manual Notes
