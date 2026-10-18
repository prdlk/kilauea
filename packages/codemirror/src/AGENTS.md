# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Implementation of the CodeMirror 6 binding: the `PeleCodeMirror` class and a StreamLanguage pele highlighter.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | `PeleCodeMirror` class (`view`, `destroy()`), `highlightField` StateField, `setHighlights` StateEffect, `baseTheme`; re-exports `peleLanguage` |
| `language.ts` | `peleLanguage()` → `[StreamLanguage, syntaxHighlighting(classHighlighter)]`; regexes `HEADERS`, `KEYWORDS`, `OPERATORS` |

## For AI Agents

### Working In This Directory
- Public API: `PeleCodeMirror(host, editor, extraExtensions = [])` and `peleLanguage()`. Only these are exported from `index.ts`.
- Constructor order matters: the `EditorView` is built first with an `updateListener` that calls `this.binding.notifyTextChange()` on `docChanged`, else `notifyCaretMove(selection.main.head)` on `selectionSet`; `this.binding` is assigned afterwards via `bindTextPane` adapter (`getText`, `applyEdits`, `setText`, `setHighlights`, `revealPosition`).
- `applyEdits` dispatches all edits in one transaction (`from/to/insert`) since core pre-sorts and clamps against the current text.
- Highlights: the `highlightField` maps decorations through `tr.changes` and on `setHighlights` drops spans with `end > newDoc.length`; mark class is `mw-cm-entity`, themed with `--mw-accent`, then `--pele-accent`, then pele.run's `#205ea6`, via `color-mix`.
- Keymap: `Mod-z` / `Mod-Shift-z` call `binding.undo/redo` (engine history, not CM history) and are placed before `defaultKeymap`. No CM \`history()\` extension is installed; do not add one (it would create a second undo stack).
- `revealPosition` deliberately sets `scrollDOM.scrollTop` manually rather than `EditorView.scrollIntoView`, which would scroll ancestors/the page. Keep that.
- `extraExtensions` is typed `unknown[]` and spread with a cast, to avoid exposing duplicate `@codemirror/state` types.
- `destroy()` must dispose the binding before `view.destroy()`.
- Token names in `language.ts` (comment, string, meta, heading, keyword, operator, number, bracket) are styled through `classHighlighter` CSS classes; ordering of the `stream.match` checks in `token()` is significant (headers before keywords before operators).

### Testing Requirements
`pnpm --filter @kilauea/codemirror test`; covered by `../test/binding.test.ts`. `language.ts` has no direct tests.

### Common Patterns
`StateField.define` + `StateEffect.define<Span[]>` + `Decoration.mark`; `EditorView.updateListener.of`; `EditorView.baseTheme`.

## Dependencies

### Internal
`@kilauea/core`.

### External
`@codemirror/state`, `@codemirror/view`, `@codemirror/commands` (`defaultKeymap`), `@codemirror/language` (`StreamLanguage`, `syntaxHighlighting`), `@lezer/highlight` (`classHighlighter`).

## Manual Notes
