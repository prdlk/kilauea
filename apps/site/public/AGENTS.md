# public

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Static files served from the site root by Vite.

## Key Files
| File | Description |
|------|-------------|
| `favicon.svg` | Icon, also used for `mask-icon` and `apple-touch-icon` in `index.html` |
| `og-image.png` | 1200x630 Open Graph/Twitter image referenced as `https://kilauea.prdlk.dev/og-image.png` |
| `og-image.svg` | Vector source of the OG image |
| `robots.txt` | `Allow: /`, points to `https://kilauea.prdlk.dev/sitemap.xml` |
| `sitemap.xml` | Lists only `https://kilauea.prdlk.dev/` (weekly, priority 1.0) |

## For AI Agents

### Working In This Directory
- Regenerate `og-image.png` from `og-image.svg` when changing it; keep 1200x630 to match the `og:image:width/height` tags in `index.html`.
- `/playground` is not in the sitemap.

### Testing Requirements
None; `pnpm build:site` copies these as-is.

## Dependencies

### Internal
Referenced by `../index.html`.

## Manual Notes
