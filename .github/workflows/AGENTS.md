# workflows

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
The two GitHub Actions workflows of the public Kilauea repo: npm publishing via Trusted Publishing, and the public-PR→agents-private bridge.

## Key Files
| File | Description |
|------|-------------|
| `release.yml` | "Publish". Triggers: `workflow_dispatch`, and push to `main` touching `.changeset/**` or `packages/**`. Permissions `contents: write`, `id-token: write`; concurrency `kilauea-publish` (no cancel); 20 min timeout. |
| `monorepo-pr-bridge.yml` | "Monorepo PR Bridge". `pull_request_target` on opened/reopened/synchronize/ready_for_review/converted_to_draft/edited/closed. Jobs `acknowledge`, `sync`, `close`. |

## For AI Agents

### Working In This Directory
**release.yml flow:** checkout (fetch-depth 0) → `pnpm/setup` with one retry after 20s → Node 22 with npm registry → install npm@11 (pinned to the 11.x line; npm 12.0.0 lacks the sigstore module needed for provenance, bump only after verifying) → `pnpm install --frozen-lockfile` → `pnpm build` → "Detect changesets" counts `.changeset/*.md` excluding `README.md`. If any exist it skips publish (agents-private owns the Version PR; Copybara syncs the bump and deletes the changeset files). Otherwise `pnpm changeset publish` runs with `NPM_CONFIG_PROVENANCE=true` (the changesets CLI has no `--provenance` flag). If the log lacks "packages published successfully" it exits 0. Else it reads the version from `packages/core/package.json` (fixed group means all share it), verifies every non-private `packages/*` resolves on npm at that version (4 attempts with backoff), then `git push origin --tags`. `changeset publish` is idempotent, so re-running is safe.

**monorepo-pr-bridge.yml:** `acknowledge` runs only on `opened` and posts a public welcome comment. `sync` (non-`closed`) runs in the `inkeep-oss-sync` environment, whose required reviewers must approve every PR revision; it mints a GitHub App token (`OSS_SYNC_APP_ID`, `OSS_SYNC_APP_PRIVATE_KEY`) for `inkeep/agents-private`, checks it out into `agents-private/`, and runs `node .github/scripts/bridge-public-pr-to-monorepo.mjs sync` with `INTERNAL_BRANCH_PREFIX=public-pr/kilauea`, `MONOREPO_PATH_PREFIX=public/kilauea`, `INTERNAL_BASE_REF=main`. `close` runs the script's `close` mode. All jobs skip PRs whose head ref is `copybara/sync` (prevents circular sync). Because it uses `pull_request_target`, never check out or run PR-head code here.

### Testing Requirements
None locally; changes to `release.yml` are only verified by a real run. Do not add a changeset-creating step: that would break the ownership split.

### Common Patterns
SHA-pinned actions; `timeout-minutes` on every job; env vars passed to the script (`PUBLIC_TOKEN: github.token`, `INTERNAL_TOKEN`).

## Dependencies

### Internal
`../scripts/bridge-public-pr-to-monorepo.mjs`, root `package.json` (`build`), `.changeset/`, `packages/core/package.json`.

### External
`actions/checkout` v7.0.1, `pnpm/setup` v2.0.2, `actions/setup-node` (v6 in release, v4 in bridge), `actions/create-github-app-token` v3.1.1.

## Manual Notes
