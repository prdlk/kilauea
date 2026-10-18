# state

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Structural editing for `stateDiagram`/`stateDiagram-v2`: states (simple, composite, stereotyped), transitions, notes and direction. Ops are routed here when `op.type` starts with `st.`.

## Key Files
| File | Description |
|------|-------------|
| `parse.ts` | `parseStateStatement(line)` → `StStmt` = `StTransitionStmt｜StDeclStmt｜StSimpleStmt`. Decl forms: `quoted` (`state "x" as id`), `state`, `desc` (`id: x`); simple kinds: `blockClose`, `direction`, `divider`, `note`, `noteBlockOpen`, `noteBlockEnd`, `classDef`, `classAssign`, `style`, `unknown` |
| `graph.ts` | `buildStateGraph` → `StateGraph` (`states`, `stateById`, `transitions`, `direction`, ...); `StState` has `parent`, `isComposite`, `stereotype`, `typeDeclLine`; `stateEntitySpans`, `stateEntityAt` |
| `ops.ts` | `compileStateOp`, `StateOp`, `StateType` |

## For AI Agents

### Working In This Directory
- Entity ids: `state:<id>` and `trans:<src>-><tgt>#<n>`. The `[*]` pseudo-states are never entities (see `StState` doc), but can appear as transition endpoints.
- Ops: `st.addState`, `st.setStateType` (choice/fork/join stereotype via `<<...>>`), `st.addStateNote`, `st.reverseTransition`, `st.moveToComposite`, `st.connect`, `st.setStateLabel`, `st.setTransitionLabel`, `st.deleteState`, `st.deleteTransition`, `st.setDirection`.
- A state may be referenced on many lines (`declLines`, `refLines`, `firstRefLine`); label edits go to `decl` when present else insert at `firstRefLine`.

### Testing Requirements
`pnpm --filter @kilauea/core test`; `test/state.test.ts` (`state parsing`, `state ops`). Stereotype ops for state are also exercised in `test/class.test.ts` (`state stereotype ops`).

### Common Patterns
`ID` regex `(?:\[\*\]|[\w-]+)`; `TRANSITION_RE` and `QUOTED_DECL_RE` in `parse.ts`; per-line parse, graph aggregation, span-replacing ops.

## Dependencies

### Internal
`../types`, `../flowchart/ops` (`OpResult` type, via editor).

### External
None.

## Manual Notes
