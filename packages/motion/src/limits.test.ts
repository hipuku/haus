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
})
