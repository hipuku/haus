/**
 * The published stylesheet, checked as a published artefact rather than as
 * sources. Everything else in this package tests what is written; this tests
 * what a consumer installs.
 */
import { existsSync, readFileSync } from 'node:fs'
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
