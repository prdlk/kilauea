# @kilauea/react

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
  - @kilauea/dom@2.0.0

## 1.1.3

### Patch Changes

- Updated dependencies [ca5cd66]
  - @kilauea/dom@1.1.3
  - @kilauea/core@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [82fe42e]
  - @kilauea/dom@1.1.2
  - @kilauea/core@1.1.2

## 1.1.1

### Patch Changes

- Updated dependencies [34c686f]
- Updated dependencies [8bb0b5a]
  - @kilauea/dom@1.1.1
  - @kilauea/core@1.1.1

## 1.1.0

### Patch Changes

- Updated dependencies [784f461]
  - @kilauea/core@1.1.0
  - @kilauea/dom@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [3c0812b]
  - @kilauea/dom@1.0.2
  - @kilauea/core@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [23611c0]
  - @kilauea/core@1.0.1
  - @kilauea/dom@1.0.1

## 1.0.0

### Major Changes

- 7ab9082: Rename the library to kilauea. Packages move from `@inkeep/mermaid-wysiwyg-*` to
  scoped `@kilauea/*` (`core`, `dom`, `react`, `codemirror`, `monaco`); the public
  repo moves from `inkeep/mermaid-wysiwyg` to `prdlk/kilauea`. Update imports and
  install commands accordingly.

### Minor Changes

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

### Patch Changes

- c13374b: `@kilauea/dom`: tapping empty canvas margin now dismisses the popover in panzoom mode. Previously, taps outside the SVG but inside its host (the padded margin where the SVG is centered) fell through the SVG's click handler and the popover stayed pinned to the selected node.
- Updated dependencies [4afd20d]
- Updated dependencies [c13374b]
- Updated dependencies [e6feaec]
- Updated dependencies [7ab9082]
- Updated dependencies [e6feaec]
- Updated dependencies [7ab9082]
- Updated dependencies [1fdfef4]
  - @kilauea/dom@1.0.0
  - @kilauea/core@1.0.0
