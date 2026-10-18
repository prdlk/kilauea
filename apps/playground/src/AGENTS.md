# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Source of the React playground.

## Key Files
| File | Description |
|------|-------------|
| `main.tsx` | `createRoot(#root).render(<App />)`, imports `app.css` |
| `App.tsx` | `App` (sample/palette/read-only state), `Workspace` (uses `usePeleEditor(code)`, `PeleCanvas`, tool state, pane switch), `TypeTools`, `DirectionSelect`, `CodePane` (wraps `PeleCodeMirror`), `useEditorCode`, `PALETTES` |
| `MonacoPane.tsx` | Lazily imports `monaco-editor`, sets `MonacoEnvironment` worker, calls `registerPeleLanguage`, defines `ink-dark`, wires `bindMonaco(editor, me)` |
| `app.css` | Styles |

## For AI Agents

### Working In This Directory
- `Workspace` holds a `pane` state (`'codemirror' | 'monaco'`) so both editor bindings can be tested against the same editor.
- `MonacoPane`: the app owns Monaco setup (lazy import, worker, theme, `editContext: false`); the package owns sync via `bindMonaco`. Dispose binding and Monaco in cleanup; a `disposed` flag guards the async setup.
- Theme changes set `--pele-*` CSS variables via the `PeleCanvas` `style` prop (applied live, no re-render).
- Toolbar subscribes to the editor so undo/redo/selection state stays live.

### Testing Requirements
`pnpm --filter playground typecheck`; manual via `pnpm dev`.

### Common Patterns
`editor.dispatch({ type: 'seq.addParticipant', ... })`, `view?.addNode(shape)`, `editor.deleteEntities(editor.selection)`.

## Dependencies

### Internal
`@kilauea/core`, `@kilauea/dom` (types), `@kilauea/react`, `@kilauea/codemirror`, `@kilauea/monaco`.

### External
react, monaco-editor.

## Manual Notes
