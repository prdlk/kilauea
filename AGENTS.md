# kilauea

**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Kilauea is a WYSIWYG editor for Pele diagrams. [pele](https://github.com/obsidianmd/pele), a zero-dependency synchronous Pele renderer themed by CSS variables, draws the SVG. Kilauea maps the rendered elements back to a lossless concrete syntax tree (CST) and turns canvas gestures (rename, connect, reorder, restyle) into minimal text edits on the Pele source. This directory is a pnpm workspace holding five published `@kilauea/*` libraries (`packages/`) and three private apps (`apps/`).

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Workspace root (`kilauea-monorepo`, private, `pnpm@12.8.1`); orchestration scripts only |
| `pnpm-workspace.yaml` | Workspace globs `packages/*`, `apps/*`; build allow-list (`esbuild: true`, `core-js: false`) |
| `tsconfig.base.json` | Shared TS config every package/app extends: ES2022, `moduleResolution: bundler`, `strict`, `isolatedModules`, `noEmit` |
| `TESTING.md` | Test seam map: what each suite proves, its grade (A/B/uncovered), and the gaps no automated suite covers |
| `README.md` | Public docs: quick start, diagram support matrix (22/23 types editable), package table, architecture |
| `postcss.config.mjs` | Empty PostCSS config (`export default {}`). Probably there so Vite apps don't pick up a PostCSS config from outside the repo |
| `pnpm-lock.yaml` | Lockfile; `scripts/check-agent.mjs` refuses to run when `node_modules/.pnpm/lock.yaml` differs from it |
| `LICENSE` | MIT © Inkeep |
| `.gitignore` | Ignores `node_modules/`, `dist/`, `.env*`, `.vercel` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `packages/` | Published libraries `@kilauea/core`, `dom`, `codemirror`, `monaco`, `react` (see `packages/AGENTS.md`) |
| `apps/` | Private apps: React playground, vanilla-TS playground, marketing site (see `apps/AGENTS.md`) |
| `scripts/` | `check-agent.mjs`, the lockfile-checked test gate run by `pnpm check:agent` (see `scripts/AGENTS.md`) |
| `.github/` | CI and changesets release workflows (see `.github/AGENTS.md`) |
| `.changeset/` | Changesets config; all five packages version together (see `.changeset/README.md`) |
| `assets/` | README media (`hero-loop.webp`) (see `assets/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Use pnpm only. Run `pnpm install` after any `package.json` change and commit the updated `pnpm-lock.yaml`.
- Dependency direction: `core` ← `dom` ← `react`. `codemirror` and `monaco` depend on `core` only. `core` must stay free of DOM dependencies (it has no runtime deps).
- In the workspace, package `exports` point at `src/*.ts`, so apps and tests consume source directly and need no build step. `publishConfig` swaps these to `dist/` at publish time. Don't make in-repo consumers depend on `dist/`.
- Editor libraries (`@codemirror/*`, `react`, `monaco-editor`) are peer dependencies or not dependencies at all. Don't add them as hard `dependencies`.
- User-visible package changes need a changeset (`pnpm changeset`). The five packages are a `fixed` group, so they always share one version.
- Apps (`playground`, `js-playground`, `site`) are ignored by changesets and never published.

### Testing Requirements
- `pnpm test` runs every package's `vitest run` (`pnpm -r run test`). `@kilauea/react` has no test script.
- `pnpm typecheck` runs `tsc` in every package and app.
- `pnpm check:agent` runs `scripts/check-agent.mjs test`. It runs the full test suite, but first refuses with exit 77 and a `NOT-RUN:` line when dependencies are missing or stale versus the lockfile.
- SVG correlation (real pele in jsdom) and label editing are covered by `packages/dom/test`; canvas pointer gestures and the React bindings have no automated coverage (see `TESTING.md`). Changes there must be verified manually in the playground (`pnpm dev` → http://localhost:5173), which has a sample for every editable diagram type.

### Common Patterns
- Build: `tsup src/index.ts --format esm --dts --sourcemap --out-dir dist` per package; `pnpm build` builds only `packages/*`.
- Code-editor integrations implement core's `bindTextPane` adapter contract. They don't extend core.
- Edits are lossless: unknown syntax is preserved verbatim and every op produces the smallest possible text edit.

## Dependencies

### External
- `pele` ^1.6.0: renderer, a direct dependency of `@kilauea/dom` (themed via `--pele-*` CSS variables).
- `typescript` ^5.6.3, `tsup` ^8.5.1, `vitest`: tooling.
- `@changesets/cli` ^2.27.10: versioning and publishing (`pnpm release` = build + `changeset publish`).

## Manual Notes
