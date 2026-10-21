# @kilauea/dom

## 2.1.0

### Minor Changes

- 2fdc49f: Adopt [pele.run](https://pele.run/theming)'s theme as the default.

  - Diagrams drawn by `PeleCanvasView` default to pele.run's light Flexoki palette instead of pele's grey fallbacks. Any `--pele-*` variable set on the container, an ancestor or `svg.pele` still wins.
  - Editing chrome follows the diagram's theme: popovers, the plus menu, zoom buttons, the selection glow, the ghost edge, the in-place editor and the error badge read `--pele-bg`, `--pele-border`, `--pele-fg`, `--pele-muted`, `--pele-surface`, `--pele-accent` and `--pele-critical`, replacing the previous fixed dark chrome and indigo/blue accents. `--mw-accent`, `accentColor` and `--mw-chrome-*` still override it.
  - The CodeMirror entity highlight falls back to `--pele-accent`, then pele.run's `#205ea6`.
  - The popover color swatches (`COLOR_PALETTE`) are Flexoki's accents.

### Patch Changes

- @kilauea/core@2.1.0

## 2.0.0

### Major Changes

- c047c13: Rename every `Mermaid*` export to `Pele*`.

  - `@kilauea/core`: `MermaidWysiwygEditor` → `PeleWysiwygEditor`.
  - `@kilauea/dom`: `MermaidCanvasView` → `PeleCanvasView`.
  - `@kilauea/react`: `MermaidWysiwyg` → `PeleWysiwyg`, `MermaidCanvas` → `PeleCanvas`, `useMermaidEditor` → `usePeleEditor`, and the matching `*Props` types.
  - `@kilauea/codemirror`: `MermaidCodeMirror` → `PeleCodeMirror`, `mermaidLanguage` → `peleLanguage`.
  - `@kilauea/monaco`: `registerMermaidLanguage` → `registerPeleLanguage`; the registered Monaco language id is now `pele`.

- d4cbcaa: Render through [pele](https://github.com/obsidianmd/pele) instead of the consumer's Mermaid.

  **Breaking**

  - `@kilauea/dom` renders through the bundled `pele` and works out of the box; the `mermaid` view option is removed (`mermaid` is no longer needed as a dependency, and `MermaidLike` is gone).
  - `ViewOptions.renderOptions` (pele `RenderOptions`, re-exported from `@kilauea/dom` and `@kilauea/react`), `setRenderOptions()` and `refresh()` replace the removed `mermaid` / `mermaidConfig` options and `setMermaidConfig()`.
  - `MermaidCanvasView.render()` and `validate()` are synchronous, and the view renders in its constructor.
  - Theming is done with `--pele-*` CSS variables on the container or an ancestor (colors apply live; call `refresh()` after changing `--pele-font`). Mermaid theme variables, `%%{init}%%` themes, `securityLevel` and similar no longer apply.
  - `@kilauea/react`: the `mermaid` and `mermaidConfig` props are replaced by `renderOptions` on `<MermaidWysiwyg>` and `<MermaidCanvas>`.
  - `Diagnostic.source` is now `'core' | 'renderer'` (was `'mermaid'`).
  - `DiagramTypeInfo.requiresPlugin` is removed and ZenUML is dropped (pele does not support it).

  **Added**

  - Eleven pele-only diagram types are registered as render-only: swimlane, agentflow, railroad, treeView, cynefin, wardley, eventmodeling, usecase, venn, ishikawa and info. The CodeMirror and Monaco highlighters recognize them.

### Patch Changes

- Updated dependencies [c047c13]
- Updated dependencies [d4cbcaa]
  - @kilauea/core@2.0.0

## 1.1.3

### Patch Changes

- ca5cd66: Cancelling an in-place label edit with Escape now restores the label exactly as pele rendered it. Before, the canvas parsed the raw label text from the diagram source as HTML, which skipped pele's sanitizer. If your canvas renders diagrams that you did not write, upgrade.
  - @kilauea/core@1.1.3

## 1.1.2

### Patch Changes

- 82fe42e: Re-render the canvas once the document's webfonts have loaded, so labels are no longer clipped on a first visit.

  Pele measures label text against the fonts the document can use at the moment it renders, then bakes those measurements into fixed-width `foreignObject` boxes. On a cold load — a first-time visitor with an empty cache, where `font-display: swap` deliberately paints fallback text first — the webfont arrives after that measurement, and the real text is wider than the box that was sized for the fallback. Every label ends up clipped a few pixels short: "Tests green?" loses its "?", "Ship it" renders as "Ship i". Nothing in pele or in the browser re-measures, so the diagram stays wrong for the whole session; reloading fixes it only because the font is then cached, which is why it is invisible in normal development.

  `PeleCanvasView` now watches `document.fonts` after each render. If the document's fonts are still loading it waits for them to settle and then re-renders, which re-measures every label against the fonts the browser is actually painting with. It arms only while fonts are pending, so a page whose fonts are already available renders exactly once, as before. Environments with no `FontFaceSet` are unaffected.

  - @kilauea/core@1.1.2

## 1.1.1

### Patch Changes

- 34c686f: Re-assert each canvas's pele config before it renders.

  `pele.initialize()` writes a module-global config, so on a page with more
  than one canvas the last one to mount owned it: every other canvas rendered
  with the wrong theme and layout options from its second render onwards.
  `render()` now re-asserts its own config instead of trusting whatever was
  initialized in the constructor.

- 8bb0b5a: Smooth the edge-animation loop, and stop node labels from getting quoted when Chromium substitutes `&nbsp;` mid-edit.

  `injectAnimationKeyframes` was ending each animation cycle at `stroke-dashoffset: -20`, but the visual dash+gap period is `2 * 8 = 16` — `-20 mod 16 = -4`, so the dash pattern snapped back by 4 units at every loop boundary. Ending at `-16` completes exactly one period per cycle, so the 100 % → 0 % transition is now invisible.

  `readLabelHtml` used to pass Chromium's `&nbsp;` entity through to the source rewriter unchanged. Typing a trailing space in a contenteditable label produced `"foo&nbsp;"`, and the `&` character tripped the `NEEDS_QUOTE` regex, so the live commit wrapped the label in double quotes; every subsequent keystroke saw `ref.quoted === true` and the quotes stuck around forever. The read now canonicalises `&nbsp;` back to a real space so `.trim()` catches it and the label stays unquoted through the whole edit session.

  - @kilauea/core@1.1.1

## 1.1.0

### Minor Changes

- 784f461: Split the flowchart edge popover into focused pickers — Arrow (heads only, including a double-headed option), Stroke, Edge color, Animate edge (None/Slow/Fast), and Edge curve (Default/Natural/Linear, diagram-wide) — instead of the prior single "Edge type" panel that mixed line and head style. Adds `arrowStart` to `setEdgeStyle`, plus new `setEdgeAnimation` and `setFlowCurve` ops.

  Edges are also easier to click on the canvas: each rendered edge now carries a transparent 14px-stroke hit overlay, so selecting a flowchart / state / class / ER edge no longer requires pixel-precise aim.

### Patch Changes

- Updated dependencies [784f461]
  - @kilauea/core@1.1.0

## 1.0.2

### Patch Changes

- 3c0812b: Fixed the edge-label overlay landing on a neighboring edge's label when you added a label to a freshly-created arrow. Now the text-input opens on the arrow itself; no other label is visually disturbed during editing.
  - @kilauea/core@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [23611c0]
  - @kilauea/core@1.0.1

## 1.0.0

### Major Changes

- 7ab9082: Rename the library to kilauea. Packages move from `@inkeep/mermaid-wysiwyg-*` to
  scoped `@kilauea/*` (`core`, `dom`, `react`, `codemirror`, `monaco`); the public
  repo moves from `inkeep/mermaid-wysiwyg` to `prdlk/kilauea`. Update imports and
  install commands accordingly.

### Minor Changes

- e6feaec: Sequence-diagram connects now start from the lifeline plus buttons: drag a plus to another participant and the message is inserted at that exact gap, then opens for in-place label editing. A plain click still opens the self-message / note menu. The old alt-drag on participant boxes, which could only append at the end of the diagram, is removed.
- 7ab9082: Textbox-grade inline editing: the canvas holds re-renders while an in-place
  label session is typing (live commits still sync the code surfaces), long
  labels stay on one line instead of wrapping into the clip, Escape reverts
  reliably, and a swap already in flight carries typed text and caret across.

  Popovers behave like part of the diagram: they anchor at the exact twin
  element clicked, flip below the node instead of clipping in overflow-hidden
  hosts, clamp horizontally, follow external pan/zoom transforms, and close on
  any interaction outside the canvas.

  New opt-in `panZoom` canvas option (DOM + React bindings): fit-to-canvas by
  default, drag empty space to pan, pinch or ctrl+wheel to zoom at the cursor,
  and corner zoom controls.

  All packages are relicensed from GPL-3.0-or-later to MIT.

- 1fdfef4: Make the canvas usable on touch devices. Pan/zoom canvases now set `touch-action: none` so a one-finger drag pans instead of scrolling the page, two-finger pinch zooms about the finger midpoint, and a double tap on an entity opens the label editor even on browsers that never synthesize `dblclick` from taps (mobile Safari). Popover buttons, zoom controls, and menu rows grow to comfortable tap-target sizes under `@media (pointer: coarse)`.

### Patch Changes

- 4afd20d: The selection glow is no longer clipped flat at the diagram's top and bottom edges.
- c13374b: `@kilauea/dom`: tapping empty canvas margin now dismisses the popover in panzoom mode. Previously, taps outside the SVG but inside its host (the padded margin where the SVG is centered) fell through the SVG's click handler and the popover stayed pinned to the selected node.
- e6feaec: Committing an overlay label edit (sequence notes, ER attribute rows, and other SVG-text labels) no longer flashes the pre-edit text while the re-render catches up.
- Updated dependencies [c13374b]
- Updated dependencies [7ab9082]
- Updated dependencies [7ab9082]
  - @kilauea/core@1.0.0
