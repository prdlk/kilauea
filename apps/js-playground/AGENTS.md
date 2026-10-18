# js-playground

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Framework-free playground showing the headless API: `@visimer/core` + `@visimer/dom` + `@visimer/codemirror` driven from plain TypeScript and hand-built DOM. Run with `pnpm dev:js` (http://localhost:5174, `strictPort`).

## Key Files
| File | Description |
|------|-------------|
| `index.html` | Static shell: topbar (theme select, accent colour, read-only checkbox), `#sidebar`, `#toolbar`, `#canvas`, `#inspector`, `#codepane`, `#statusbar`; loads `/src/main.ts` |
| `vite.config.ts` | Port 5174 strict; excludes core, dom and codemirror workspace packages from optimizeDeps; pre-bundles pele (`@visimer/dom > pele`) and CodeMirror deps |
| `tsconfig.json` | Extends `../../tsconfig.base.json`, DOM libs, `vite/client` types |
| `package.json` | Scripts `dev`, `build`, `typecheck`; `workspace:*` on core, dom, codemirror |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application code (see `src/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Element ids in `index.html` are looked up by `main.ts` with a `$<T>(sel)` helper; renaming one breaks startup.
- Depends on built-in workspace sources through `workspace:*`; no aliases.
- `playground/src/App.tsx` imports `SAMPLES` from `../../js-playground/src/samples`, so changes to samples affect both playgrounds.

### Testing Requirements
`pnpm --filter js-playground typecheck`. No automated tests; manual check with `pnpm dev:js`.

### Common Patterns
Per-type toolbar buttons call `editor.dispatch({ type: '...' })` (e.g. `gantt.addTask`) then `view.editEntityLabel(created)`.

## Dependencies

### Internal
`@visimer/core`, `@visimer/dom`, `@visimer/codemirror`.

### External
@codemirror/{state ^6.4.1, view ^6.34.1, commands ^6.6.1, language ^6.10.3}, @lezer/highlight ^1.2.1, vite ^6.3.5.

## Manual Notes
