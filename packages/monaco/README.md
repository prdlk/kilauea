# @kilauea/monaco

Monaco binding for [kilauea](https://github.com/prdlk/kilauea).
You create and own the Monaco editor (workers, theme, options); `bindMonaco`
wires the two-way sync: typing flows into the engine, engine changes come back
as minimal edits, entity selection renders as decorations and follows the
caret, and undo/redo share the canvas history.

This package has no dependency on `monaco-editor`, not even for types, so it
never pins your Monaco version. It binds against a small structural interface
that any real Monaco editor satisfies.

```ts
import * as monaco from 'monaco-editor'
import { PeleWysiwygEditor } from '@kilauea/core'
import { bindMonaco, registerPeleLanguage } from '@kilauea/monaco'

registerPeleLanguage(monaco) // optional syntax highlighting

const editor = new PeleWysiwygEditor({ code: 'flowchart TD\n  A --> B' })
const me = monaco.editor.create(host, { value: editor.code, language: 'pele' })
const binding = bindMonaco(editor, me)

// style the selection highlight however you like:
// .mw-monaco-entity { background: rgba(105, 163, 255, 0.28); border-radius: 3px; }

binding.dispose() // unhooks listeners and clears decorations
```

Pairs with [`@kilauea/dom`](https://npmjs.com/package/@kilauea/dom)
(interactive canvas). Docs: [github.com/prdlk/kilauea](https://github.com/prdlk/kilauea)
