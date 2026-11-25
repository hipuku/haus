#!/usr/bin/env node
// The install smoke test for the registry. Builds registry.json, serves it on
// localhost, scaffolds a fresh Vite app outside the workspace, and installs
// each item with `shadcn add` into its own copy of that app, so an item has
// only what its own dependencies bring. Then, for each install:
//
//   1. every installed file must be byte-identical to its source in haus,
//   2. the app must typecheck and build,
//   3. every --haus-* property a stylesheet reads must be defined in the
//      built CSS, because an undefined var() fails silently.
//
// Every item runs twice, with `cssVariables` true and false in components.json. With
// false, shadcn rewrites class strings in `registry:ui` files and turned
// Badge's `.join(' ')` into `.join('')`, which typechecks and builds. Check 1
// exists for that case.
//
// The registry is for TypeScript projects, so components.json always has
// tsx: true here. With tsx: false, shadcn renames the files to .js and .jsx
// but leaves their content as it is, and the build fails; README says so.
//
// Needs the network (npm create, npm install). Not run in CI.

import { execFileSync, spawn } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const work = mkdtempSync(join(tmpdir(), 'haus-registry-'))
const out = join(work, 'r')
const port = 8700 + Math.floor(Math.random() * 200)
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8' })

const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
run('pnpm', ['exec', 'shadcn', 'build', '-o', out], root)

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: out,
  stdio: 'ignore',
})
const failures = []

try {
  await new Promise(r => setTimeout(r, 500))

  // One app is created and installed once, then copied for every install, so
  // each item lands in an app that holds nothing else. Installing every item
  // into one shared app let an earlier install supply a file a later item
  // forgot to depend on: with Badge's dependency on @hipuku/types removed, the
  // test still passed.
  // create-vite reads an absolute path as relative, so pass a bare name.
  const base = join(work, 'base')
  run('npm', ['create', '-y', 'vite@latest', 'base', '--', '--template', 'react-ts'], work)
  run('npm', ['install'], base)

  for (const cssVariables of [true, false]) {
    for (const item of registry.items) {
      const label = `${item.name}, cssVariables: ${cssVariables}`
      const app = join(work, `${item.name}-${cssVariables}`)
      cpSync(base, app, { recursive: true })
      writeFileSync(
        join(app, 'components.json'),
        JSON.stringify({
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'new-york',
          rsc: false,
          tsx: true,
          tailwind: { config: '', css: '', baseColor: 'neutral', cssVariables },
          aliases: {
            components: '@/components',
            ui: '@/components/ui',
            lib: '@/lib',
            utils: '@/lib/utils',
            hooks: '@/hooks',
          },
          registries: { '@hipuku': `http://127.0.0.1:${port}/{name}.json` },
        }),
      )

      // The workspace's pinned shadcn, run from the root with --cwd, so the CLI
      // that installs is the one that built the registry. npx in the app
      // would fetch whatever version is latest.
      run('pnpm', ['exec', 'shadcn', 'add', `@hipuku/${item.name}`, '--cwd', app, '--yes', '--overwrite'], root)
      for (const file of item.files) {
        const installed = readFileSync(join(app, 'src', file.target), 'utf8')
        if (installed !== readFileSync(join(root, file.path), 'utf8')) {
          failures.push(`${label}: ${file.target} differs from ${file.path}`)
        }
      }

      // A component is rendered so the build includes its stylesheet. Every
      // item, component or not, has to typecheck and build on its own.
      if (item.type === 'registry:ui') {
        const index = item.files.find(f => f.target.endsWith('/index.ts')).target
        const name = item.files
          .find(f => f.target.endsWith('.tsx'))
          .target.split('/')
          .pop()
          .replace('.tsx', '')
        writeFileSync(
          join(app, 'src/App.tsx'),
          [
            "import '@hipuku/tokens/index.css'",
            `import { ${name} } from './${index.replace(/\.ts$/, '')}'`,
            '',
            'export default function App() {',
            `  return <${name}>x</${name}>`,
            '}',
            '',
          ].join('\n'),
        )
      }
      try {
        run('npx', ['tsc', '-b'], app)
        run('npx', ['vite', 'build'], app)
      } catch (e) {
        failures.push(`${label}: typecheck or build failed\n${e.stdout}${e.stderr}`)
        continue
      }

      const built = readdirSync(join(app, 'dist/assets'))
        .filter(f => f.endsWith('.css'))
        .map(f => readFileSync(join(app, 'dist/assets', f), 'utf8'))
        .join('\n')
      for (const file of item.files.filter(f => f.path.endsWith('.css'))) {
        const reads = new Set(readFileSync(join(root, file.path), 'utf8').match(/--haus-[a-z0-9-]+/g) ?? [])
        for (const prop of reads) {
          if (!built.includes(`${prop}:`)) failures.push(`${label}: ${prop} read by ${file.path} is not defined`)
        }
      }
      console.log(`${label}: installed alone and checked`)
    }
  }
} finally {
  server.kill()
  if (!failures.length) rmSync(work, { recursive: true, force: true })
}

if (failures.length) {
  console.error(failures.join('\n'))
  console.error(`Left the apps in ${work}`)
  process.exit(1)
}
console.log('Registry smoke test passed')
