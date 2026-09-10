/**
 * Two invariants a rendered test cannot see, because both are a colour that a
 * DOM assertion never reads and a pseudo-element a computed-style check has to
 * ask for by name. Both were found by drawing the components in another medium
 * rather than by any check the code ran on itself: haus#41 and haus#42.
 *
 * These read the source stylesheets, so they hold whether or not dist is built.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENTS = join(process.cwd(), 'src', 'components')

/** Each component's module CSS as one string, keyed by component name. */
function stylesheets() {
  const out: Record<string, string> = {}
  for (const dir of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const f of readdirSync(join(COMPONENTS, dir.name))) {
      if (f.endsWith('.module.css')) out[dir.name] = readFileSync(join(COMPONENTS, dir.name, f), 'utf8')
    }
  }
  return out
}

const CSS = stylesheets()

describe('placeholder colour (haus#42)', () => {
  it('every ::placeholder rule reads the placeholder role, never a darker ink', () => {
    // ink-tertiary is the step primitives.css labels "Placeholder text". The
    // point of the colour is that an empty field reads as empty, so a
    // placeholder painted at ink-secondary, as dark as a real value, is the one
    // thing it must not be. Input read the right one and Textarea did not.
    const offenders: string[] = []
    for (const [name, css] of Object.entries(CSS)) {
      for (const m of css.matchAll(/::placeholder\s*\{([^}]*)\}/g)) {
        const colour = /color:\s*var\((--haus-color-[\w-]+)\)/.exec(m[1])?.[1]
        if (colour && colour !== '--haus-color-ink-tertiary') offenders.push(`${name}: ${colour}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('adornments dim with the field (haus#41)', () => {
  // A disabled control dims its container, border and value. Anything else it
  // paints has to be asked whether it participates, and an adornment that keeps
  // full strength becomes the brightest thing in a control meant to look
  // unavailable. Two components carry a coloured decoration beside the value;
  // the set is named so a third has to be added here deliberately rather than
  // slipping in undimmed, the same shape as error-focus-ring.test.ts.
  const ADORNED: Record<string, RegExp> = {
    // Input's prefix and suffix, dimmed through the existing .inputWrap.disabled hook.
    Input: /\.inputWrap\.disabled\s+\.adornment\s*\{[^}]*color:\s*var\(--haus-color-ink-disabled\)/,
    // The themed Select dims its whole trigger, chevron included, through
    // .trigger:disabled opacity rather than a per-adornment colour rule, so it
    // is not one of the adornments this test guards.
  }

  for (const [name, rule] of Object.entries(ADORNED)) {
    it(`${name} dims its adornment under disabled`, () => {
      expect(CSS[name], `${name}.module.css`).toMatch(rule)
    })
  }
})
