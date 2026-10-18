# test

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Tests for `bindMonaco` using an in-memory fake Monaco (node environment, no jsdom) plus a compile-time conformance check against the real `monaco-editor` types.

## Key Files
| File | Description |
|------|-------------|
| `binding.test.ts` | `_conformance: (e: monaco.editor.IStandaloneCodeEditor) => MonacoEditorLike` type canary (`import type` only); `fakeMonaco(initial)` implements model, decorations, cursor/key listeners; tests: minimal edits from engine ops, model edits without echo, decorations + reveal, explicit vs edit-driven caret (`reason` 3 vs 0), undo keys via `pressUndo(shift?)`, dispose unhooks and clears, `registerMermaidLanguage` idempotent |

## For AI Agents

### Working In This Directory
- The fake implements exactly the `MonacoEditorLike` surface; extend it when the interface grows.
- A monaco-editor upgrade that changes consumed shapes fails to compile at `_conformance` — this is the drift detector, so `pnpm typecheck` matters as much as `test`.
- Real Monaco is never instantiated (no DOM/workers).

### Testing Requirements
`pnpm --filter @kilauea/monaco test`; `pnpm --filter @kilauea/monaco typecheck` for the conformance canary.

### Common Patterns
`fake.moveCursor(offset, reason?)`, `fake.pressUndo(true)`, `fake.state.highlights`, `fake.text`.

## Dependencies

### Internal
`@kilauea/core`, `../src`.

### External
`vitest ^2.1.9`, `monaco-editor ^0.55.1` (types only).

## Manual Notes
