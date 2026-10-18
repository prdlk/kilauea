# Testing substrate

A map of the product seams, what covers each one today, and what no current
substrate can prove. Grades: **A** real component over its real interface,
**B** narrow integration against a realistic fake, **uncovered** no automated
test exercises the seam.

## Seams

| Seam | What crosses it | Substrate | Grade |
|---|---|---|---|
| Core engine (parse → ops → minimal edits → history) | Public contract of `@kilauea/core`; every op for all 22 editable diagram types | `packages/core/test/*.test.ts` (74 tests) run the real engine on real Mermaid source and assert emitted code, round-trips, and undo | A |
| `bindTextPane` editor contract | The adapter contract any code editor integration implements | `packages/core/test/textpane.test.ts` drives the binding through an in-memory pane that implements exactly the shipped adapter interface: both sync directions, caret selection, reveal, drift resync, dispose | B |
| CodeMirror binding | `@kilauea/codemirror` against a real CodeMirror 6 `EditorView` | `packages/codemirror/test/binding.test.ts` (jsdom): engine ops → view, view edits → engine, decorations in the DOM, caret → entity selection, engine-authoritative undo, teardown | A |
| Monaco binding | `@kilauea/monaco` against the structural editor interface it binds | `packages/monaco/test/binding.test.ts`: fake implementing exactly the bound surface (both sync directions, decorations, caret reasons, undo keys, dispose), plus a compile-time conformance check that real `monaco-editor` types satisfy the interface | B |
| Canvas render loop (what makes `@kilauea/dom` re-render) | The triggers and the guards on them: source changes, option changes, and the webfont-settled re-measure that keeps labels from being clipped on a cold load | `packages/dom/test/fonts.test.ts` drives a real `MermaidCanvasView` over the real pele (with `render` wrapped in a spy) and a stubbed `FontFaceSet`: re-renders once when fonts land late, never when they were already there, never after `destroy()`, never where the document exposes no font set | B |
| SVG correlation (dom package ↔ pele's rendered DOM) | Third-party dependency seam: correlators key off pele's `data-id` attributes and `pele-*` classes, which can shift between pele releases | `packages/dom/test/correlate.test.ts` renders every editable sample (`apps/js-playground/src/samples.ts`) through the real pele in jsdom and asserts every graph entity is tagged `data-mw-entity` | A |
| Label-editing session | The overlay editor: live commit while typing, render held until the session ends, Escape revert, Shift+Enter line breaks, unlabeled-edge editing | `packages/dom/test/edit.test.ts` drives a real `MermaidCanvasView` over the real pele in jsdom | A |
| Canvas interaction layer (popovers, drag, in-place editing) | `@kilauea/dom` gestures compiled to engine ops | None automated. Verified manually in the playground | uncovered |
| React bindings | `@kilauea/react` hooks/components over core events | None automated. Thin subscription layer; exercised manually via the playground | uncovered |

## Honest residual

What the current suite cannot catch:

- **A pele upgrade that shifts the rendered SVG structure.** Correlators fail
  soft (elements degrade to view-only), so the failure would be silent feature
  loss, not a crash. `correlate.test.ts` now catches it: pele renders in jsdom
  because it is synchronous and falls back to its built-in width table when
  there is no canvas 2d context.
- **Pointer-gesture regressions** (drag-to-connect thresholds, double-click
  vs drag arbitration, popover anchoring). These need a real-browser rung
  (vitest browser mode or Playwright).
- **Pixel-level text fit.** The font-settled re-measure is pinned at the
  contract level (does the view re-render, and only when it should). jsdom
  uses pele's width table, so it cannot tell whether a label fits its box in
  a real font.
- **React render-loop regressions** (stale subscriptions, effect ordering).
  Would need @testing-library/react coverage.

The playground doubles as the manual harness for the remaining gaps: every editable
type has a sample, and the toolbar/popovers exercise the gesture surface.

## Running

```bash
pnpm test        # all package suites
pnpm typecheck   # all packages and apps
```
