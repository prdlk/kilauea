# core

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
`@visimer/core` is the headless, zero-DOM engine of Visimer. Text is the single source of truth: each Mermaid source is scanned into a lossless line CST, projected into a per-diagram-type semantic graph, and visual operations (ops) are compiled into minimal `TextEdit`s applied through one undo/redo history. It also ships `bindTextPane`, the five-method adapter contract that `@visimer/codemirror` and `@visimer/monaco` implement. Published as ESM via tsup.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Scripts `test` (`vitest run`), `typecheck` (`tsc -p tsconfig.json`), `build` (`tsup src/index.ts --format esm --dts --sourcemap --out-dir dist`); only devDependencies (`typescript ^5.6.3`, `vitest ^2.1.9`) |
| `tsconfig.json` | Extends `../../tsconfig.base.json`, `lib: ["ES2022"]` (no DOM), includes `src` and `test` |
| `README.md` | Public usage: `MermaidWysiwygEditor` quick start and the `bindTextPane` adapter contract |
| `CHANGELOG.md` | Changesets-generated; do not hand-edit (all `@visimer/*` packages are in a `fixed` version group) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Engine source: editor, registry, text primitives, text pane, per-type modules (see `src/AGENTS.md`) |
| `test/` | Vitest suites for parsing, ops, editor state, text pane (see `test/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Everything public is re-exported from `src/index.ts`; a new symbol is not part of the API until added there. Consumers (`@visimer/dom`, `@visimer/react`, editor bindings) import only from `@visimer/core`.
- No DOM, no runtime dependencies. Do not import `document`/`window` or add `dom` to `lib`.
- The invariant: every mutation is a `TextEdit[]` applied by `MermaidWysiwygEditor.applyEdits`; there is no separate model state to keep in sync. Graphs are rebuilt by `parse()` after each change.
- Dist output (`dist/`) is build output; edit `src/` only.

### Testing Requirements
- `pnpm --filter @visimer/core test` (vitest run), `pnpm --filter @visimer/core typecheck`, `pnpm --filter @visimer/core build`.
- Tests live in `test/*.test.ts` and import from `../src`. SVG correlation/canvas behavior is NOT here (see root `TESTING.md`).

### Common Patterns
- `parse → graph → ops → edits`: `parseXStatement` (per-line), `buildXGraph` (whole doc), `compileXOp` (op → `{edits, created?}`), `xEntitySpans`/`xEntityAt` (selection <-> text ranges).
- Entity ids are strings with type prefixes (`node:`, `edge:`, `participant:`, `event:`, `state:`, `trans:`, `class:`, `rel:`, `entity:`, `erel:`, `slice:`, `task:`, `item:`, `subgraph:`).

## Dependencies

### Internal
None. Depended on by `packages/dom`, `packages/codemirror`, `packages/monaco`, `packages/react`, and the apps.

### External
- `typescript ^5.6.3`, `vitest ^2.1.9` (dev only); `tsup ^8.5.1` from the root.

## Manual Notes
