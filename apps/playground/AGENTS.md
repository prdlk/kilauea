# playground

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
React playground and the primary manual test harness: it exercises every diagram type in `SAMPLES`, the `@kilauea/react` bindings (`PeleCanvas`, `usePeleEditor`), and both text panes (CodeMirror and Monaco). `pnpm dev` (root) starts it on http://localhost:5173 (`strictPort`).

## Key Files
| File | Description |
|------|-------------|
| `index.html` | `#root` + `/src/main.tsx` |
| `vite.config.ts` | `@vitejs/plugin-react`; optimizeDeps excludes core, dom, codemirror, react workspace packages; pre-bundles pele (`@kilauea/dom > pele`), react, react-dom |
| `tsconfig.json` | Extends base, `jsx: react-jsx` |
| `package.json` | `workspace:*` on codemirror, core, dom, monaco, react; monaco-editor ^0.55.1 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | React app code (see `src/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- This is where uncovered areas (SVG correlation, canvas gestures, React bindings) are verified by hand; after changing `packages/dom` or `packages/react`, click through the samples here.
- Samples come from `../js-playground/src/samples` (not duplicated).
- Package edits hot-reload because workspace packages are excluded from pre-bundling.

### Testing Requirements
`pnpm --filter playground typecheck`. No automated tests.

### Common Patterns
Palettes (`ink`, `dark`, `light`, `forest`, `neutral`) are sets of `--pele-*` CSS variables in `PALETTES`, applied as inline style on the `PeleCanvas` host.

## Dependencies

### Internal
`@kilauea/core`, `@kilauea/dom`, `@kilauea/react`, `@kilauea/codemirror`, `@kilauea/monaco`; `../js-playground/src/samples`.

### External
react/react-dom ^18.3.1, monaco-editor ^0.55.1, vite ^6.3.5, @vitejs/plugin-react ^4.3.4.

## Manual Notes
