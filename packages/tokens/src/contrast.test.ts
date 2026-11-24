/**
 * Every contrast claim in this package, measured.
 *
 * The component suite runs with `css: false`, so axe there sees unstyled DOM and
 * `color-contrast` can never fire, which is why two comments in semantics.css
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
import { wcagContrast } from '@hipuku/colour'

const SRC = join(process.cwd(), 'src')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')

/** Every `--x: value;` in a file. */
function declarations(css: string): Map<string, string> {
  return new Map([...css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]))
}

const LIGHT = new Map([
  ...declarations(read('primitives.css')),
  ...declarations(read('brand.css')),
  ...declarations(read('semantics.css')),
])

/**
 * The dark map is the light one with brand-dark.css laid over the brand roles.
 * That file holds its declarations twice, once per selector, and brand.test.ts
 * holds the two equal, so reading both into one map is reading one.
 */
const DARK = new Map([...LIGHT, ...declarations(read('brand-dark.css'))])

const MODES: Array<[mode: string, map: Map<string, string>]> = [
  ['light', LIGHT],
  ['dark', DARK],
]

/** Follow `var(--a)` chains down to a literal colour. */
function resolveIn(map: Map<string, string>, name: string, seen = new Set<string>()): string | null {
  if (seen.has(name)) return null
  seen.add(name)
  const value = map.get(name)
  if (!value) return null
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value)
  if (ref) return resolveIn(map, ref[1], seen)
  // Relative colour syntax resolves to a real colour but not to one this can
  // parse without a browser, so those pairs are out of scope here.
  return value
}

/**
 * A relative-colour value resolves to a real colour and not to one this can
 * parse without a browser, so a pair holding one is out of scope. Told apart
 * from `null`, which now means the chain ran out or looped: both used to come
 * back as null and the pairs below returned early on either, so a token nobody
 * declares would have passed the test by not being measured.
 */
const unmeasurable = (value: string) => value.startsWith('oklch(from')

/**
 * The threshold read off the exact contrast, not off `ratio`.
 *
 * `wcagContrast` rounds `ratio` to two decimals and carries the verdicts
 * separately, computed from the exact value, so a pair measuring 4.499
 * rounded to 4.5 and cleared a 4.5 bar it does not meet. 3 is WCAG's large
 * text bar and the same number SC 1.4.11 asks of a non-text indicator, which
 * is what `passAALarge` holds.
 */
function passes(fg: string, bg: string, min: number) {
  const result = wcagContrast(fg, bg)
  const ok = min === 4.5 ? result.passAA : result.passAALarge
  if (min !== 4.5 && min !== 3) throw new Error(`No exact flag for a ${min}:1 threshold.`)
  return ok || `${result.ratio.toFixed(2)}:1, under ${min}:1`
}

/** The `on-*` ink for each surface, as semantics.css pairs them. */
const PAIRS: Array<[surface: string, ink: string, min: number]> = [
  ['--haus-color-primary-default', '--haus-color-ink-on-primary', 4.5],
  ['--haus-color-primary-subtle', '--haus-color-primary-on-subtle', 4.5],
  ['--haus-color-info-subtle', '--haus-color-info-on-subtle', 4.5],
  ['--haus-color-info-default', '--haus-color-info-on-default', 4.5],
  ['--haus-color-success-subtle', '--haus-color-success-on-subtle', 4.5],
  ['--haus-color-success-default', '--haus-color-success-on-default', 4.5],
  ['--haus-color-warning-subtle', '--haus-color-warning-on-subtle', 4.5],
  ['--haus-color-warning-default', '--haus-color-warning-on-default', 4.5],
  ['--haus-color-error-subtle', '--haus-color-error-on-subtle', 4.5],
  ['--haus-color-error-default', '--haus-color-error-on-default', 4.5],

  // The solid roles. success and warning exist at 700 precisely because their
  // 500s fail with white ink, and the comments in semantics.css recording that
  // were the only thing asserting it. Badge's solid appearance has spent both
  // since it was written, and Button's tone palette now does too.
  // In dark they sit at 400 under dark ink instead.
  ['--haus-color-success-solid', '--haus-color-ink-inverse', 4.5],
  ['--haus-color-warning-solid', '--haus-color-ink-inverse', 4.5],

  // Hover. Every tone moves to `emphasis` (900 in light, 200 in dark) under the
  // same ink, so these should only ever gain contrast, which is worth asserting
  // rather than assuming, because it is the ramp that guarantees it and a
  // rebrand may rewrite the ramp.
  ['--haus-color-info-emphasis', '--haus-color-info-on-default', 4.5],
  ['--haus-color-success-emphasis', '--haus-color-ink-inverse', 4.5],
  ['--haus-color-warning-emphasis', '--haus-color-ink-inverse', 4.5],
  ['--haus-color-error-emphasis', '--haus-color-error-on-default', 4.5],

  // `on-subtle` sitting on the page rather than on its own tint. Button's
  // ghost and text weights are transparent, so a toned one puts this ink
  // straight onto surface-default; nothing else in the system did that before.
  ['--haus-color-surface-default', '--haus-color-info-on-subtle', 4.5],
  ['--haus-color-surface-default', '--haus-color-success-on-subtle', 4.5],
  ['--haus-color-surface-default', '--haus-color-warning-on-subtle', 4.5],
  ['--haus-color-surface-default', '--haus-color-error-on-subtle', 4.5],

  // Toast's tinted appearance puts `ink-primary` on each tone's subtle fill
  // rather than that tone's `on-subtle`, because on a notice the body copy is
  // copy and the tone is carried by the icon and the accent edge. It is a
  // deliberate pairing the `on-*` rows above do not cover.
  ['--haus-color-info-subtle', '--haus-color-ink-primary', 4.5],
  ['--haus-color-success-subtle', '--haus-color-ink-primary', 4.5],
  ['--haus-color-warning-subtle', '--haus-color-ink-primary', 4.5],
  ['--haus-color-error-subtle', '--haus-color-ink-primary', 4.5],

  // The inverse surface, which Toast's solid neutral and Badge's solid neutral
  // both paint and nothing asserted.
  ['--haus-color-surface-inverse', '--haus-color-ink-inverse', 4.5],

  // WCAG 1.4.11, at 3:1 rather than 4.5:1, because a control's edge is a
  // graphic and not text. Input, Textarea, Select, Checkbox, Radio and the
  // Toggle track draw their whole boundary with this one role, on both the
  // default surface and the subtle one, since a form sits on either. Decision
  // 0031. Before it they drew `border-default` at 1.23:1 and `border-strong` at
  // 1.53:1, and nothing here measured a border at all.
  ['--haus-color-surface-default', '--haus-color-border-control', 3],
  ['--haus-color-surface-subtle', '--haus-color-border-control', 3],

  // A placeholder is text, so it is 4.5:1 and not 3:1. It read `ink-tertiary`,
  // which is 3.97:1 in light: the role is sound for the glyphs and the hover
  // fill it also carries, and was never safe for the words in an empty field.
  ['--haus-color-surface-default', '--haus-color-ink-placeholder', 4.5],

  // `ink-tertiary` keeps its own row at the bar it actually meets, so the
  // number is asserted rather than assumed the next time someone reaches for
  // it. It is for glyphs: EmptyState's mark, Select's chevron, Modal's close.
  ['--haus-color-surface-default', '--haus-color-ink-tertiary', 3],
]

