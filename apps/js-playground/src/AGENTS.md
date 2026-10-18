# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Vanilla-TS source of the playground: one imperative `main.ts` plus the sample diagram list and styles.

## Key Files
| File | Description |
|------|-------------|
| `main.ts` | Wires `PeleWysiwygEditor` (core), `PeleCanvasView` (dom) and `PeleCodeMirror` (codemirror); builds toolbar, inspector, sidebar, status bar |
| `samples.ts` | Exports `Sample { typeId, title, code }` and `SAMPLES` (about 25 entries across flowchart, sequence, class, state, er, journey, gantt, pie, quadrant, kanban, architecture, radar, treemap, ...) |
| `style.css` | Layout and theme styling |

## For AI Agents

### Working In This Directory
- `Sample.typeId` must match a `DiagramTypeInfo` id from `@kilauea/core` (comment in `samples.ts`). Add a sample for every new diagram type; this list is the manual test matrix, also consumed by the React playground.
- `loadSample(index)` creates a fresh `PeleWysiwygEditor({ code })`, a new `PeleCanvasView` and `PeleCodeMirror`. Palette changes go through `applyPalette`, which sets `--pele-*` variables on `#canvas`.
- `buildToolbar()` branches on `editor.result.typeInfo?.id` / `capability === 'edit'` and `editor.result.lineItems`; the toolbar is disabled when not editable or read-only is checked.
- Tools: `setTool('select'|'connect')`; `SHAPES` is the `ShapeId` list for the inspector.
- Rendering is synchronous (pele); `view.validate()` is sync.

### Testing Requirements
`pnpm --filter js-playground typecheck`; manual: `pnpm dev:js`, click each sidebar sample.

### Common Patterns
`editor.dispatch({ type: 'pie.addSlice' })` then `setTimeout(() => view.editEntityLabel(created), 350)`; `editor.deleteEntities(sel)`.

## Dependencies

### Internal
`@kilauea/core` (`PeleWysiwygEditor`, `DIAGRAM_TYPES`, `PARTICIPANT_TYPES`), `@kilauea/dom`, `@kilauea/codemirror`.

### External
None (pele comes in through `@kilauea/dom`).

## Manual Notes
