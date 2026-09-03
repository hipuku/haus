/**
 * The published stylesheet, checked as a published artefact rather than as
 * sources. Everything else in this package tests what is written; this tests
 * what a consumer installs.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DIST = join(process.cwd(), 'dist', 'styles.css')
const built = existsSync(DIST) ? readFileSync(DIST, 'utf8') : null

describe.skipIf(built === null)('the built stylesheet', () => {
  it('declares its own cascade layer', () => {
    // Decision B1. Unlayered, this competed with a consumer's own module CSS by
    // source order — whether a component's style or an override won depended on
    // import order rather than on anything either declared.
    expect(built).toMatch(/^@layer haus\.components \{/)
    expect(built!.trimEnd().endsWith('}')).toBe(true)
  })

  it('keeps every @import above the layer block', () => {
    // An @import after any other rule is dropped by the parser, so hoisting is
    // not tidiness. There are none today and this is what says so.
    const layerAt = built!.indexOf('@layer haus.components')
    for (const m of built!.matchAll(/@import[^;]+;/g)) {
      expect(m.index!, `an @import sits inside the layer block`).toBeLessThan(layerAt)
    }
  })

  it('reads only namespaced properties', () => {
    // The namespace is the promise that adopting haus does not require auditing
    // your own. One unprefixed read in the shipped file breaks it.
    const unprefixed = [...built!.matchAll(/var\((--(?!haus-)[a-z][\w-]*)/g)].map((m) => m[1])
    expect([...new Set(unprefixed)]).toEqual([])
  })
})

/**
 * Decision 0012, enforced across the package rather than per component.
 *
 * A tone rule may remap custom properties and may declare nothing else; the
 * variant or appearance rules read them. Written the other way — a tone setting
 * background, border and colour outright — the tone rule sits at equal
 * specificity to the weight rules setting the same properties, and whichever
 * was written last wins whatever the caller asked for. That is exactly how
 * `<Button variant="ghost" tone="error">` came to render as a solid button.
 *
 * This is checkable only against the source. Components run under `css: false`,
 * so the DOM shows both classes present whether or not they compose, and axe
 * sees no colour at all.
 */
const COMPONENTS = join(process.cwd(), 'src', 'components')
const TONES = ['neutral', 'info', 'success', 'warning', 'error']

const stylesheets = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ name: entry.name, path: join(COMPONENTS, entry.name, `${entry.name}.module.css`) }))
  .filter((sheet) => existsSync(sheet.path))

/** Rules whose selector list names a tone class on its own. A compound like
 *  `.neutral.subtle` is not one: it already says both things and cannot be
 *  outvoted by source order. */
function toneRules(css: string) {
  return [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .map((m) => ({
      selectors: m[1].split(',').map((sel) => sel.trim()),
      body: m[2],
    }))
    .filter((rule) => rule.selectors.some((sel) => TONES.includes(sel.replace(/^\./, '')) && sel.startsWith('.')))
}

describe('tone rules declare custom properties only', () => {
  it('finds the stylesheets it is meant to read', () => {
    // A wrong path here would make every case below vacuously pass.
    expect(stylesheets.length).toBeGreaterThan(10)
    expect(stylesheets.some((sheet) => sheet.name === 'Button')).toBe(true)
    expect(toneRules(readFileSync(join(COMPONENTS, 'Button', 'Button.module.css'), 'utf8')).length)
      .toBeGreaterThan(0)
  })

  it.each(stylesheets.map((sheet) => [sheet.name, sheet.path]))('%s', (_name, path) => {
    for (const rule of toneRules(readFileSync(path, 'utf8'))) {
      const declared = [...rule.body.matchAll(/(?:^|;)\s*([\w-]+)\s*:/g)].map((m) => m[1])
      const direct = declared.filter((prop) => !prop.startsWith('--'))
      expect(direct, `${rule.selectors.join(', ')} sets ${direct.join(', ')} directly`).toEqual([])
    }
  })
})
