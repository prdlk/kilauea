# sequence

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Structural editing for `sequenceDiagram`: participants (implicit or declared), messages, notes, fragments and autonumber. Ops are routed here when `op.type` starts with `seq.`.

## Key Files
| File | Description |
|------|-------------|
| `parse.ts` | `parseSequenceStatement(line)` → `SeqStmt` (`SeqParticipantStmt｜SeqMessageStmt｜SeqNoteStmt|…`); `PARTICIPANT_TYPES` (participant, actor, boundary, control, entity, database, collections, queue), `MESSAGE_OPS` (the eight operators `->`, `->>`, `-->`, `-->>`, `-x`, `--x`, `-)`, `--)`), `NotePlacement` (`over｜left of｜right of`) |
| `graph.ts` | `buildSequenceGraph` → `SequenceGraph` (`participants`, `participantById`, `events`, `autonumber`, `statements`, `lastContentLine`, `lastDeclLine`); `sequenceEntitySpans`, `sequenceEntityAt` |
| `ops.ts` | `compileSequenceOp`, `SequenceOp`, `FragmentKind` |

## For AI Agents

### Working In This Directory
- Entity ids: `participant:<id>` and `event:<lineIndex>` (messages and notes share the `event:` prefix; `SeqEvent.kind` is `'message'｜'note'`). Because event ids are line indexes, they shift when lines are inserted; callers re-resolve after each `change`.
- `SeqParticipant.order` is first-mention order (== render order); undeclared participants are created by `touch()` in the graph with `decl: null`. `lastDeclLine` is where `seq.addParticipant` inserts.
- Ops: `seq.addParticipant`, `seq.renameParticipant`, `seq.setParticipantType`, `seq.deleteParticipant`, `seq.addMessage`, `seq.addNote` (with `afterEvent`), `seq.setMessageOp`, `seq.reverseMessage`, `seq.setEventText`, `seq.deleteEvent`, `seq.moveEvent`, `seq.wrapInFragment`, `seq.toggleAutonumber`.
- `deleteParticipant` also has to deal with events that reference it; `editor.deleteEntities` deletes `event:` ids before `participant:` ids.

### Testing Requirements
`pnpm --filter @kilauea/core test`; `test/sequence.test.ts` (`sequence parsing`, `sequence ops`).

### Common Patterns
Same `{code, lines, graph}` context as other types; messages parse into spans (source, op, target, text) so ops replace just one span.

## Dependencies

### Internal
`../types`; used by `../editor.ts`; returns `OpResult` shape from `../flowchart/ops`.

### External
None.

## Manual Notes
