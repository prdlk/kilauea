---
'@kilauea/dom': minor
'@kilauea/codemirror': minor
---

Adopt [pele.run](https://pele.run/theming)'s theme as the default.

- Diagrams drawn by `PeleCanvasView` default to pele.run's light Flexoki palette instead of pele's grey fallbacks. Any `--pele-*` variable set on the container, an ancestor or `svg.pele` still wins.
- Editing chrome follows the diagram's theme: popovers, the plus menu, zoom buttons, the selection glow, the ghost edge, the in-place editor and the error badge read `--pele-bg`, `--pele-border`, `--pele-fg`, `--pele-muted`, `--pele-surface`, `--pele-accent` and `--pele-critical`, replacing the previous fixed dark chrome and indigo/blue accents. `--mw-accent`, `accentColor` and `--mw-chrome-*` still override it.
- The CodeMirror entity highlight falls back to `--pele-accent`, then pele.run's `#205ea6`.
- The popover color swatches (`COLOR_PALETTE`) are Flexoki's accents.
