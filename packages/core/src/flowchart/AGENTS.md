# flowchart

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Full structural support for `flowchart`/`graph` diagrams: a hand-written tokenizer for statements (chains, shapes, edges, subgraphs), a graph projection with node/edge/subgraph entities, and the largest op compiler (nodes, edges, direction, colors, animation, curve). This is the default target of `MermaidWysiwygEditor.dispatch` for any op type without a `seq.`/`st.`/`cl.`/`er.`/`pie.`/`gantt.`/`li.` prefix.

## Key Files
| File | Description |
|------|-------------|
| `parse.ts` | `parseFlowStatement(line)` → `FlowStmt` (`ChainStmt｜SubgraphOpenStmt｜SimpleStmt`); `parseFlowHeader` (keyword, direction, `directionSpan`); `ShapeId`, `SHAPE_DELIMS` (open/close delimiters per shape), `NodeRef`, `EdgeSeg`, `EdgeLine` (`solid｜thick｜dotted｜invisible`), `EdgeArrow` (`arrow｜open｜circle｜cross`), `DIRECTIONS` |
| `graph.ts` | `buildFlowGraph(lines, headerIndex)` → `FlowGraph` (`nodes`, `edges`, `subgraphs`, `nodeById`, `statements`, `lastContentLine`); `entitySpans`, `entityAtOffset` |
| `ops.ts` | `compileFlowchartOp(ctx: FlowOpContext, op: FlowchartOp): OpResult｜null`; exports `OpResult`, `EdgeAnimation` (`none｜slow｜fast`), `FlowCurve` (`basis｜natural｜linear`) |

## For AI Agents

### Working In This Directory
- Entity ids: `node:<mermaidId>`, `edge:<src>-><tgt>#<n>` (n = occurrence among same endpoints; `FlowEdge.order` is document/render order), `subgraph:<id>`. `FlowOpContext` is `{code, lines, graph}`.
- A node may be mentioned on many lines: `FlowNode.refs: NodeRefSite[]`; `primary` is the last *shaped* ref and owns shape/label edits. A line is a `ChainStmt` of node refs and `EdgeSeg`s (`A --> B --- C`), so edge edits (`setEdgeLabel`, `setEdgeStyle`, `reverseEdge`, `deleteEdge`) patch one segment span rather than rewriting the line.
- Ops: `addNode`, `connect`, `renameNode`, `setNodeShape`, `setEdgeLabel`, `setEdgeStyle` (line, `arrowEnd`, `arrowStart`), `setDirection`, `deleteNode`, `deleteEdge`, `renameSubgraph`, `setNodeColor` (`fill｜stroke｜color`, `null` clears), `setEdgeColor`, `setEdgeAnimation`, `setFlowCurve`, `reverseEdge`, `duplicateNode`.
- Label printing goes through `printLabel`: `"` becomes `'`, and labels matching `NEEDS_QUOTE` are quoted. Edge operator text is built by `edgeOpString(line, arrowEnd, arrowStart)`; note the comment there: a start head with no end head is only representable for some lines, so `arrowStart` should accompany a non-`open` `arrowEnd`.
- Helpers local to `ops.ts`: `bodyIndent`, `insertLinesAfter`, `deleteLineEdit`, `replaceLineEdit`, `slice`. Mixed-statement edits must keep edits non-overlapping (`applyEdits` throws otherwise).
- Edge colors/animation/curve are written as Mermaid `linkStyle`/edge-id/`%%{init}` style statements appended in the doc; check existing implementation in `ops.ts` before changing.

### Testing Requirements
`pnpm --filter @kilauea/core test`. Covered by `test/core.test.ts` (`flowchart parsing`, `ops → minimal text edits`, `editor state`).

### Common Patterns
Parse is purely lexical per line (`LineInfo` → stmt with absolute `Span`s); graph aggregates stmts into `statements: Map<lineIndex, FlowStmt>`; ops read spans from the graph and emit `{start,end,text}` replacing only that span.

## Dependencies

### Internal
`../types` (`LineInfo`, `Span`, `TextEdit`). Consumed by `../editor.ts` and re-exported from `../index.ts`.

### External
None.

## Manual Notes
