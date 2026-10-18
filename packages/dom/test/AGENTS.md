# test

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Vitest tests (jsdom) for the canvas. They render through the real pele (`pele ^1.6.0`); nothing is faked at the renderer seam.

## Key Files
| File | Description |
|------|-------------|
| `correlate.test.ts` | Renders every editable sample from `apps/js-playground/src/samples.ts` through the real pele and asserts every graph entity is tagged `data-mw-entity` (the SVG-correlation seam, grade A) |
| `edit.test.ts` | Label-editing session: overlay opens over the rendered label (original hidden), live-commit while typing with the canvas render held until Enter, Escape reverts live commits and restores the label, Shift+Enter becomes `<br/>`, multi-line labels round-trip, an unlabeled edge edits at the arrow |
| `fonts.test.ts` | `remeasureWhenFontsSettle`: one re-render when `document.fonts` lands, none when already loaded/absent/after `destroy()`. Wraps pele's `render` in a `vi.fn` spy to count renders |

## For AI Agents

### Working In This Directory
Each file starts with `// @vitest-environment jsdom`. jsdom lacks `CSS.escape` (polyfilled at the top of each file), `FontFaceSet` and layout; stub per test. `HTMLCanvasElement.prototype.getContext = () => null` makes pele fall back to its width table so text measurement is deterministic. Views render synchronously in the constructor, so assertions need no awaiting for the first render. Import from `../src`, not the package name. `correlate.test.ts` imports samples from the js-playground, so sample edits there affect it.

### Testing Requirements
`pnpm --filter @kilauea/dom test`. Not covered: pointer gestures, pan/zoom, popovers, React.

### Common Patterns
`mount()` helper in `correlate.test.ts` (editor + container + view with `debounceMs: 0`); `type`/`key`/`editorDiv` helpers in `edit.test.ts` (set `textContent` + dispatch `input`, dispatch `keydown`, find `.mw-inplace-editor`); `vi.mock('pele', …)` keeping the real implementation behind a spy.

## Dependencies

### Internal
`@kilauea/core`, `../src`.

### External
`pele`, `vitest ^2.1.9`, `jsdom ^25.0.1`.

## Manual Notes
