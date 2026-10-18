# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Monaco binding implemented against structural interfaces, plus Monarch tokens for mermaid.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | `bindMonaco(editor, monacoEditor, options)` → `TextPaneBinding`; interfaces `MonacoRangeLike`, `MonacoPositionLike`, `MonacoDisposableLike`, `MonacoModelLike`, `MonacoDecorationsCollectionLike`, `MonacoEditorLike`, `BindMonacoOptions`; re-exports language symbols (see file) |
| `language.ts` | `mermaidMonarchTokens`, `MonacoNamespaceLike`, `registerMermaidLanguage(monaco)` |

## For AI Agents

### Working In This Directory
- `MonacoEditorLike` must remain a subset of the real `IStandaloneCodeEditor`; the test's `_conformance` assignment enforces it. If you widen the surface, run typecheck.
- `bindMonaco` throws `'bindMonaco: the Monaco editor has no model'` if `getModel()` is null; the model is captured once (swapping models is unsupported).
- Offset⇄position via `model.getPositionAt/getOffsetAt`; adapter uses `model.applyEdits`, `model.setValue`, `decorations.set` with `inlineClassName`, and `revealPositionInCenter`.
- Options: `highlightClassName` (default `mw-monaco-entity`), `bindUndoKeys` (default true; set false to supply your own key routing).
- Caret → entity only when `ev.reason === CURSOR_EXPLICIT` (3, `CursorChangeReason.Explicit`), so edit-driven cursor moves don't change selection. Value is hard-coded because there is no monaco import.
- Undo keys: `onKeyDown` matches `(metaKey||ctrlKey) && browserEvent.key.toLowerCase()==='z'`, calls `preventDefault`/`stopPropagation`, shift → redo. Matched on the key string because Monaco's keyCode maps synthesized events to Unknown.
- `dispose()` disposes subscriptions, clears decorations, then disposes the inner binding. The returned object wraps the inner binding (`applying` is a getter).
- `registerMermaidLanguage` is idempotent (checks `getLanguages()` for id `mermaid`). The Monarch grammar is smaller than CodeMirror's (no operators like class relations / ER cardinality, no brackets).

### Testing Requirements
`pnpm --filter @visimer/monaco test`; see `../test/binding.test.ts`.

### Common Patterns
`*Like` structural types; `subs: MonacoDisposableLike[]` collected then disposed together.

## Dependencies

### Internal
`@visimer/core` (`bindTextPane`, `MermaidWysiwygEditor`, `TextPaneBinding`).

### External
None at runtime.

## Manual Notes
