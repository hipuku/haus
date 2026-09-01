/**
 * Every contrast claim in this package, measured.
 *
 * The component suite runs with `css: false`, so axe there sees unstyled DOM and
 * `color-contrast` can never fire — which is why two comments in semantics.css
 * stated 6.82:1 and 7.05:1 and nothing checked either. Measuring the token
 * values directly is the answer rather than turning CSS on: these are claims
 * about the palette, and the palette is what should be asked.
 *
 * Resolved by hand through primitives → brand → semantics, because that chain is
 * exactly what the split rearranged and a test that walked it wrongly would pass
 * for the wrong reason. `reads the files it is meant to read` guards that.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { wcagContrast } from 'haus-colour-utils'

const SRC = join(process.cwd(), 'src')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')

/** Every `--x: value;` in a file. */
function declarations(css: string): Map<string, string> {
  return new Map(
    [...css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]),
  )
}

const ALL = new Map([
  ...declarations(read('primitives.css')),
  ...declarations(read('brand.css')),
  ...declarations(read('semantics.css')),
])

/** Follow `var(--a)` chains down to a literal colour. */
function resolve(name: string, seen = new Set<string>()): string | null {
  if (seen.has(name)) return null
  seen.add(name)
  const value = ALL.get(name)
  if (!value) return null
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value)
  if (ref) return resolve(ref[1], seen)
  // Relative colour syntax resolves to a real colour but not to one this can
  // parse without a browser, so those pairs are out of scope here.
  return value.startsWith('oklch(from') ? null : value
}

/** The `on-*` ink for each surface, as semantics.css pairs them. */
const PAIRS: Array<[surface: string, ink: string, min: number]> = [
  ['--haus-color-primary-default', '--haus-color-ink-on-aronia', 4.5],
  ['--haus-color-primary-subtle', '--haus-color-primary-on-subtle', 4.5],
  ['--haus-color-info-subtle', '--haus-color-info-on-subtle', 4.5],
  ['--haus-color-info-default', '--haus-color-info-on-default', 4.5],
  ['--haus-color-success-subtle', '--haus-color-success-on-subtle', 4.5],
  ['--haus-color-success-default', '--haus-color-success-on-default', 4.5],
  ['--haus-color-warning-subtle', '--haus-color-warning-on-subtle', 4.5],
  ['--haus-color-warning-default', '--haus-color-warning-on-default', 4.5],
  ['--haus-color-error-subtle', '--haus-color-error-on-subtle', 4.5],
  ['--haus-color-error-default', '--haus-color-error-on-default', 4.5],
]

describe('contrast', () => {
  it('reads the files it is meant to read', () => {
    // A broken resolver would make every assertion below vacuously pass.
    expect(ALL.size).toBeGreaterThan(250)
    expect(resolve('--haus-color-surface-default')).toMatch(/^oklch\(/)
    expect(resolve('--haus-color-ink-primary')).toMatch(/^oklch\(/)
  })

  it('body text clears AA on every surface it can sit on', () => {
    const surfaces = ['default', 'subtle', 'raised', 'overlay', 'sunken']
    for (const step of surfaces) {
      const bg = resolve(`--haus-color-surface-${step}`)
      const fg = resolve('--haus-color-ink-primary')
      expect(bg, `--haus-color-surface-${step} did not resolve`).not.toBeNull()
      const { ratio } = wcagContrast(fg!, bg!)
      expect(ratio, `ink-primary on surface-${step} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('secondary text clears AA on the default surface', () => {
    const { ratio } = wcagContrast(
      resolve('--haus-color-ink-secondary')!,
      resolve('--haus-color-surface-default')!,
    )
    expect(ratio, `ink-secondary is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(PAIRS)('%s pairs with an ink that clears AA', (surface, ink, min) => {
    const bg = resolve(surface)
    const fg = resolve(ink)
    if (bg === null || fg === null) return // a relative-colour pair, out of scope
    const { ratio } = wcagContrast(fg, bg)
    expect(ratio, `${ink} on ${surface} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
  })

  it('the focus ring clears SC 1.4.11 against every surface', () => {
    // 3:1 for a non-text indicator. This is the assertion core's ring failed at
    // 1.60:1 for its whole life, and nothing here would have caught it either.
    const ring = resolve('--haus-color-border-focus')
    for (const step of ['default', 'subtle', 'sunken']) {
      const bg = resolve(`--haus-color-surface-${step}`)
      const { ratio } = wcagContrast(ring!, bg!)
      expect(ratio, `focus ring on surface-${step} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
    }
  })
})
