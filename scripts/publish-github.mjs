#!/usr/bin/env node
// Publish the five @kilauea/* packages to GitHub Packages under this fork's
// owner scope. GitHub Packages only accepts a scope equal to the repository
// owner, so the source names stay @kilauea/* and the staged tarballs are
// renamed to @<owner>/kilauea-<dir> with their workspace deps rewritten to
// match. The repo's own versions are left alone: pass the version to publish.
//
//   node scripts/publish-github.mjs <version> [--owner prdlk] [--dry-run]
//
// Needs `pnpm build` to have run, and GITHUB_TOKEN with write:packages.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const REGISTRY = 'https://npm.pkg.github.com'
// dependency order: a package is published after everything it depends on
const PACKAGES = ['core', 'dom', 'codemirror', 'monaco', 'react']

const args = process.argv.slice(2)
const version = args.find((a) => !a.startsWith('--'))
const owner = args.includes('--owner') ? args[args.indexOf('--owner') + 1] : 'prdlk'
const dryRun = args.includes('--dry-run')
if (!version) {
  console.error('usage: node scripts/publish-github.mjs <version> [--owner <owner>] [--dry-run]')
  process.exit(2)
}
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
if (!token && !dryRun) {
  console.error('GITHUB_TOKEN (write:packages) is required to publish')
  process.exit(2)
}

const publishedName = (dir) => `@${owner}/kilauea-${dir}`
const sourceToPublished = Object.fromEntries(PACKAGES.map((dir) => [`@kilauea/${dir}`, publishedName(dir)]))

function rewriteDeps(deps) {
  if (!deps) return undefined
  return Object.fromEntries(
    Object.entries(deps).map(([name, range]) => [sourceToPublished[name] ?? name, sourceToPublished[name] ? version : range]),
  )
}

const stage = join(ROOT, '.publish')
rmSync(stage, { recursive: true, force: true })

for (const dir of PACKAGES) {
  const src = join(ROOT, 'packages', dir)
  if (!existsSync(join(src, 'dist', 'index.js'))) {
    console.error(`${dir}: dist/index.js is missing; run \`pnpm build\` first`)
    process.exit(1)
  }
  const pkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'))
  const { publishConfig = {}, scripts: _scripts, devDependencies: _dev, ...rest } = pkg
  const out = join(stage, dir)
  mkdirSync(out, { recursive: true })
  for (const entry of ['dist', 'src', 'README.md', 'CHANGELOG.md']) {
    if (existsSync(join(src, entry))) cpSync(join(src, entry), join(out, entry), { recursive: true })
  }
  // the built output and shipped sources import the sibling packages by
  // their source names; point them at the published ones
  for (const file of readdirSync(out, { recursive: true, withFileTypes: true })) {
    if (!file.isFile() || !/\.(m?js|d\.ts|ts|tsx|map|md)$/.test(file.name)) continue
    const path = join(file.parentPath, file.name)
    const text = readFileSync(path, 'utf8')
    const next = text.replace(/@kilauea\/(core|dom|codemirror|monaco|react)\b/g, (_, dir) => publishedName(dir))
    if (next !== text) writeFileSync(path, next)
  }
  cpSync(join(ROOT, 'LICENSE'), join(out, 'LICENSE'))
  const manifest = {
    ...rest,
    name: publishedName(dir),
    version,
    main: publishConfig.main ?? pkg.main,
    types: publishConfig.types ?? pkg.types,
    exports: publishConfig.exports ?? pkg.exports,
    dependencies: rewriteDeps(pkg.dependencies),
    peerDependencies: pkg.peerDependencies,
    repository: { type: 'git', url: `git+https://github.com/${owner}/kilauea.git`, directory: `packages/${dir}` },
    publishConfig: { registry: REGISTRY },
  }
  writeFileSync(join(out, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  // scoped auth for this registry only; the file lives in the staged copy
  writeFileSync(join(out, '.npmrc'), `@${owner}:registry=${REGISTRY}\n//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}\n`)

  const npmArgs = ['publish', '--registry', REGISTRY, '--tag', version.includes('-') ? 'next' : 'latest']
  if (dryRun) npmArgs.push('--dry-run')
  console.log(`\n→ ${manifest.name}@${version}${dryRun ? ' (dry run)' : ''}`)
  const result = spawnSync('npm', npmArgs, {
    cwd: out,
    stdio: 'inherit',
    env: { ...process.env, NODE_AUTH_TOKEN: token ?? '' },
  })
  if (result.status !== 0) {
    console.error(`${manifest.name}: npm publish exited with ${result.status}`)
    process.exit(result.status ?? 1)
  }
}
console.log(`\nPublished ${PACKAGES.map(publishedName).join(', ')} at ${version} to ${REGISTRY}`)
