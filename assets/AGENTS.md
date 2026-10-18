# assets

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Static media referenced by the root README. Contains only the hero animation.

## Key Files
| File | Description |
|------|-------------|
| `hero-loop.webp` | Animated WebP embedded at the top of `README.md` (`./assets/hero-loop.webp`): a node label is double-clicked and retyped on the canvas while the Pele source rewrites live. |

## For AI Agents

### Working In This Directory
- Do not hand-edit; regenerate with `apps/site/scripts/record-hero.tsx`, which drives the real `/playground` route with Playwright (chromium), owns the frame clock (deterministic, no wall-time sampling), paints only a synthetic pointer overlay, and writes PNG frames to a temp dir.
- Prerequisites (not in the repo's installs): `pnpm --filter site add -D playwright && pnpm --filter site exec playwright install chromium`, and `img2webp` (libwebp).
- Steps: `pnpm dev:site` (serves `/playground` on :5174), then `pnpm --filter site exec tsx scripts/record-hero.tsx`, then run the printed encode command: `img2webp -q 76 -d 33 -loop 0 -lossy <frames>/f*.png -o assets/hero-loop.webp`. Verify with `webpmux -info assets/hero-loop.webp`.
- If the README alt text changes, keep it describing what the clip shows.

### Testing Requirements
None.

## Dependencies

### Internal
`apps/site/scripts/record-hero.tsx`, `README.md`.

### External
`playwright`, libwebp (`img2webp`, `webpmux`).

## Manual Notes
