/**
 * Physical direction-sensitive CSS is banned in the components, and this is the
 * only thing that can say so.
 *
 * The component tests run with `css: false`, so nothing in this package ever
 * reads a computed style — that is also why every contrast claim is asserted
 * against token values rather than against a rendered element. A rendered RTL
 * assertion is therefore not available here, and the visual half belongs to a
 * Storybook story under a Chromatic diff. What is available is the source, and
 * the source is where the mistake is made: `margin-left` is a typo away from
 * every time someone means "the side the text starts on".
 *
 * Scoped to the inline axis on purpose. Right-to-left flips inline and leaves
 * block alone, so `top` and `bottom` stay legal — the Toggle thumb's `top: 2px`
 * is not a defect. The components are written in `margin-block-*` anyway, for
 * consistency rather than necessity.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENTS = join(process.cwd(), 'src', 'components')

/** Every component stylesheet, as [name, source]. */
function stylesheets(): [string, string][] {
  const out: [string, string][] = []
  for (const dir of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const f of readdirSync(join(COMPONENTS, dir.name))) {
      if (f.endsWith('.module.css')) {
        out.push([`${dir.name}/${f}`, readFileSync(join(COMPONENTS, dir.name, f), 'utf8')])
      }
    }
  }
  return out
}

const SHEETS = stylesheets()

/** The same source with every comment removed. A rule that is being explained is
 *  not a rule that is in force, and these assertions read prose otherwise. */
const CODE: [string, string][] = SHEETS.map(([file, css]) => [
  file,
  css.replace(/\/\*[\s\S]*?\*\//g, ''),
])

/** Property names that pin a value to the left or the right of the box. */
const PHYSICAL =
  /(^|[\s{;])(margin|padding|border|inset|scroll-margin|scroll-padding)?-?(left|right)\b\s*(-[a-z-]+)?\s*:/

describe('components are written in logical properties', () => {
  it('reads the stylesheets it is meant to read', () => {
    // A wrong path here would make every assertion below vacuously pass.
    expect(SHEETS.length).toBeGreaterThan(10)
  })

  it('uses no physical inline-axis property', () => {
    const offenders: string[] = []
    for (const [file, css] of CODE) {
      css.split('\n').forEach((line, i) => {
        if (PHYSICAL.test(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`)
      })
    }
    expect(offenders).toEqual([])
  })

  it('never leaves a translateX without a direction to follow', () => {
    // The one thing a rename cannot fix: CSS has no logical transform, so a
    // sliding element needs a sign that an [dir='rtl'] rule can flip. Toggle's
    // thumb is the case — without this it slides out of the wrong end of a
    // right-to-left track, and no rename would have caught it.
    const offenders = CODE.filter(
      ([, css]) => css.includes('translateX(') && !css.includes("[dir='rtl']") && !css.includes('[dir="rtl"]'),
    ).map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('gives every focus ring a forced-colors fallback', () => {
    // Every ring in this system is a box-shadow, and forced-colors mode drops
    // box-shadow entirely — so a ring without this block is no ring at all in
    // Windows High Contrast. The rule cannot be written once globally: three
    // components draw the ring on a sibling of a visually hidden input, so a
    // blanket :focus-visible outline would land on an element nobody can see.
    const offenders = CODE.filter(
      ([, css]) => css.includes('--shadow-focus') && !css.includes('forced-colors: active'),
    ).map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('rings on the keyboard, not the pointer', () => {
    // :focus-within fires for a mouse press too. Input drew its ring on a
    // wrapper, which is not focusable, and reached for :focus-within to do it —
    // :has(:focus-visible) keeps the ring where it has to be drawn and the rule
    // every other control follows.
    const offenders = CODE.filter(([, css]) => css.includes(':focus-within')).map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('has text-align on the logical keywords', () => {
    const offenders: string[] = []
    for (const [file, css] of CODE) {
      for (const m of css.matchAll(/text-align:\s*(left|right)\b/g)) {
        offenders.push(`${file} text-align: ${m[1]}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
