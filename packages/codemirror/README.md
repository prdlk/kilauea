# @kilauea/codemirror

CodeMirror 6 pane for [kilauea](https://github.com/prdlk/kilauea):
two-way sync with the editing engine (canvas changes apply as exact minimal edits),
entity selection as decorations, caret → entity selection, mermaid syntax highlighting,
and ⌘Z routed to the engine's unified history, the same undo stack the canvas uses.

```ts
import { MermaidWysiwygEditor } from '@kilauea/core'
import { MermaidCodeMirror } from '@kilauea/codemirror'

const editor = new MermaidWysiwygEditor({ code: 'flowchart TD\n  A --> B' })
new MermaidCodeMirror(hostElement, editor)
```

Docs: [github.com/prdlk/kilauea](https://github.com/prdlk/kilauea)
