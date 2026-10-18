# .github

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
GitHub automation for the public Kilauea repo (`prdlk/kilauea`). This repo is a Copybara-synced public mirror of `public/kilauea` inside the private `inkeep/agents-private` monorepo, so CI here has only two jobs: publish the five `@kilauea/*` packages to npm (`workflows/release.yml`) and bridge outside contributors' public PRs into agents-private (`workflows/monorepo-pr-bridge.yml` + `scripts/bridge-public-pr-to-monorepo.mjs`). There is no test/lint CI workflow here.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `workflows/` | Two GitHub Actions workflows: Publish, Monorepo PR Bridge (see `workflows/AGENTS.md`) |
| `scripts/` | Node script driven by the bridge workflow (see `scripts/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Everything here ships to the public repo through Copybara; the bridge script comments say sibling copies live in other `public/*` repos and "cannot import shared code", so keep it self-contained and code-shape aligned with them.
- Action `uses:` refs are pinned by commit SHA with a version comment; keep that convention.
- Version PRs are NOT created here: agents-private owns "Version Packages (kilauea)"; this repo only publishes (see `workflows/AGENTS.md`).

### Testing Requirements
No automated tests. The bridge script exports `buildCommitAttribution`, `buildInternalPrBody`, `buildWelcomePublicComment`, `listPublicPrCommits`, `prefixPatchPaths` for tests, but no test file exists in this directory. Workflows can only be exercised on GitHub.

### Common Patterns
Both workflows use Node 22 and `concurrency` groups (`kilauea-publish`, `monorepo-pr-bridge-<pr number>`).

## Dependencies

### Internal
Release workflow builds `packages/*` and reads `.changeset/`; see root `package.json` scripts.

### External
GitHub Actions: `actions/checkout`, `actions/setup-node`, `pnpm/setup`, `actions/create-github-app-token`.

## Manual Notes
