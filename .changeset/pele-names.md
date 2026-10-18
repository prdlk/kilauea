---
'@kilauea/core': major
'@kilauea/dom': major
'@kilauea/react': major
'@kilauea/codemirror': major
'@kilauea/monaco': major
---

Rename every `Mermaid*` export to `Pele*`.

- `@kilauea/core`: `MermaidWysiwygEditor` → `PeleWysiwygEditor`.
- `@kilauea/dom`: `MermaidCanvasView` → `PeleCanvasView`.
- `@kilauea/react`: `MermaidWysiwyg` → `PeleWysiwyg`, `MermaidCanvas` → `PeleCanvas`, `useMermaidEditor` → `usePeleEditor`, and the matching `*Props` types.
- `@kilauea/codemirror`: `MermaidCodeMirror` → `PeleCodeMirror`, `mermaidLanguage` → `peleLanguage`.
- `@kilauea/monaco`: `registerMermaidLanguage` → `registerPeleLanguage`; the registered Monaco language id is now `pele`.
