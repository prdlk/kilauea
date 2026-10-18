# codemirror

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
`@kilauea/codemirror` (v1.1.3): CodeMirror 6 pane for kilauea. It is the reference implementation of core's `bindTextPane` adapter: two-way code sync, entity highlight decorations, caret → entity selection, mermaid syntax highlighting, and undo routed to the engine's unified history.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | scripts `typecheck`/`build` (tsup esm+dts)/`test` (vitest); `main`/`types` point at `src/index.ts`, `publishConfig` swaps to `dist` |
| `tsconfig.json` | extends `../../tsconfig.base.json` |
| `README.md` | usage: `new MermaidCodeMirror(hostElement, editor)` |
| `CHANGELOG.md` | changesets-generated; version moves in lockstep (fixed group) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | implementation (see `src/AGENTS.md`) |
| `test/` | jsdom tests against a real EditorView (see `test/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- All five `@codemirror/*` / `@lezer/highlight` packages are **peerDependencies** (and devDependencies for tests); only `@kilauea/core` is a real dependency (`workspace:*`). Never move CodeMirror packages into `dependencies`.
- Do not hand-edit `CHANGELOG.md` or `version`; use changesets.
- `sideEffects: false`; publish `files` are `dist` and `src`.

### Testing Requirements
`pnpm --filter @kilauea/codemirror test` and `pnpm --filter @kilauea/codemirror typecheck`.

### Common Patterns
Thin adapter over `bindTextPane`; all sync logic lives in core.

## Dependencies

### Internal
`@kilauea/core` (`bindTextPane`, `MermaidWysiwygEditor`, `Span`, `TextPaneBinding`).

### External
Peers: `@codemirror/commands ^6.6.1`, `@codemirror/language ^6.10.3`, `@codemirror/state ^6.4.1`, `@codemirror/view ^6.34.1`, `@lezer/highlight ^1.2.1`. Dev: `vitest ^2.1.9`, `jsdom ^25.0.1`, `typescript ^5.6.3`.

## Manual Notes
