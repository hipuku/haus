/**
 * The semantic layer is the one token file written by hand: primitives.css,
 * index.ts and tokens.json are generated from tokens.json and guarded by
 * `tokens:check`. Nothing guarded semantics.css, so the rules its own header
 * and docs/tokens.md state were true only by inspection. This checks them.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')

const semantics = read('semantics.css')
const primitives = read('primitives.css')
const motion = read('motion.css')
const brand = read('brand.css')

/** Custom properties a file declares, e.g. `--haus-color-ink-primary`. */
const declared = (css: string) =>
  new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))

/** Custom properties a file reads through `var(--x)`. */
const referenced = (css: string) =>
  new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))

const SEMANTIC = declared(semantics)
// brand.css joined the layers when A3 split it out of this file: semantics now
// reads --haus-brand-* entries rather than palette ramps, and those are declared
// there.
const AVAILABLE = new Set([
  ...SEMANTIC,
  ...declared(primitives),
  ...declared(motion),
  ...declared(brand),
])

describe('semantics.css', () => {
  it('reads the token files it is meant to read', () => {
    // A wrong path here would make every assertion below vacuously pass.
    expect(SEMANTIC.size, `no custom properties found in ${join(SRC, 'semantics.css')}`).toBeGreaterThan(100)
    expect(declared(primitives).size).toBeGreaterThan(100)
  })

  it('every token it references is declared in the token layers', () => {
    const missing = [...referenced(semantics)].filter((t) => !AVAILABLE.has(t))
    expect(missing).toEqual([])
  })

  it('declares no raw values', () => {
    // Every custom property here resolves through var(), whether directly, as
    // a relative-colour computation over one, or as a shadow built from them.
    const raw = [...semantics.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)]
      .filter(([, , value]) => !value.includes('var('))
      .map(([, name]) => name)
    expect(raw).toEqual([])
  })

  it('pairs every subtle and default surface with an on-* text token', () => {
    const families = ['primary', 'info', 'success', 'warning', 'error']
    const unpaired: string[] = []
    for (const family of families) {
      for (const step of ['subtle', 'default']) {
        const surface = `--haus-color-${family}-${step}`
        const ink = `--haus-color-${family}-on-${step}`
        if (SEMANTIC.has(surface) && !SEMANTIC.has(ink)) unpaired.push(surface)
      }
    }
    // primary-default's paired ink is --color-ink-on-aronia, named for the
    // palette it sits on rather than the role, because it is shared.
    expect(unpaired).toEqual(['--haus-color-primary-default'])
    expect(SEMANTIC.has('--haus-color-ink-on-aronia')).toBe(true)
  })

  it('gives every interactive scale a disabled state', () => {
    for (const scale of ['surface', 'ink', 'border', 'primary']) {
      expect(SEMANTIC.has(`--haus-color-${scale}-disabled`), `--haus-color-${scale}-disabled`).toBe(true)
    }
  })

  it('names no palette in a colour role', () => {
    // "aronia" is allowed in --color-ink-on-aronia only: it names the surface
    // the text sits on. Every other palette name belongs to primitives.css.
    const palettes = ['aronia', 'damson', 'elderberry', 'greengage', 'mango', 'cherry']
    const offenders = [...SEMANTIC].filter(
      (t) => t !== '--haus-color-ink-on-aronia' && palettes.some((p) => t.includes(p)),
    )
    expect(offenders).toEqual([])
  })

  it('keeps spacing roles on the primitive ladder', () => {
    // Every inset/gap/stack step aliases a --space-N primitive directly, so a
    // step is the same size whichever role reads it.
    const roles = [...semantics.matchAll(/^\s*(--haus-space-(?:inset|gap|stack)-[\w-]+)\s*:\s*var\((--haus-space-\d+)\)/gm)]
    expect(roles.length).toBeGreaterThan(10)
    const sizeOf = new Map<string, string>()
    for (const [, , primitive] of roles) expect(declared(primitives).has(primitive)).toBe(true)
    for (const [, role, primitive] of roles) {
      const step = role.replace(/^--haus-space-(?:inset|gap|stack)-/, '')
      const seen = sizeOf.get(step)
      if (seen) expect(primitive, `${role} disagrees with an earlier ${step}`).toBe(seen)
      else sizeOf.set(step, primitive)
    }
  })
})
