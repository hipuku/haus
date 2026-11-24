import { describe, expect, it } from 'vitest'
import { DURATION_CAPS_MS, MOTION_LIMITS, MOTION_TOKENS } from './tokens.generated'

/**
 * Every role in every mode stays inside the limits the motion-role group
 * declares. The limits were raised for the expressive mode (plan 4.1), and a
 * ceiling nothing checks is a ceiling in name only.
 */
const ROLES = Object.keys(DURATION_CAPS_MS) as (keyof typeof DURATION_CAPS_MS)[]
const MODES = Object.keys(MOTION_TOKENS) as (keyof typeof MOTION_TOKENS)[]

/** Colour, opacity and feedback: effects, which never bounce in any mode (the M3 split). */
const EFFECTS = ['highlight', 'feedback'] as const

describe('motion roles stay inside their limits', () => {
  for (const mode of MODES) {
    for (const role of ROLES) {
      const token = MOTION_TOKENS[mode][role]
      it(`${mode} ${role}`, () => {
        const duration = token.visualDurationMs ?? token.durationMs
        expect(duration).toBeLessThanOrEqual(DURATION_CAPS_MS[role])
        if (token.bounce !== undefined) expect(token.bounce).toBeLessThanOrEqual(MOTION_LIMITS.bounceMax)
        if (token.offsetPx !== undefined) expect(token.offsetPx).toBeLessThanOrEqual(MOTION_LIMITS.offsetMaxPx)
        if (token.scale !== undefined) expect(token.scale).toBeGreaterThanOrEqual(MOTION_LIMITS.scaleMin)
      })
    }
  }

  it('reduced moves nothing and never runs past its ceiling', () => {
    for (const role of ROLES) {
      const token = MOTION_TOKENS.reduced[role]
      expect(token.durationMs).toBeLessThanOrEqual(MOTION_LIMITS.reducedDurationMaxMs)
      expect(token.offsetPx ?? 0).toBe(0)
      expect(token.scale ?? 1).toBe(1)
      expect(token.bounce ?? 0).toBe(0)
    }
  })

  it('effects never bounce, in any mode', () => {
    for (const mode of MODES) for (const role of EFFECTS) expect(MOTION_TOKENS[mode][role].bounce ?? 0).toBe(0)
  })

  it('expressive moves further and takes longer than subtle on every surface it enters', () => {
    for (const role of ['popover-enter', 'dialog-enter', 'sheet-enter', 'toast-enter'] as const) {
      const subtle = MOTION_TOKENS.subtle[role]
      const expressive = MOTION_TOKENS.expressive[role]
      expect(expressive.offsetPx!).toBeGreaterThan(subtle.offsetPx!)
      expect(expressive.visualDurationMs ?? expressive.durationMs).toBeGreaterThan(subtle.durationMs)
    }
  })

  /** What a reader would notice: how long it runs, how far, how much it scales, how much it settles. */
  const signature = (t: (typeof MOTION_TOKENS)['subtle'][(typeof ROLES)[number]]) =>
    JSON.stringify([t.visualDurationMs ?? t.durationMs, t.offsetPx ?? 0, t.scale ?? 1, t.bounce ?? 0])

  it('every role does something different in each of the three modes', () => {
    // Owner, 2026-11-24: "ensure that subtle, expressive and reduced are
    // different. Otherwise, what's the point?" Subtle once equalled reduced on
    // the indicator and draw roles, and was barely apart on toast-enter.
    const same: string[] = []
    for (const role of ROLES) {
      const [s, e, r] = (['subtle', 'expressive', 'reduced'] as const).map(m => signature(MOTION_TOKENS[m][role]))
      if (s === r) same.push(`${role}: subtle = reduced`)
      if (s === e) same.push(`${role}: subtle = expressive`)
    }
    expect(same).toEqual([])
  })
})
