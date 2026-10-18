# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Contains `index.tsx`, the whole React API (~200 lines).

## Key Files
| File | Description |
|------|-------------|
| `index.tsx` | Exports `usePeleEditor`, `PeleWysiwyg`, `PeleCanvas`, props types `PeleWysiwygProps`/`PeleCanvasProps`; re-exports `PeleWysiwygEditor` (core), `PeleCanvasView` and the `RenderOptions` type (dom, from pele); internal `useRenderOptions` hook |

## For AI Agents

### Working In This Directory
- `usePeleEditor(initialCode)` → `{ editor, code, selection }`. Editor created once via `useState` initializer; `code` and `selection` use `useSyncExternalStore` on `editor.on('change')` / `'selectionChange'`.
- `PeleWysiwyg` props: `code`, `onCodeChange`, `renderOptions`, `accentColor`, `readOnly`, `panZoom`, `tool`, `hooks`, `onSelectionChange`, `onReady(editor, view)`, `className`, `style`. It owns its editor and view, both created once in a mount-only effect (`[]`); every other prop syncs through its own effect. `panZoom` and the initial `code` are only read at creation. External `code` changes go through `editor.setCode(code, 'external')`, and `onCodeChange` is suppressed for origin `'external'` (prevents echo loops). Callbacks are held in refs (`onCodeChangeRef`, `onSelectionChangeRef`) so they can change without remounting; `onReady` is captured at creation only.
- `PeleCanvas` takes an `editor` you own; the view is recreated on `[editor]`. It has no `tool` prop (use `onReady` view `setTool`) and `onReady(view)` takes only the view.
- `renderOptions` go through `useRenderOptions`: shallow-compared per key, so inline literals with primitive values do not re-render; a changed key calls `view.setRenderOptions` (replaces the options, re-renders). Function-valued options (`icons`, `measurer`) must be memoized by the caller. Colors are `--pele-*` CSS variables on `style`/ancestors, not props. Hooks pass through `view.setHooks`; memoize `hooks` to avoid needless effect runs.
- Host div has `minHeight: 240` merged with `style`; the canvas needs a sized container.
- Effects run on the client only; no SSR-time DOM access in render.

### Testing Requirements
None automated. `pnpm --filter @kilauea/react typecheck`; manual check in `apps/playground`.

### Common Patterns
Refs for the latest callbacks, effect-per-prop syncing, `origin: 'external'` to mark controlled updates, `eslint-disable react-hooks/exhaustive-deps` on creation effects.

## Dependencies

### Internal
`@kilauea/core` (`PeleWysiwygEditor`), `@kilauea/dom` (`PeleCanvasView`, `RenderOptions`, `Tool`, `ViewHooks`).

### External
`react >=18` (peer). Renders through `@kilauea/dom`, which depends on `pele ^1.6.0`; the React package has no direct pele import beyond the `RenderOptions` type.

## Manual Notes
