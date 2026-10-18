# lineitems

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
The generic handler for the long tail of chart-style diagram types that have no dedicated semantic graph. Every statement line becomes an editable item; a per-type config derives the text used to correlate the item with its rendered SVG element. Ops are routed here when `op.type` starts with `li.`.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | `LINE_ITEM_CONFIGS: Record<typeId, {match(trimmed), addTemplate}>`; `buildLineItemsGraph(lines, headerIndex, typeId)` → `LineItemsGraph`; `LineItemOp`; `compileLineItemOp`; `lineItemSpans`; `lineItemAt` |

## For AI Agents

### Working In This Directory
- Covered type ids (keys of `LINE_ITEM_CONFIGS`): `journey`, `timeline`, `quadrant`, `kanban`, `mindmap`, `treemap`, `packet`, `sankey`, `radar`, `gitgraph`, `xychart`, `architecture`, `requirement`, `c4`, `block`. `editor.ts` uses `LINE_ITEM_CONFIGS[typeInfo.id]` as the gate in `parse()`, and these ids must match `registry.ts`.
- **To add a type**: add the registry entry, then a config here: `match` returns the label text that appears in the rendered SVG (pele; the dom correlator compares ignoring whitespace since pele wraps labels) (or `null` for code-only lines), `addTemplate` is the line `li.addItem` inserts. No other file changes are required.
- Graph: `LineItem {entityId: 'item:<lineIndex>', text (trimmed line), matchText, lineIndex}`. All `statement` lines except the header and lone `}`/`end` become items. `addTemplate` and `lastContentLine` live on the graph.
- Ops: `li.setLine` (newlines collapsed; empty text deletes the line, keeps indent otherwise), `li.addItem` (default `addTemplate`, indent copied from last item, `'  '` if none, `created: ['item:<anchor+1>']`), `li.deleteItem`.
- Spans cover the line from after indent to line end; `lineItemAt` matches any offset in the full line.
- Helper extractors: `firstQuoted`, `firstBracketed` (`[..]`, `((..))`, `(..)`, `{{..}}`), `beforeColon`, `afterKeyword`.
- Editing is whole-line by design (not structural), so `@visimer/dom` can only offer text-level edits for these types.

### Testing Requirements
`pnpm --filter @visimer/core test`; `test/lineitems.test.ts`.

### Common Patterns
Config-table dispatch instead of per-type modules; entity ids are line-index keyed like pie/gantt.

## Dependencies

### Internal
`../types`.

### External
None.

## Manual Notes
