# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Source of the canvas: the 2.7k-line `PeleCanvasView` controller, per-diagram SVG correlators, a floating popover and inline Lucide icons.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | 3-line barrel; the entire public surface |
| `view.ts` | `PeleCanvasView`, `ViewOptions` (incl. pele `renderOptions`), `ViewHooks`, `Tool`, `COLOR_PALETTE`, BASE_CSS, edge SVG-preview helpers (`arrowHeadSvg`, `strokeSvg`, `curveSvg`, `animSvg`), label caret helpers, popover `actionsFor` per entity kind, lifeline "+" UI for sequence diagrams |
| `correlate.ts` | `correlateFlowchart/State/Class/Er/Pie/Gantt/LineItems/Sequence`, `addEdgeHitOverlay` |
| `popover.ts` | `Popover` class (`show`, `hide`, `isOpen`), `PopoverAction/Panel/PanelSection/PanelItem`, `POPOVER_CSS` |
| `icons.ts` | `ICONS` map of inline Lucide SVG strings (trash, pencil, palette, copy, shapes, arrows, group, plus/minus/maximize, …) |

## For AI Agents

### Working In This Directory
**Correlator fragility (highest risk).** `correlate.ts` keys off pele's `data-id` attributes and `pele-*` classes; a pele upgrade that renames them degrades entities to view-only silently. `test/correlate.test.ts` is the tripwire. Per correlator:
- Flowchart: nodes `g.pele-node[data-id=<id>]`, subgraphs `g.pele-cluster[data-id=<id>]`, edges `L_<src>_<tgt>_<n>`.
- State: states `g.pele-node`, composites `g.pele-cluster`, transitions `edge<n>` where `n` counts every edge pele draws (note connectors included), so match by ascending `n`, not index. `[*]` pseudo-states stay view-only.
- Class: classes `g.pele-node`, relations `id_<src>_<tgt>_<n>`, member rows `text.pele-member` (attributes, then methods).
- ER: entities `g.pele-node`, relations `id_entity-<src>-<i>_entity-<tgt>-<j>_<n>`, attribute cells `g.pele-er-attributes > text` grouped into rows by `y`.
- Pie: slices `path.pele-slice[data-id=<label>]`, legend `g.pele-legend-item[data-id=<label>]`; pele collapses duplicate labels, later duplicates stay view-only.
- Gantt: task bars `g.pele-task` in source order (`data-id` is the task id or a generated `taskN`).
- Sequence: actors `g.pele-actor` (drawn twice), lifelines `path.pele-lifeline`, messages `g.pele-message[data-id=i<n>]`, notes `g.pele-note[data-id=i<n>]` (`n` = statement position, monotonic, matched ascending).
- Line-item types (`correlateLineItems`): match each item's label text against SVG `<text>`, ignoring whitespace (pele wraps labels into tspans/rows), then tag the smallest enclosing group; `data-id` groups are candidates after bare text. Unfound items stay code-only.
- Edge-shaped entities share `claimEdge`/`correlateEdges`: candidates matched by a per-entity `data-id` regex, claimed in ascending id-suffix order (duplicate `A --> B` edges). The group gets `data-mw-entity`, the first non-marker `<path>` is the line stored in `Correlation.edges`, and the label group is tagged too. Anything missing goes to `Correlation.failed`. Never guess on a miss.
- Matched elements get `data-mw-entity`; edge lines also get a transparent 14px `data-mw-hit-overlay` clone (`pointer-events: stroke`, inserted before the visible path, de-duplicated per entity id). Don't clone it elsewhere or it stacks.
- `bindSvg` chooses the correlator by which `editor.result` graph is set (flowchart → state → classGraph → er → pie → gantt → lineItems), plus `correlateSequence` independently. New diagram type = new correlator + a branch there + a sample in `apps/js-playground/src/samples.ts` (the correlate test iterates it). Render-only (pele-only) types have no correlator.