describe.each(MODES)('contrast, %s', (mode, map) => {
  const resolve = (name: string) => resolveIn(map, name)

  it('reads the files it is meant to read', () => {
    // A broken resolver would make every assertion below vacuously pass.
    expect(map.size).toBeGreaterThan(250)
    expect(resolve('--haus-color-surface-default')).toMatch(/^oklch\(/)
    expect(resolve('--haus-color-ink-primary')).toMatch(/^oklch\(/)
    if (mode === 'dark') {
      // The dark map has to change what a role resolves to, or this half of the
      // suite is the light suite run twice.
      expect(resolve('--haus-color-surface-default')).not.toBe(resolveIn(LIGHT, '--haus-color-surface-default'))
    }
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
    const { ratio } = wcagContrast(resolve('--haus-color-ink-secondary')!, resolve('--haus-color-surface-default')!)
    expect(ratio, `ink-secondary is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(PAIRS)('%s pairs with an ink that clears AA', (surface, ink, min) => {
    const bg = resolve(surface)
    const fg = resolve(ink)
    expect(bg, `${surface} resolves to nothing`).not.toBeNull()
    expect(fg, `${ink} resolves to nothing`).not.toBeNull()
    if (unmeasurable(bg!) || unmeasurable(fg!)) return // relative colour, out of scope
    expect(passes(fg!, bg!, min)).toBe(true)
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

/**
 * The shipped brands, measured rather than commented.
 *
 * Both preset files state contrast figures for their control edge, and nothing
 * read them: the maps above are the default brand only, so an edit to either
 * preset could drop a control below 3:1 and this file would still pass while
 * claiming at the top that every contrast claim in the package is measured.
 *
 * Light only, which is what the presets are: `brand-dark.css` skips a root
 * naming a brand, so vault and core stay light whatever the system says, and
 * decision 0028 records that.
 */
const PRESETS = ['vault', 'core'] as const

const PRESET_PAIRS: Array<[surface: string, ink: string, min: number, why: string]> = [
  ['--haus-color-surface-default', '--haus-color-border-control', 3, 'a control edge, WCAG 1.4.11'],
  ['--haus-color-surface-subtle', '--haus-color-border-control', 3, 'a control edge on the subtle surface'],
  ['--haus-color-surface-default', '--haus-color-ink-placeholder', 4.5, 'placeholder text'],
  ['--haus-color-surface-default', '--haus-color-ink-primary', 4.5, 'body text'],
  ['--haus-color-surface-default', '--haus-color-border-focus', 3, 'the focus ring, WCAG 1.4.11'],
]

describe.each(PRESETS)('contrast, the %s brand', preset => {
  const map = new Map([...LIGHT, ...declarations(read(join('brands', `${preset}.css`)))])
  const resolve = (name: string) => resolveIn(map, name)

  it('reads the preset it is meant to read', () => {
    // Without this the pairs below would measure haus's own values twice and
    // pass for the wrong reason, which is the failure mode the file opens with.
    expect(map.get('--haus-brand-border-control'), `${preset} declares no border-control`).toBeDefined()
    // The focus ring rather than the control edge: both presets take their own
    // accent there, ruby and cobalt, while vault's control edge is legitimately
    // the same damson step as haus's, so that one would prove nothing.
    expect(resolve('--haus-color-border-focus')).not.toBe(resolveIn(LIGHT, '--haus-color-border-focus'))
  })

  it.each(PRESET_PAIRS)('%s and %s clear the bar', (surface, ink, min, why) => {
    const bg = resolve(surface)
    const fg = resolve(ink)
    expect(bg, `${preset}: ${surface} resolves to nothing`).not.toBeNull()
    expect(fg, `${preset}: ${ink} resolves to nothing`).not.toBeNull()
    if (unmeasurable(bg!) || unmeasurable(fg!)) return // relative colour, out of scope
    expect(passes(fg!, bg!, min), `${preset}: ${ink} on ${surface}, ${why}`).toBe(true)
  })
})
