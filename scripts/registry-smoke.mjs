#!/usr/bin/env node
// The install smoke test for the registry. Builds registry.json, serves it on
// localhost, scaffolds a fresh Vite app outside the workspace and installs
// every item into it with `shadcn add`. Then, for each install:
//
//   1. every installed file must be byte-identical to its source in haus,
//   2. the app must typecheck and build,
//   3. every --haus-* property a stylesheet reads must be defined in the
//      built CSS, because an undefined var() fails silently.
//
// It runs twice, with `cssVariables` true and false in components.json. With
// false, shadcn rewrites class strings in `registry:ui` files and turned
// Badge's `.join(' ')` into `.join('')`, which typechecks and builds. Check 1
// exists for that case.
//
// Needs the network (npm create, npm install). Not run in CI.

import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
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

const server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: out, stdio: 'ignore' })
const failures = []

try {
  await new Promise(r => setTimeout(r, 500))
  for (const cssVariables of [true, false]) {
    // create-vite reads an absolute path as relative, so pass a bare name.
    const name = `app-${cssVariables}`
    const app = join(work, name)
    run('npm', ['create', '-y', 'vite@latest', name, '--', '--template', 'react-ts'], work)
    run('npm', ['install'], app)
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
        registries: { '@haus': `http://localhost:${port}/{name}.json` },
      }),
    )
    const label = `cssVariables: ${cssVariables}`
    for (const item of registry.items) {
      run('npx', ['shadcn', 'add', `@haus/${item.name}`, '--yes', '--overwrite'], app)
      for (const file of item.files) {
        const installed = readFileSync(join(app, 'src', file.target), 'utf8')
        if (installed !== readFileSync(join(root, file.path), 'utf8')) {
          failures.push(`${label}: ${file.target} differs from ${file.path}`)
        }
      }
    }

    // Render every item so the build includes its stylesheet.
    const uis = registry.items.filter(i => i.type === 'registry:ui')
    const imports = uis.map(i => {
      const index = i.files.find(f => f.target.endsWith('/index.ts')).target
      const name = i.files
        .find(f => f.target.endsWith('.tsx'))
        .target.split('/')
        .pop()
        .replace('.tsx', '')
      return { name, from: './' + index.replace(/\.ts$/, '') }
    })
    writeFileSync(
      join(app, 'src/App.tsx'),
      [
        "import 'haus-tokens/index.css'",
        ...imports.map(i => `import { ${i.name} } from '${i.from}'`),
        '',
        'export default function App() {',
        `  return <>${imports.map(i => `<${i.name}>x</${i.name}>`).join('')}</>`,
        '}',
        '',
      ].join('\n'),
    )
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
    for (const item of registry.items) {
      for (const file of item.files.filter(f => f.path.endsWith('.css'))) {
        const reads = new Set(readFileSync(join(root, file.path), 'utf8').match(/--haus-[a-z0-9-]+/g) ?? [])
        for (const prop of reads) {
          if (!built.includes(`${prop}:`)) failures.push(`${label}: ${prop} read by ${file.path} is not defined`)
        }
      }
    }
    console.log(`${label}: ${registry.items.length} items installed and checked`)
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
