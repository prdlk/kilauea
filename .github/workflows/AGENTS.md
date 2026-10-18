# workflows

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-18

## Purpose
The two GitHub Actions workflows.

## Key Files
| File | Description |
|------|-------------|
| `ci.yml` | On PRs and pushes to `main`: `pnpm install --frozen-lockfile`, `typecheck`, `test`, `build`, `build:site`. Concurrency per ref, cancels superseded runs |
| `release.yml` | On pushes to `main` touching `.changeset/**`, `packages/**`, the publish script or itself, plus manual dispatch. With pending changesets, `changesets/action` opens/updates the "Version Packages" PR (`pnpm changeset version`). With none, `node scripts/publish-github.mjs` publishes the current version as `@prdlk/kilauea-*` to GitHub Packages (already-published versions are skipped) and a `v<version>` tag is pushed when something new shipped |

## For AI Agents

### Working In This Directory
- Release flow: add a changeset → merge → the bot PR bumps versions and CHANGELOGs → merge the bot PR → the next run publishes and tags. `workflow_dispatch` re-runs are safe.
- The publish script needs `pnpm build` first (the workflow runs it); it stages renamed copies under `.publish/` and never edits the repo's package names.
- `pnpm install` in CI fails on any dependency with a postinstall script that is not listed under `allowBuilds` in `pnpm-workspace.yaml` (pnpm 12 strict builds); `workerd` (via `wrangler`) is listed for that reason.

### Testing Requirements
`gh run list`, `gh run view <id> --log-failed`.

## Dependencies

### Internal
`../../scripts/publish-github.mjs`, `../../pnpm-workspace.yaml` (`allowBuilds`), `../../.changeset/config.json`.

### External
`changesets/action@v1`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/checkout@v4`.

## Manual Notes
