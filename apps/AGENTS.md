# apps

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Private (never published) Vite applications that consume the `@kilauea/*` workspace packages. They are the manual test harnesses and the public marketing site; nothing here ships to npm.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `playground/` | React playground (port 5173); the manual test harness for every diagram type (see `playground/AGENTS.md`) |
| `js-playground/` | Vanilla TS playground (port 5174) with no React; owns the shared `SAMPLES` list (see `js-playground/AGENTS.md`) |
| `site/` | Marketing site + `/playground` page, deployed to Vercel (see `site/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every app declares `@kilauea/*` as `workspace:*` dependencies and lists them in vite `optimizeDeps.exclude`, so Vite transforms the package sources directly instead of pre-bundling them. There are no path aliases in the vite configs.
- Root scripts: `pnpm dev` -> `playground`, `pnpm dev:js` -> `js-playground`, `pnpm dev:site` -> `site`, `pnpm build:site` -> site build. Root `pnpm build` only builds `packages/*`.
- Port clash: `js-playground` and `site` both use 5174 with `strictPort: true`; do not run them at once. `playground` uses 5173.
- None of these apps defines a `test` script, so `pnpm test` skips them. Use `pnpm typecheck` (each has `tsc -p tsconfig.json`).
- Per `TESTING.md`, SVG correlation, canvas gestures and React bindings have no automated tests; verify them by hand in `playground`.

### Testing Requirements
`pnpm typecheck` (or `pnpm --filter <app> typecheck`). Behaviour is checked manually via `pnpm dev`.

### Common Patterns
- Each app registers ZenUML lazily with `mermaid.registerExternalDiagrams([m.default])` via an `ensureZenuml()` memoised promise.

## Dependencies

### Internal
`packages/core`, `packages/dom`, `packages/codemirror`, `packages/monaco` (playground only), `packages/react`.

### External
vite ^6.3.5, mermaid ^11.16.1, react ^18.3.1, typescript ^5.6.3.

## Manual Notes
