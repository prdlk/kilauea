# @kilauea/codemirror

CodeMirror 6 pane for [kilauea](https://github.com/prdlk/kilauea):
two-way sync with the editing engine (canvas changes apply as exact minimal edits),
entity selection as decorations, caret → entity selection, pele syntax highlighting,
and ⌘Z routed to the engine's unified history, the same undo stack the canvas uses.

```ts
import { PeleWysiwygEditor } from '@kilauea/core'
import { PeleCodeMirror } from '@kilauea/codemirror'

const editor = new PeleWysiwygEditor({ code: 'flowchart TD\n  A --> B' })
new PeleCodeMirror(hostElement, editor)
```

Docs: [github.com/prdlk/kilauea](https://github.com/prdlk/kilauea)
