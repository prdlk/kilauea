# .github

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-18

## Purpose
GitHub Actions for `prdlk/kilauea`: a CI check on every PR and push, and a release pipeline driven by changesets that versions the five `@kilauea/*` packages together and publishes them to GitHub Packages.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `workflows/` | `ci.yml` and `release.yml` (see `workflows/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Both workflows use `pnpm/action-setup@v4` (reads `packageManager` from the root `package.json`) and Node 22.
- Releases need no secrets: `GITHUB_TOKEN` with `packages: write` publishes to `npm.pkg.github.com`, and `contents`/`pull-requests: write` lets `changesets/action` open the Version Packages PR.
- The site is deployed from a developer machine (`pnpm deploy:site`, see `apps/site/AGENTS.md`); there is no deploy workflow because no Cloudflare API token is stored in the repo.

### Testing Requirements
Workflows can only be exercised on GitHub: `gh run list`, `gh run view <id> --log-failed`.

## Dependencies

### Internal
`scripts/publish-github.mjs` (publish step), `.changeset/config.json` (fixed version group).

### External
`actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `changesets/action@v1`.

## Manual Notes
