# @kilauea/dom

Interactive WYSIWYG canvas for [Mermaid](https://mermaid.js.org): renders synchronously through
[pele](https://github.com/obsidianmd/pele) (bundled, no `mermaid` install needed), then overlays selection, drag-to-connect,
in-place text editing, entity popovers (shapes, arrow types, colors, cardinalities),
and keyboard editing, every gesture compiled to a minimal source edit by
[`@kilauea/core`](https://npmjs.com/package/@kilauea/core).

```ts
import { MermaidWysiwygEditor } from '@kilauea/core'
import { MermaidCanvasView } from '@kilauea/dom'

const editor = new MermaidWysiwygEditor({ code: 'flowchart TD\n  A --> B' })
new MermaidCanvasView({ editor, container: el })
```

Colors are CSS variables on the container or any ancestor (`--pele-bg`, `--pele-fg`,
`--pele-accent`, …) and apply live. Pass pele `RenderOptions` via `renderOptions` (or
`view.setRenderOptions`); after changing `--pele-font`, call `view.refresh()`.

Docs: [github.com/prdlk/kilauea](https://github.com/prdlk/kilauea)
