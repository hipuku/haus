import { describe, expect, it } from 'vitest'
import { capDuration } from './duration.js'
import { DURATION_CAPS_MS } from './tokens.generated.js'

describe('DURATION_CAPS_MS', () => {
  it('gives an enter and its exit the same cap', () => {
    for (const surface of ['popover', 'dialog', 'sheet'] as const) {
      expect(DURATION_CAPS_MS[`${surface}-exit`]).toBe(DURATION_CAPS_MS[`${surface}-enter`])
    }
  })
})

describe('capDuration', () => {
  it('passes a duration under the cap through unchanged', () => {
    expect(capDuration('dialog-enter', 240)).toBe(240)
  })

  it('clamps a duration over the cap to the cap', () => {
    expect(capDuration('press', 320)).toBe(DURATION_CAPS_MS.press)
    expect(capDuration('sheet-enter', 900)).toBe(DURATION_CAPS_MS['sheet-enter'])
  })

  it('returns 0 for zero, negative and non-finite input', () => {
    expect(capDuration('layout', 0)).toBe(0)
    expect(capDuration('layout', -50)).toBe(0)
    expect(capDuration('layout', Number.NaN)).toBe(0)
    expect(capDuration('layout', Number.POSITIVE_INFINITY)).toBe(0)
  })
})
