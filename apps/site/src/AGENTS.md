# src

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
React source for the marketing site. `main.tsx` picks the root by `location.pathname` (trailing slashes stripped): `/playground` -> `PlaygroundPage`, `/hero-loop` -> `HeroLoopPage`, anything else -> `App`.

## Key Files
| File | Description |
|------|-------------|
| `main.tsx` | Route selection, StrictMode render, imports `site.css` and `./analytics` |
| `App.tsx` | Landing page (about 1050 lines): `REPO`/`INSTALL_CMD`, `initialHeroSource()`, `PlaygroundCallout`, `CodeCard` and the inline demo |
| `PlaygroundPage.tsx` | `/playground`: the address-bar `#code=` hash is the document (debounced replaceState); preset menu, light/dark skin, copy link |
| `playground-shared.tsx` | `PRESETS`, `TYPE_LABELS`, `mono`, `ACCENT`, `canvasStyle(skin)`, `SkinToggle`, `codeFromHash`, `encodeCode`, `CodeMirrorPane`, `Logo`, `useCanvasControlTracking` |
| `icons.tsx` | Inlined Lucide icons (no icon dependency); sized by the surrounding CSS |
| `HeroLoopPage.tsx` | `/hero-loop`: deterministic RAF demo (`CYCLE_MS` 10500) firing editor ops with a painted cursor; dev capture target |
| `hero-diagram.ts` | Hero strings (`HERO_HEADLINE`, `HERO_SUBHEAD`, ...) and `heroBootHtml()` static SVG stand-in, shared by `App.tsx` and `vite.config.ts` |
| `analytics.ts` | PostHog init (cookieless, `persistence: 'memory'`) and `track(event, props)`; no-op without `VITE_POSTHOG_KEY`; in DEV mirrors events to `window.__phEvents` |
| `site.css` | Site styles: shadcn zinc dark tokens (`--background`, `--border`, `--muted-foreground`, ...) and the `.btn`/`.tabs`/`.menu` primitives every page uses |

## For AI Agents

### Working In This Directory
- The site is dark-only and styled through the tokens and classes in `site.css`; don't add inline hex colours. The playground panes follow the preview-theme switch via `data-skin` on `.pg-grid` (`--pane-*` vars). Diagram colours are `--pele-*` vars (`themeVars()` behind `canvasStyle()` in `playground-shared.tsx`, `.hero-masthead` in `site.css`). The first-paint hero in index.html is rendered by pele at build time (`heroBootHtml()` via the vite plugin).
- `PlaygroundPage` and `App.tsx` share the code in `playground-shared.tsx`; `PRESETS` here is separate from the playground apps' `SAMPLES`.
- Use `track()` for analytics, never call posthog directly.

### Testing Requirements
`pnpm --filter site typecheck`; check `/`, `/playground`, `/hero-loop` manually via `pnpm dev:site`.

### Common Patterns
`usePeleEditor(code)` + `PeleCanvas` from `@kilauea/react`; `PeleCodeMirror` in `CodeMirrorPane`; `HeroLoopPage` uses `PeleWysiwygEditor` and `PeleCanvasView` directly.

## Dependencies

### Internal
`@kilauea/react`, `@kilauea/core`, `@kilauea/dom`, `@kilauea/codemirror`.

### External
react, pele, posthog-js, @codemirror/view.

## Manual Notes
