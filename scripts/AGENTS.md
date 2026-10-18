# scripts

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Repo-level tooling. Contains `check-agent.mjs`, the entry point behind `pnpm check:agent`: a gate that verifies installed dependencies match the lockfile, then runs a root script across the whole workspace.

## Key Files
| File | Description |
|------|-------------|
| `check-agent.mjs` | CLI `node scripts/check-agent.mjs <script> [--base=<commit>] [--all] [--all-because=<reason>]`. Root `check:agent` is `node scripts/check-agent.mjs test`. |

## For AI Agents

### Working In This Directory
- First arg is the root script name; missing or starting with `-` exits 2. Unknown flags exit 2. Accepted: `--base=<commit>`, `--all`, `--all-because=<reason>`, `--` (ignored), or env `GATE_BASE_SHA`. All are only echoed in the banner: the script always runs `pnpm run <script>` over the whole subtree (`SUBTREE = 'Kilauea'`) in the repo root with inherited stdio, and nothing is narrowed.
- Install check (`installProblem`) runs before anything: `node_modules` missing → "not installed"; if `pnpm-lock.yaml` exists, `node_modules/.pnpm/lock.yaml` missing or byte-different → "stale"; unreadable file → "unreadable" (with chmod hint). No lockfile → check passes.
- On a problem it prints two stderr lines, the second prefixed `NOT-RUN: check:agent (Kilauea) (...)`, and exits **77**. Treat 77 as "not run", not as a test failure; fix with `pnpm install` at the repo root.
- Child exit: spawn error → exit 1; killed by signal → exit `128 + signal number`; otherwise child status.
- Keep the `NOT-RUN:` line format stable; external tooling presumably parses it `[INFERENCE]`.

### Testing Requirements
`pnpm check:agent` (runs `pnpm run test`, i.e. `pnpm -r run test`). No tests for the script itself.

### Common Patterns
Node ESM using `spawnSync`, `existsSync`/`readFileSync`, `os.constants.signals`.

## Dependencies

### Internal
Root `package.json` scripts, `pnpm-lock.yaml`.

### External
Node built-ins only; pnpm 12.8.1 (`packageManager`).

## Manual Notes
