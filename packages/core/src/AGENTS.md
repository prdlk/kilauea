# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Source of `@kilauea/core`. Top-level files hold the generic machinery (line scanning, type detection, the editor/history class, the text pane binding); each subdirectory implements one diagram type's projection and ops.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Sole public entry: re-exports types, `bindTextPane`, `DIAGRAM_TYPES`/`detectDiagramType`, text helpers, and each type's parse/graph/ops symbols plus `MermaidWysiwygEditor`/`parse` |
| `types.ts` | `Span`, `TextEdit`, `Origin` (`'code'｜'canvas'｜'api'｜'history'｜'external'`), `Capability`, `DiagramTypeInfo`, `LineKind`, `LineInfo`, `Diagnostic` |
| `text.ts` | Lossless CST primitives: `scanLines`, `classifyLines` (frontmatter `---`, `%%{` directive, `%%` comment, header, statement), `applyEdits` (throws on overlap, returns inverse edits), `diffText` (single prefix/suffix edit), `spanContains`, `mapOffset` |
| `registry.ts` | `DIAGRAM_TYPES` (33 types: 22 `'edit'` plus 11 pele-only `'render'` types, each with regex `match`, `capability: 'edit'｜'render'`, `docsUrl`) and `detectDiagramType(headerLine)` |
| `editor.ts` | `parse(code) → ParseResult` and `MermaidWysiwygEditor` (code, selection, undo/redo, events, `dispatch`, `deleteEntities`, `entityExists`, `entityRanges`, `entityAt`) |
| `textpane.ts` | `TextPaneAdapter`, `TextPaneBinding`, `bindTextPane(editor, adapter)` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `flowchart/` | flowchart/graph parse, graph, ops (see `flowchart/AGENTS.md`) |
| `sequence/` | participants, messages, notes, fragments (see `sequence/AGENTS.md`) |
| `state/` | stateDiagram states/transitions (see `state/AGENTS.md`) |
| `class/` | classDiagram classes/members/relations (see `class/AGENTS.md`) |
| `er/` | erDiagram entities/attributes/relations (see `er/AGENTS.md`) |
| `pie/` | single-file pie handler (see `pie/AGENTS.md`) |
| `gantt/` | single-file gantt handler (see `gantt/AGENTS.md`) |
| `lineitems/` | generic per-line handler for 15 chart types (see `lineitems/AGENTS.md`) |

## For AI Agents

### Working In This Directory
**Plugging a diagram type in** (there is no plugin interface; wiring is explicit in `editor.ts`):
1. Add/adjust the entry in `DIAGRAM_TYPES` (`registry.ts`); `capability: 'edit'` is metadata for consumers. The pele-only types (swimlane, agentflow, railroad, treeview, cynefin, wardley, eventmodeling, usecase, venn, ishikawa, info) are `'render'` only (no graph; generic CST).
2. Create `<type>/{parse,graph,ops}.ts` (or a single `index.ts`) exporting `buildXGraph(lines, headerIndex)`, `compileXOp(ctx: {code, lines, graph}, op)`, `xEntitySpans(graph, lines, id)`, `xEntityAt(graph, lines, offset)`.
3. In `editor.ts`: import them, add the op union to `EditorOp`, add a nullable field to `ParseResult`, add a branch in `parse()` (graph building is wrapped in try/catch; a throw degrades to render-only with all graph fields `null`), add a prefix branch in `dispatch()` (ops are routed by `op.type` prefix: `seq.`, `st.`, `cl.`, `er.`, `pie.`, `gantt.`, `li.`; everything unprefixed is flowchart), and extend `deleteEntities`, `entityExists`, `entityRanges`, `entityAt`.
4. Re-export from `index.ts`.

**Flow of an edit:** `setCode`/`applyEdits` → `commit` → `parse(code)` rebuilds `ParseResult` (`lines`, `headerIndex`, `typeInfo`, one graph) → emits `change`. `dispatch(op, origin='canvas')` calls the type's `compileXOp` against the *current* `lines`/graph, gets `{edits, created?}`, runs `applyEdits`, and selects `created` ids. Ops return `null` for unknown ids/invalid input; they must emit the narrowest possible edits (replace one span, insert/delete one line) so comments, indentation and untouched statements survive.
- `setCode` computes one `diffText` edit and coalesces consecutive `origin: 'code'` transactions within `coalesceMs` (default 750) into one undo entry.
- `undo`/`redo` replay `inverse` edits and emit `change` with `origin: 'history'`; selection is restored then pruned via `entityExists`.
- `entityRanges`/`entityAt` pick the single non-null graph; `entityAt` is what `bindTextPane.notifyCaretMove` uses.
- `deleteEntities` sorts connection ids (`edge:`, `event:`, `trans:`, `rel:`, `erel:`) before node-like ids.
- `applyEdits` in `text.ts` throws `Error('Overlapping text edits')`; ops that emit multiple edits must not overlap.

### Testing Requirements
`pnpm --filter @kilauea/core test`. Add tests in `../test/` for any new op; use `new MermaidWysiwygEditor({code})`, `editor.dispatch(...)`, assert `editor.code`.

### Common Patterns
- Context type per type: `{ code, lines, graph }` (`FlowOpContext`, `ClOpContext`, `ErOpContext`, `PieOpContext`, `GanttOpContext`, `LiOpContext`); `OpResult { edits, created? }` is defined in `flowchart/ops.ts`.
- Helpers repeated per ops file: `bodyIndent`, `insertAfterLine`/`insertLinesAfter`, `deleteLine`/`deleteLineEdit`. Deleting the last line removes the preceding `\n` instead of the trailing one.
- Inserts anchor at `line.end` of the last relevant line with text `\n${indent}...`, `created` ids use `<prefix>:<anchorIndex+1>` for line-index-keyed entities.

## Dependencies

### Internal
Only `./types`, `./text`, `./registry`, and subdirectories; no other workspace package.

### External
None at runtime.

## Manual Notes
