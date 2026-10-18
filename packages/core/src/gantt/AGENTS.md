# gantt

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Single-file handler for `gantt` charts: tasks (`name : meta`) grouped under `section` lines. Everything lives in `index.ts`. Ops are routed here when `op.type` starts with `gantt.`.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | `buildGanttGraph` → `GanttGraph {headerLine, tasks, sections, lastContentLine}`; `GanttTask {entityId: 'task:<lineIndex>', name, meta, lineIndex, nameSpan, metaSpan, section}`; `GanttOp`; `compileGanttOp`; `ganttEntitySpans`; `ganttEntityAt` |

## For AI Agents

### Working In This Directory
- `KEYWORD_RE` (dateFormat, axisFormat, tickInterval, excludes, includes, todayMarker, title, weekday, inclusiveEndDates, topAxis) and `SECTION_RE` lines are skipped as tasks; remaining lines matching `TASK_RE = /^(.+?)\s*:\s*(.+)$/` become tasks. `meta` is raw text after the colon (ids, flags, dates, durations) and is not parsed further.
- Ops: `gantt.setTaskName`, `gantt.setTaskMeta` (raw string), `gantt.addTask` (optional `section`, `name`, `meta`), `gantt.deleteTask`.
- Do not add date arithmetic here; edits touch only `nameSpan`/`metaSpan`.

### Testing Requirements
`pnpm --filter @visimer/core test`; the `gantt` suite is in `test/er.test.ts`.

### Common Patterns
Same single-file `build…Graph`/`compile…Op`/`…EntitySpans`/`…EntityAt` quartet as `pie/index.ts`.

## Dependencies

### Internal
`../types`.

### External
None.

## Manual Notes
