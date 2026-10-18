# dom

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
`@kilauea/dom` (v1.1.3) is the interactive canvas. `PeleCanvasView` renders synchronously through [pele](https://github.com/obsidianmd/pele) (a zero-dependency Pele renderer themed by `--pele-*` CSS variables), correlates the resulting SVG with `@kilauea/core`'s semantic graphs, and overlays selection, drag-to-connect, in-place label editing, popovers, keyboard editing and optional pan/zoom. Every gesture dispatches a core op; the view never edits text itself.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | `main`/`types` point at `src/index.ts` (workspace consumers use source); `publishConfig` swaps to `dist`; scripts `typecheck`, `test`, `build` (tsup esm + dts) |
| `README.md` | npm-facing usage snippet |
| `CHANGELOG.md` | changesets-generated; do not hand edit |
| `tsconfig.json` | extends the workspace config for typecheck |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | view, correlators, popover, icons (see `src/AGENTS.md`) |
| `test/` | vitest + jsdom tests (see `test/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Public API is only `src/index.ts`: `PeleCanvasView`, `ViewOptions`, `ViewHooks`, `Tool`, `correlateFlowchart`, `correlateSequence`, `Correlation`, `SequenceCorrelation`, `Popover`, `PopoverAction`, `PopoverPanelItem`. Other correlators (`correlateState/Class/Er/Pie/Gantt/LineItems`) are internal to the package. Adding a public symbol means editing `index.ts` and a changeset (all five @kilauea packages are in a `fixed` group).
- Rendering is `pele` (a hard dependency). `ViewOptions.renderOptions` (pele `RenderOptions`, re-exported from the barrel) / `setRenderOptions` / `refresh` configure it; colors are `--pele-*` CSS variables on the container or an ancestor, never render options. Don't reintroduce a consumer-supplied renderer or `pele` import.
- `sideEffects: false`, but `view.ts` injects one `<style data-mw>` into `document.head` lazily (module flag `styleInjected`).

### Testing Requirements
`pnpm --filter @kilauea/dom test` (vitest run) and `pnpm --filter @kilauea/dom typecheck`. SVG correlation runs against real pele in jsdom (`test/correlate.test.ts`) and label editing is tested (`test/edit.test.ts`); pointer gestures (drag, pan/zoom, popovers) have no automated coverage; verify them manually in `apps/playground` (see root `TESTING.md`).

### Common Patterns
Real pele rendering in jsdom (canvas `getContext` stubbed to `null` so pele uses its width table), `vi.mock('pele')` wrapping `render` in a spy where render counts matter, `vi` fake timers. Selection/ops go through `editor.dispatch`.

## Dependencies

### Internal
`@kilauea/core` (`workspace:*`).

### External
`pele ^1.6.0` (runtime renderer). Dev: `typescript ^5.6.3`, `vitest ^2.1.9`, `jsdom ^25.0.1`. Build: tsup.

## Manual Notes
