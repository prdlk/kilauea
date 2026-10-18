# test

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Vitest suites for `@kilauea/core`. They import from `../src` and exercise parsing, graph building, op → text-edit output, editor history/selection, and the text pane binding. Everything runs headlessly (no DOM).

## Key Files
| File | Description |
|------|-------------|
| `core.test.ts` | `generic CST`, `flowchart parsing`, `ops → minimal text edits` (flowchart ops), `editor state` (undo/redo, selection, events) |
| `sequence.test.ts` | `sequence parsing`, `sequence ops` |
| `state.test.ts` | `state parsing`, `state ops` |
| `class.test.ts` | `class parsing`, `class ops`, `state stereotype ops` |
| `er.test.ts` | `er parsing`, `pie`, `gantt`, `er ops` |
| `lineitems.test.ts` | `line-item types` (generic `li.` handler) |
| `textpane.test.ts` | `bindTextPane` using an in-memory `fakePane(initial)` adapter (records `applied` edits, `highlights`, `revealed`) |

## For AI Agents

### Working In This Directory
- New ops need a test asserting the exact resulting `editor.code` (minimal edits: surrounding comments/indentation preserved) and, for ops that create entities, the selection of `created` ids.
- `textpane.test.ts`'s `fakePane` is the reference for what an adapter must do: apply edits right-to-left, `setText` as resync, `setHighlights`, optional `revealPosition`. Reuse it for new binding behavior.
- There are no tests for SVG correlation, canvas gestures or React bindings; those live in other packages and are verified manually (see root `TESTING.md`).

### Testing Requirements
`pnpm --filter @kilauea/core test` (runs `vitest run` over all files); run one file with `pnpm --filter @kilauea/core exec vitest run test/class.test.ts`. `pnpm --filter @kilauea/core typecheck` also checks `test/` (tsconfig includes it).

### Common Patterns
Construct `new PeleWysiwygEditor({ code })`, call `editor.dispatch({ type: ... })`, assert on `editor.code`; parsing tests use `parse(code)` and inspect the `ParseResult` graph fields (`flowchart`, `sequence`, `state`, `classGraph`, `er`, `pie`, `gantt`, `lineItems`).

## Dependencies

### Internal
`../src` (everything via the index barrel).

### External
`vitest ^2.1.9`.

## Manual Notes
