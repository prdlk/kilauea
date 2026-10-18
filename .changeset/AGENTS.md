# .changeset

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Changesets configuration for versioning and publishing the five `@kilauea/*` packages. Pending release notes are `.changeset/*.md` files; currently only `config.json` is present.

## Key Files
| File | Description |
|------|-------------|
| `config.json` | `fixed` group of `@kilauea/core`, `dom`, `react`, `codemirror`, `monaco` (always bumped to one shared version); `access: public`; `baseBranch: main`; `commit: false`; `updateInternalDependencies: patch`; `changelog: @changesets/cli/changelog`; `ignore: ["playground", "js-playground", "site"]`; `linked: []`. |

## For AI Agents

### Working In This Directory
- Root scripts: `pnpm changeset` (add one), `pnpm version-packages` (`changeset version`), `pnpm release` (`pnpm build && changeset publish`).
- Because of the `fixed` group, any changeset touching one package bumps all five to the same version; `.github/workflows/release.yml` relies on this and reads the version from `packages/core/package.json`.
- Adding a new publishable package under `packages/` requires adding it to `fixed` (the release verification loop checks every non-private `packages/*`).
- Apps are in `ignore`; never add changesets for them.
- `.github/workflows/release.yml` opens the "Version Packages" PR (`pnpm changeset version`) while any `.changeset/*.md` (other than `README.md`) is on `main`, and publishes to GitHub Packages once none remain. Do not hand-edit versions.

### Testing Requirements
None; `pnpm changeset status` can inspect state.

### Common Patterns
Changeset files are standard frontmatter markdown naming packages and bump types.

## Dependencies

### Internal
`packages/*`, `.github/workflows/release.yml`.

### External
`@changesets/cli` ^2.27.10.

## Manual Notes
