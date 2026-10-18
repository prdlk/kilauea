# class

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Structural editing for `classDiagram`/`classDiagram-v2`: classes (with `{}` blocks or one-line members), relations with UML operators, annotations, notes, cardinalities. Ops are routed here when `op.type` starts with `cl.`.

## Key Files
| File | Description |
|------|-------------|
| `parse.ts` | `parseClassStatement(line, inBlockOf)` → `ClStmt` = `ClRelationStmt｜ClClassDeclStmt｜ClMemberStmt｜ClSimpleStmt`; `RELATION_OPS`, `RelationOp`; `RELATION_RE` is built from `RELATION_OPS` |
| `graph.ts` | `buildClassGraph` → `ClassGraph` (`classes`, `classById`, `relations`, `statements`, `direction`, `lastContentLine`); `ClClass` has `block {open,close}`, `members`, `extraLines`, `refLines`; `classEntitySpans`, `classEntityAt` |
| `ops.ts` | `compileClassOp`, `ClassOp`; also `ClOpContext`, `ClOpResult` |

## For AI Agents

### Working In This Directory
- Entity ids: `class:<id>` and `rel:<src>-><tgt>#<n>`. Members are not entities; they are addressed by `{id, memberLine}` (absolute line index) in `cl.setMemberText`/`cl.deleteMember`.
- Ops: `cl.addClass`, `cl.connect` (`op?: RelationOp`), `cl.renameClass`, `cl.setRelationType`, `cl.setRelationLabel`, `cl.reverseRelation`, `cl.addMember`, `cl.setMemberText`, `cl.deleteMember`, `cl.deleteClass`, `cl.deleteRelation`, `cl.setDirection`, `cl.setAnnotation` (`null` removes), `cl.addNoteFor`, `cl.setCardinality` (`side: 'source'｜'target'`, `null` clears).
- Class ids match `[\w.~]+` (generics use `~`). `generateClassName(graph, preferred?)` picks a unique name; `cleanText` normalizes user text.
- Reuses `bodyIndent`, `insertAfterLine`, `deleteLine` helpers duplicated in this file (same pattern as `er/ops.ts`).

### Testing Requirements
`pnpm --filter @visimer/core test`; `test/class.test.ts` (`class parsing`, `class ops`).

### Common Patterns
Block-aware parse: `inBlockOf` passes the owning class id so `Name: member` and `+field` lines inside `{ }` classify as members.

## Dependencies

### Internal
`../types`.

### External
None.

## Manual Notes
