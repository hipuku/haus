import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every type a component exports is reachable from the package root.
 *
 * `TabsAppearance` was added to `Tabs.tsx` and exported from neither barrel. It
 * built, typechecked, linted and passed 373 tests, and was found by grepping
 * `dist/index.d.ts` on a hunch. `haus#65`.
 *
 * `api-surface.test.tsx` could not catch it: that asserts over *values*, and a
 * type export has no runtime presence.
 *
 * `brand.test.ts` in haus-tokens has the precedent, and its comment says it was
 * written after exactly this: "the package root offered one of the four and the
 * decision records said it offered all four". The lesson did not travel here.
 *
 * **This reads the directory, not a list.** A check that enumerated the
 * components by hand would be the next list beside a directory, which is the
 * shape the whole defect belongs to.
 */

const SRC = join(process.cwd(), 'src')
const COMPONENTS = join(SRC, 'components')

/** Exported type and interface names declared in a file. */
function exportedTypes(file: string): string[] {
  const source = readFileSync(file, 'utf8')
  const names: string[] = []
  for (const m of source.matchAll(/^export\s+(?:type|interface)\s+([A-Za-z0-9_]+)/gm)) {
    names.push(m[1])
  }
  return names
}

/** Type names a barrel re-exports, from its `export type { ... }` clauses. */
function reExportedTypes(file: string): Set<string> {
  const source = readFileSync(file, 'utf8')
  const names = new Set<string>()
  for (const m of source.matchAll(/export\s+type\s*\{([^}]*)\}/g)) {
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim()
      if (name) names.add(name)
    }
  }
  return names
}

const dirs = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

describe('every exported type is reachable from the package root', () => {
  const root = reExportedTypes(join(SRC, 'index.ts'))

  it.each(dirs)('%s re-exports its own types from its folder barrel', dir => {
    const impl = join(COMPONENTS, dir, `${dir}.tsx`)
    if (!existsSync(impl)) return
    const barrel = join(COMPONENTS, dir, 'index.ts')
    const own = reExportedTypes(barrel)
    const missing = exportedTypes(impl).filter(t => !own.has(t))
    expect(missing, `${dir}/index.ts does not re-export: ${missing.join(', ')}`).toEqual([])
  })

  it.each(dirs)('%s types reach src/index.ts', dir => {
    const impl = join(COMPONENTS, dir, `${dir}.tsx`)
    if (!existsSync(impl)) return
    const missing = exportedTypes(impl).filter(t => !root.has(t))
    expect(missing, `src/index.ts does not re-export: ${missing.join(', ')}`).toEqual([])
  })
})
