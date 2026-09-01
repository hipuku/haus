/**
 * The split only means anything if the three files agree, and nothing else can
 * check that: brand.css chooses, semantics.css reads, and a second brand has to
 * satisfy the same set. An entry missing from any of the three fails silently —
 * `var(--x)` for an undefined `--x` drops the declaration with no warning, no
 * build error, and a component that renders unstyled.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { brandRoles } from './brand'

const SRC = join(process.cwd(), 'src')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')

const brand = read('brand.css')
const semantics = read('semantics.css')

const declaredIn = (css: string) =>
  new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))

const BRAND = declaredIn(brand)
const BRAND_ENTRIES = [...BRAND].filter((n) => n.startsWith('--haus-brand-'))

describe('the brand map', () => {
  it('reads the files it is meant to read', () => {
    expect(BRAND_ENTRIES.length).toBeGreaterThan(40)
  })

  it('contains nothing but brand entries', () => {
    // "No new names, no raw values, no structure" — the contract. A brand author
    // reads a flat list of choices, and anything else here is a second place for
    // the role vocabulary to live.
    const strays = [...BRAND].filter((n) => !n.startsWith('--haus-brand-'))
    expect(strays).toEqual([])
  })

  it('names no palette in semantics.css any more', () => {
    // The finding this whole wave exists for: the brand and the role system were
    // the same file, so taking the roles meant taking the palette.
    const palettes = ['aronia', 'damson', 'elderberry', 'greengage', 'mango', 'cherry']
    const offenders = [...semantics.matchAll(/^\s*(--haus-[\w-]+)\s*:\s*([^;]+);/gm)]
      .filter(([, , value]) => palettes.some((p) => value.includes(`--haus-${p}-`)))
      .map(([, name]) => name)
    expect(offenders).toEqual([])
  })

  it('has a brand entry for every role that reads one', () => {
    const wanted = [...semantics.matchAll(/var\(\s*(--haus-brand-[\w-]+)/g)].map((m) => m[1])
    const missing = [...new Set(wanted)].filter((n) => !BRAND.has(n))
    expect(missing).toEqual([])
  })

  it('has a role reading every brand entry', () => {
    // The other direction. An entry nothing reads is a promise to brand authors
    // that costs them a line and buys nothing.
    const read = new Set([...semantics.matchAll(/var\(\s*(--haus-brand-[\w-]+)/g)].map((m) => m[1]))
    expect(BRAND_ENTRIES.filter((n) => !read.has(n))).toEqual([])
  })

  it('generates BrandMap from the same file', () => {
    expect([...brandRoles].sort()).toEqual([...BRAND_ENTRIES].sort())
  })

  it.each(readdirSync(join(SRC, 'brands')))('%s supplies every entry', (file) => {
    // A contract with one implementation is not a contract. This is what makes
    // the second brand a proof rather than a decoration.
    const theme = declaredIn(read(join('brands', file)))
    const missing = BRAND_ENTRIES.filter((n) => !theme.has(n))
    expect(missing).toEqual([])
  })

  it.each(readdirSync(join(SRC, 'brands')))('%s changes nothing but the brand', (file) => {
    const css = read(join('brands', file))
    // A brand may declare its own palette and the brand entries. A role, a
    // component class or a raw override is out of bounds: it would mean the
    // brand had reached past the contract, which is exactly what the running
    // note in the acceptance test is for.
    const strays = [...declaredIn(css)].filter(
      (n) => !n.startsWith('--haus-brand-') && n.startsWith('--haus-'),
    )
    expect(strays).toEqual([])
  })
})
