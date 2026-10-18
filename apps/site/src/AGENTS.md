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
| `playground-shared.tsx` | `PRESETS`, `TYPE_LABELS`, `canvasStyle(skin)` (pele.run light/dark theme + pane dot grid), `SkinToggle`, `codeFromHash`, `encodeCode`, `CodeMirrorPane`, `Logo`, `useCanvasControlTracking` |
| `icons.tsx` | Inlined Lucide icons (no icon dependency); sized by the surrounding CSS |
| `HeroLoopPage.tsx` | `/hero-loop`: deterministic RAF demo (`CYCLE_MS` 10500) firing editor ops with a painted cursor; dev capture target |
| `hero-diagram.ts` | Hero strings (`HERO_HEADLINE`, `HERO_SUBHEAD`, ...) and `heroBootHtml()` static SVG stand-in, shared by `App.tsx` and `vite.config.ts` |
| `analytics.ts` | PostHog init (cookieless, `persistence: 'memory'`) and `track(event, props)`; no-op without `VITE_POSTHOG_KEY`; in DEV mirrors events to `window.__phEvents` |
| `site.css` | Site styles: shadcn zinc dark tokens (`--background`, `--border`, `--muted-foreground`, ...) and the `.btn`/`.tabs`/`.menu` primitives every page uses |

## For AI Agents

### Working In This Directory
- The site chrome is dark-only and styled through the tokens and classes in `site.css`; don't add inline hex colours. Every diagram surface uses pele.run's theme (Flexoki): the hero (`.hero-masthead`), the landing demo (`.spin*`, after pele.run's "How it works" panel: `--spin-*` vars, no pan/zoom, render-time status line) and `/playground` (`themeVars()` behind `canvasStyle()`; panes follow `data-skin` on `.pg-grid` via `--pane-*`). Don't pass `accentColor` or set `--mw-chrome-*`: the canvas chrome follows `--pele-*` by itself. The first-paint hero in index.html is rendered by pele at build time (`heroBootHtml()` via the vite plugin).
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
