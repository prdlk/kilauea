---
'@kilauea/core': major
'@kilauea/dom': major
'@kilauea/react': major
'@kilauea/codemirror': major
'@kilauea/monaco': major
---

Render through [pele](https://github.com/obsidianmd/pele) instead of the consumer's Mermaid.

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