**Render loop (synchronous).** `render()` calls pele's `render(code, effectiveRenderOptions())` and swaps the SVG in the same tick; the constructor renders immediately, so the first `render` event fires before callers can subscribe (read `view.renderError` / the container's `svg` instead). `validate()` is synchronous too. Triggers: editor `change` (`scheduleRender`, debounced `debounceMs` default 200); constructor; `setRenderOptions` and `refresh()` (both clear `lastRenderedCode`); font settle (`remeasureWhenFontsSettle`, one-shot, resets `lastRenderedCode`); end of a label-edit session (`renderHeldByEdit`). Invariants: skip when `editor.code === lastRenderedCode` (but clear a stale error badge); while `editSession` is open, renders are held, not run; `effectiveRenderOptions` adds a unique `idPrefix` and defaults `fontFamily`/`fontFamilyMono` to the container's `--pele-font`/`--pele-font-mono`, then its computed `font-family` (pele measures with the font it is told, so it must match what is displayed); on a throw show `.mw-error-badge`, call `editor.setDiagnostics` with one `source: 'renderer'` diagnostic (a `PeleError.line` maps to that source line's span, clamped to the last line), emit `render {ok:false}`; `pendingEditEntity` (from `addNode`) opens the label editor after the next render. There is no retry-on-reveal handling: pele needs no layout, so correlation works in detached or hidden containers. A MutationObserver (`svgTransformObserver`) repositions the popover when a host transforms the SVG. Colors never need a render (CSS variables apply live); font variable changes need `refresh()`.

**Edge animation.** Pele drops `animation-*` declarations from `linkStyle`, so `applyEdgeAnimations` (called from `bindSvg` for flowcharts) re-reads each edge's animation seconds from source and sets `style.animation` on the matched line path after every render. `injectAnimationKeyframes` supplies the `kilauea-flow` keyframes.

**Popovers/icons.** `updatePopover` → `actionsFor(id)` builds `PopoverAction[]`; actions with `panel` open a secondary grid (`PopoverPanelSection`, items use `swatch` > `svg` > `glyph`). `icon` markup takes precedence over `glyph`. Add icons to `ICONS` via the local `icon()` wrapper (24x24, stroke currentColor, aria-hidden); popover root stops `pointerdown` propagation. Document-level capture `pointerdown` outside the container clears selection and popover.

**Theming.** Diagram defaults: BASE_CSS captures each `--pele-*` colour on `.mw-canvas` as `--mw-t-*` (fallback pele.run light Flexoki) and re-declares `--pele-*` from it on `.mw-svg-host`. Never declare `--pele-*` on `.mw-canvas` itself: that would shadow ancestor themes. Chrome colours (popover, plus menu, zoom buttons, selection glow, ghost edge, in-place editor, error badge) read internal `--mw-c-*` tokens: public override (`--mw-accent`, `--mw-chrome-bg/border/fg/dim/hover`) → `--mw-t-*`. Never hard-code a colour in POPOVER_CSS. `COLOR_PALETTE` is Flexoki's 400 accents.

**Editing.** All label editing goes through `openOverlayEditor`: one session (`editSession`) with a chrome-less contenteditable div positioned over the rendered SVG text, typography copied, original hidden. Typing live-commits (debounced) so code panes follow; the canvas render is held until the session ends. Enter commits, Shift+Enter inserts `<br/>` in the source, Escape reverts everything including live commits and restores the label. A fresh edge with no rendered label anchors at its path midpoint (`pathMidpointRect`). Labels are SVG `<text>` (no foreignObject). `hooks.onEntityDoubleClick` returning true suppresses it. `readOnly` disables dispatching paths.

### Testing Requirements
`pnpm --filter @kilauea/dom test`. Correlators run against real pele output in `../test/correlate.test.ts` and label editing in `../test/edit.test.ts`; pointer gestures, pan/zoom and popovers are manual in the playground.

### Common Patterns
- `this.disposers.push(...)` for every listener; `destroy()` runs them.
- Typed event emitter: `view.on('render' | 'toolChange' | 'connectPreview', fn)` returns unsubscribe.
- Selection comes from `data-mw-entity` via `entityFromEvent`; selection state lives in the core editor (`editor.selection`, `clearSelection('canvas')`).

## Dependencies

### Internal
`@kilauea/core` (editor, graph types `FlowGraph`, `SequenceGraph`, …, `Diagnostic`, `ShapeId`, `EdgeLine`, `EdgeArrow`, `FlowCurve`).

### External
`pele ^1.6.0` (renderer: `render`, `parse`, `PeleError`, `RenderOptions`); DOM APIs.

## Manual Notes
