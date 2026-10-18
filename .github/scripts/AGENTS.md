# scripts

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Holds the single Node ESM script that mirrors a public Kilauea PR into the private `inkeep/agents-private` monorepo as an internal PR, so Copybara can later sync it back.

## Key Files
| File | Description |
|------|-------------|
| `bridge-public-pr-to-monorepo.mjs` | CLI with modes `acknowledge`, `sync`, `close` (`process.argv[2]`; anything else throws `Unsupported mode`). Dependency-free (node built-ins plus `fetch`). |

## For AI Agents

### Working In This Directory
- **acknowledge:** `acknowledgePublicPr` posts `buildWelcomePublicComment()` on the public PR.
- **sync** (`syncPublicPr`): required env `PUBLIC_TOKEN`, `INTERNAL_TOKEN`, `PUBLIC_REPO`, `INTERNAL_REPO`, `INTERNAL_REPO_DIR`, `MONOREPO_PATH_PREFIX`, `INTERNAL_BASE_REF`, `INTERNAL_BRANCH_PREFIX`, `PUBLIC_PR_NUMBER`; optional `PUBLIC_PR_ACTION`, `PUBLIC_PR_PATH_REWRITES` (JSON), `BRIDGE_EXCLUDED_PATHS` (JSON array of public-repo path prefixes). Branch name is `<prefix>-<pr number>`. For `edited`/`ready_for_review`/`converted_to_draft` on an existing internal PR it only updates title/body/draft state (`ensureDraftState`). Otherwise: fetch internal base, `checkout -B` branch, add temporary remote `bridge-public-<n>` with an `x-access-token` URL, fetch PR head/base at depth 10000 then 50000, get the PR `.diff` (`fetchPullRequestDiff`; falls back to local 3-dot `git diff` with a 50 MB buffer when GitHub rejects it as too large, per `isDiffTooLargeError`), `filterDiffByPath`, `prefixPatchPaths` (prepends mirror path, applies `pathRewrites`), `git apply --index --3way`, commit as `inkeep-oss-sync[bot]` with message `sync(oss): mirror <repo>#<n>` plus attribution/co-author trailers (`buildCommitAttribution`), run `reconcileMonorepoPatches` (patches `agents-manage-ui/next.config.ts` with `outputFileTracingRoot`; a no-op for Kilauea), `push --force-with-lease`, then create or update the internal PR (draft mirrors the public PR; body capped at `GITHUB_PR_BODY_LIMIT` 65536). The temp remote is always removed in `finally`.
- **close** (`closeLinkedInternalPr`): if an open internal PR exists and the public PR was not merged (`merged_at` null), comments, closes it, and deletes the branch (cleanup failure only logged).
- Error text goes through `sanitizeErrorMessage` to strip `x-access-token` credentials; keep that for any new logging of git/HTTP failures.
- Header comments say four sibling copies exist under `public/*` in agents-private; keep changes aligned with them.
- `main()` only runs when the file is the entry point, so the exports can be imported by tests.

### Testing Requirements
No test file here. Exports for testing: `buildCommitAttribution`, `buildInternalPrBody`, `buildWelcomePublicComment`, `listPublicPrCommits`, `prefixPatchPaths`. Do not run `sync`/`close` locally (they push to agents-private).

### Common Patterns
`run()` wraps `execFileSync`; `githubRequest`/`githubGraphql` are the REST/GraphQL helpers; `requireEnv` and `parseJsonEnv` read config.

## Dependencies

### Internal
Invoked by `../workflows/monorepo-pr-bridge.yml`.

### External
Node 22 built-ins only; GitHub REST/GraphQL API.

## Manual Notes
