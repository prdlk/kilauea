# test

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Vitest suite for the CodeMirror binding, run against a real CodeMirror 6 `EditorView` in jsdom (no fakes).

## Key Files
| File | Description |
|------|-------------|
| `binding.test.ts` | `// @vitest-environment jsdom`; `mount()` helper builds `MermaidWysiwygEditor` + `MermaidCodeMirror` on a host div. Six tests: engine ops mirrored into view; view edits flow to engine without echo; selection renders `.mw-cm-entity` marks; caret move selects `node:A`; engine undo/redo syncs both surfaces; no sync after `destroy()` |

## For AI Agents

### Working In This Directory
- The jsdom pragma comment on line 1 is required for `EditorView`.
- Always call `cm.destroy()` at the end of each test.
- Fixture: `CODE = 'flowchart TD\\n  A[Start] --> B[End]\\n'`.
- Not covered: keyboard undo (`Mod-z`) keymap, `revealPosition`, `mermaidLanguage` tokens.

### Testing Requirements
`pnpm --filter @visimer/codemirror test`

### Common Patterns
Drive via `editor.dispatch({type:'renameNode',...})`, `editor.setSelection([...], 'canvas')`, `cm.view.dispatch`, and assert `cm.view.state.doc.toString()` equals `editor.code`.

## Dependencies

### Internal
`@visimer/core`, `../src`.

### External
`vitest ^2.1.9`, `jsdom ^25.0.1`.

## Manual Notes
