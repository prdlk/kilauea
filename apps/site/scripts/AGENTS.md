# scripts

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Maintenance scripts for the site; currently the hero recording script.

## Key Files
| File | Description |
|------|-------------|
| `record-hero.tsx` | Drives the real `/playground` in Playwright Chromium (1200x675 at deviceScaleFactor 2), double-clicks the "Ship it" node, types "Deploy", commits, and writes PNG frames to `os.tmpdir()/kilauea-hero-frames`; prints the `img2webp` command that encodes them into `assets/hero-loop.webp` (2400x1350) |

## For AI Agents

### Working In This Directory
- It does not produce the webp itself; it prints `img2webp -q 76 -d 33 -loop 0 -lossy <frames>/f*.png -o assets/hero-loop.webp` and a `webpmux -info` check.
- Prerequisites are deliberately not dependencies: `pnpm --filter site add -D playwright && pnpm --filter site exec playwright install chromium`, and `img2webp` (libwebp). Do not commit them to `package.json`.
- Usage: `pnpm dev:site`, then `pnpm --filter site exec tsx scripts/record-hero.tsx`. Base URL overridable via `HERO_URL` (default `http://localhost:5174`). The diagram is seeded through the `#code=` hash (`encodeCode`: base64url of UTF-8).
- Frames are deterministic: one input per frame, then screenshot. The only painted element is the injected pointer (`ARROW_SVG`/`IBEAM_SVG`), positioned by hotspot. It clicks bare canvas to deselect because Escape does not deselect.
- It depends on the playground's `g.node` markup and the `Meta+A` select-all; update if the UI changes.

### Testing Requirements
None; run manually. It is excluded from tsconfig `include` (only `src`, `vite.config.ts`).

## Dependencies

### Internal
Targets the running `site` app.

### External
playwright (installed ad hoc), tsx, img2webp/webpmux.

## Manual Notes
