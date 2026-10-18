# monaco

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
`@kilauea/monaco` (v1.1.3): Monaco binding for kilauea implementing core's `bindTextPane`. The consumer creates and owns the Monaco editor; this package wires two-way sync, entity decorations, caret → entity selection, shared undo, and optional Monarch highlighting. It has **no dependency on `monaco-editor`**, even for types.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | scripts `typecheck`/`build` (tsup)/`test` (vitest); only runtime dep is `@kilauea/core`; no peerDependencies |
| `tsconfig.json` | extends base; `lib` ES2022 + DOM; includes `src` and `test` |
| `README.md` | usage of `bindMonaco`, `registerPeleLanguage`, `.mw-monaco-entity` CSS |
| `CHANGELOG.md` | changesets-generated |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | binding + language (see `src/AGENTS.md`) |
| `test/` | fake-Monaco tests + compile-time conformance (see `test/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Policy: never import from `monaco-editor` in `src/`. `monaco-editor ^0.55.1` is a devDependency used only by the test for a type-level conformance check. Do not add it (or a peer dep) to runtime deps.
- Do not hand-edit `CHANGELOG.md`/`version`; use changesets.

### Testing Requirements
`pnpm --filter @kilauea/monaco test` and `pnpm --filter @kilauea/monaco typecheck` (typecheck also guards the conformance canary, because `tsconfig.json` includes `test`).

### Common Patterns
Structural `*Like` interfaces instead of Monaco types; adapter built on `bindTextPane`.

## Dependencies

### Internal
`@kilauea/core`.

### External
Dev only: `monaco-editor ^0.55.1`, `vitest ^2.1.9`, `typescript ^5.6.3`.

## Manual Notes
