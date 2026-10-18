# packages

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
The five published `@kilauea/*` libraries, all at version 1.1.3 and versioned together through a changesets `fixed` group. `core` is the headless engine. The other four layer a canvas, code-editor bindings, or React bindings on top of it.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `core/` | `@kilauea/core`: headless engine (lossless CST, semantic graphs, ops → minimal text edits, unified history, `bindTextPane`); no runtime deps (see `core/AGENTS.md`) |
| `dom/` | `@kilauea/dom`: `MermaidCanvasView`, which renders through pele (`pele ^1.6.0`, bundled), correlates SVG to graph entities, and handles gestures and popovers (see `dom/AGENTS.md`) |
| `codemirror/` | `@kilauea/codemirror`: CodeMirror 6 binding plus Mermaid language; `@codemirror/*` are peer deps (see `codemirror/AGENTS.md`) |
| `monaco/` | `@kilauea/monaco`: Monaco binding against a structural interface, with no `monaco-editor` dependency (see `monaco/AGENTS.md`) |
| `react/` | `@kilauea/react`: `<MermaidWysiwyg>` component and `useMermaidEditor` hook; `react >=18` peer (see `react/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every package has the same layout: `src/index.ts(x)` entry, `tsconfig.json` extending `../../tsconfig.base.json`, `README.md`, `CHANGELOG.md` (written by changesets, don't hand-edit), `test/` (except `react`).
- `exports`/`main`/`types` point to `src/` for workspace use. `publishConfig` redirects them to `dist/index.js` / `dist/index.d.ts`. Any new entry point must be added to both.
- Inter-package deps use `workspace:*`. Allowed direction: `core` ← (`dom`, `codemirror`, `monaco`); `dom` ← `react`. Never import `dom` from `core`.
- `core/tsconfig.json` sets `lib: ["ES2022"]` with no `DOM`, so `tsc` rejects DOM globals in core. The other packages add `DOM`/`DOM.Iterable`; `react` also sets `jsx: react-jsx`.
- A change to a public API in one package usually ripples to the bindings and the apps. Check `apps/playground`, `apps/js-playground`, and `apps/site` for callers.

### Testing Requirements
- Per package: `pnpm --filter @kilauea/<name> test` (vitest) and `pnpm --filter @kilauea/<name> typecheck`.
- `pnpm build` builds all packages with tsup. Run it before relying on `dist/` (only needed for publishing).

### Common Patterns
- ESM-only output, `.d.ts` and sourcemaps via tsup.
- Editor/UI libraries (CodeMirror, Monaco, React) are supplied by the consumer, never bundled. The renderer is the exception: `@kilauea/dom` depends on `pele` directly, so no Mermaid install is needed.

## Dependencies

### Internal
- `../tsconfig.base.json`: shared compiler options.
- `../.changeset/config.json`: fixed version group for all five packages.

### External
- `vitest`, `tsup`, `typescript` (dev).

## Manual Notes
