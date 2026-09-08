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
import { brandRoles, brandRolesBase, brandRolesFeedback } from './brand'

const SRC = join(process.cwd(), 'src')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')

const brand = read('brand.css')
const semantics = read('semantics.css')

const declaredIn = (css: string) =>
  new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))

const BRAND = declaredIn(brand)
const BRAND_ENTRIES = [...BRAND].filter((n) => n.startsWith('--haus-brand-'))

/**
 * The tier split, haus#47. A role's tier is its ramp, so the rule survives
 * someone reordering brand.css.
 */
const FEEDBACK_RAMPS = ['info', 'success', 'warning', 'error'] as const
const rampOf = (n: string) => n.replace('--haus-brand-', '').split('-')[0]
const isFeedback = (n: string) => (FEEDBACK_RAMPS as readonly string[]).includes(rampOf(n))
const BASE_ENTRIES = BRAND_ENTRIES.filter((n) => !isFeedback(n))
const FEEDBACK_ENTRIES = BRAND_ENTRIES.filter(isFeedback)

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

  it('splits into a required tier and an optional one', () => {
    // haus#47. Both halves have to be non-empty or the split has collapsed and
    // every assertion below it passes vacuously.
    expect(BASE_ENTRIES.length).toBe(28)
    expect(FEEDBACK_ENTRIES.length).toBe(26)
    expect(BASE_ENTRIES.length + FEEDBACK_ENTRIES.length).toBe(BRAND_ENTRIES.length)
  })

  it('generates both tiers from the same file', () => {
    expect([...brandRolesBase].sort()).toEqual([...BASE_ENTRIES].sort())
    expect([...brandRolesFeedback].sort()).toEqual([...FEEDBACK_ENTRIES].sort())
  })

  it.each(readdirSync(join(SRC, 'brands')))('%s supplies the whole base tier', (file) => {
    // A contract with one implementation is not a contract. This is what makes
    // the second brand a proof rather than a decoration.
    //
    // The base tier only, since haus#47. A brand omitting the feedback tier is
    // legitimate and inherits it from :root: custom properties inherit, and a
    // named brand overrides only what it declares. Omitting a base entry is not
    // legitimate, because nothing upstream is a sensible substitute for a
    // product's own surface or ink.
    const theme = declaredIn(read(join('brands', file)))
    const missing = BASE_ENTRIES.filter((n) => !theme.has(n))
    expect(missing).toEqual([])
  })

  it.each(readdirSync(join(SRC, 'brands')))('%s supplies whole feedback ramps or none', (file) => {
    // The rule that holds the optional half honest, and the one a type cannot
    // express. Half a ramp is worse than no ramp: the entries a brand does
    // declare take its hue and the ones it forgets inherit haus's, so an error
    // state renders in two unrelated colours and every check still passes,
    // because each individual var() resolves perfectly well.
    const theme = declaredIn(read(join('brands', file)))
    const partial = FEEDBACK_RAMPS.map((ramp) => {
      const entries = FEEDBACK_ENTRIES.filter((n) => rampOf(n) === ramp)
      const supplied = entries.filter((n) => theme.has(n))
      return { ramp, supplied: supplied.length, of: entries.length }
    }).filter((r) => r.supplied > 0 && r.supplied < r.of)
    expect(partial).toEqual([])
  })

  it.each(readdirSync(join(SRC, 'brands')))('%s changes nothing but the brand', (file) => {
    const css = read(join('brands', file))
    // A brand may declare its own ramp and the brand entries. A role, a
    // component class or a raw override is out of bounds: it would mean the
    // brand had reached past the contract, which is exactly what the running
    // note in the acceptance test is for.
    //
    // The ramp is matched rather than assumed unprefixed. Until the 1.0 cut
    // vault.css declared `--ruby-500`, and this assertion passed only because
    // that name did not begin with `--haus-`: the very naming bug the cut fixed
    // was what let the contract look kept. Prefixing the ten steps failed this
    // test, which is the test doing its job a release late.
    const RAMP_STEP = /^--haus-[a-z]+-\d+$/
    const strays = [...declaredIn(css)].filter(
      (n) => n.startsWith('--haus-') && !n.startsWith('--haus-brand-') && !RAMP_STEP.test(n),
    )
    expect(strays).toEqual([])
  })
})
