# @kilauea/react

React bindings for [kilauea](https://github.com/prdlk/kilauea):
a drop-in visual Pele editor component. Click, drag, and type directly on the
diagram; the `code` prop stays in sync with minimal text edits.

```tsx
import { useState } from 'react'
import { PeleWysiwyg } from '@kilauea/react'

function App() {
  const [code, setCode] = useState('flowchart TD\n  A[Start] --> B{OK?}')
  return <PeleWysiwyg code={code} onCodeChange={setCode} />
}
```

Rendering is done by [pele](https://github.com/obsidianmd/pele), bundled through `@kilauea/dom`; theme it with `--pele-*` CSS variables on `style`/an ancestor and tune it with the `renderOptions` prop.

Also exports `PeleCanvas` (bring your own editor instance) and
`usePeleEditor` (own the engine, re-render on change/selection).

Docs: [github.com/prdlk/kilauea](https://github.com/prdlk/kilauea)
