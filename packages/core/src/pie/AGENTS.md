# pie

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Single-file handler for `pie` charts. Everything (graph, ops, selection mapping) lives in `index.ts` because each slice is one line `"label" : value`. Ops are routed here when `op.type` starts with `pie.`.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | `buildPieGraph` → `PieGraph {headerLine, showData, slices, lastContentLine}`; `PieSlice {entityId: 'slice:<lineIndex>', label, value, lineIndex, labelSpan, valueSpan}`; `PieOp`; `compilePieOp`; `pieEntitySpans`; `pieEntityAt` |

## For AI Agents

### Working In This Directory
- Slices are recognized by `SLICE_RE = /^"([^"]*)"\s*:\s*([\d.]+)\s*$/`; other statement lines (title, etc.) are ignored by the graph and left untouched. `showData` is detected from the header line text.
- Ops: `pie.setValue` (rejects non-finite or negative → `null`), `pie.setLabel` (`"` replaced with `'`), `pie.addSlice` (defaults `New slice`, `10`; inserts after last slice, `created: ['slice:<anchor+1>']`), `pie.deleteSlice`.
- Setters replace only `valueSpan`/`labelSpan`.

### Testing Requirements
`pnpm --filter @visimer/core test`; the `pie` suite is inside `test/er.test.ts`.

### Common Patterns
Returns `{edits, created?}` directly (no dedicated result type); same delete-line logic (remove trailing `\n`, or preceding one on the last line).

## Dependencies

### Internal
`../types`.

### External
None.

## Manual Notes
