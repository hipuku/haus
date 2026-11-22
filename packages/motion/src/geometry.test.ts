import { describe, expect, it } from 'vitest'
import {
  DISTANCE_MIN_SHARE,
  DISTANCE_REFERENCE_PX,
  durationForDistance,
  highlightMove,
  originFromTrigger,
} from './geometry.js'
import { DURATION_CAPS_MS } from './tokens.generated.js'

describe('durationForDistance', () => {
  it('runs at the token duration at the reference distance', () => {
    expect(durationForDistance('sheet-enter', 320, DISTANCE_REFERENCE_PX)).toBe(320)
  })

  it('grows with the square root of distance: four times as far takes twice as long', () => {
    const near = durationForDistance('layout', 200, DISTANCE_REFERENCE_PX / 2)
    const far = durationForDistance('layout', 200, DISTANCE_REFERENCE_PX * 2)
    expect(far / near).toBeCloseTo(2, 1)
    expect(durationForDistance('layout', 200, DISTANCE_REFERENCE_PX * 2)).toBe(283)
  })

  it('never passes the role cap, however far the move', () => {
    expect(durationForDistance('sheet-enter', 400, 10_000)).toBe(DURATION_CAPS_MS['sheet-enter'])
  })

  it('never drops below half the token duration, however short the move', () => {
    expect(durationForDistance('layout', 300, 1)).toBe(300 * DISTANCE_MIN_SHARE)
    expect(durationForDistance('layout', 300, 0)).toBe(150)
  })

  it('treats an upward move like a downward one', () => {
    expect(durationForDistance('sheet-exit', 240, -800)).toBe(durationForDistance('sheet-exit', 240, 800))
  })

  it('treats a distance it cannot read as no distance', () => {
    expect(durationForDistance('layout', 300, Number.NaN)).toBe(150)
  })

  it('returns 0 for a token duration that is not positive', () => {
    expect(durationForDistance('layout', 0, 400)).toBe(0)
    expect(durationForDistance('layout', Number.NaN, 400)).toBe(0)
  })
})

describe('originFromTrigger', () => {
  const surface = { x: 100, y: 140, width: 200, height: 300 }

  it('puts the origin at the trigger centre, inside the surface', () => {
    const trigger = { x: 100, y: 100, width: 120, height: 36 }
    expect(originFromTrigger(trigger, surface)).toBe('60px 0px')
  })

  it('clamps to the surface edges when the trigger is outside it', () => {
    const below = { x: 900, y: 900, width: 20, height: 20 }
    expect(originFromTrigger(below, surface)).toBe('200px 300px')
    const above = { x: -500, y: -500, width: 20, height: 20 }
    expect(originFromTrigger(above, surface)).toBe('0px 0px')
  })

  it('keeps fractions to two decimal places', () => {
    const trigger = { x: 100.333, y: 140.111, width: 1, height: 1 }
    expect(originFromTrigger(trigger, surface)).toBe('0.83px 0.61px')
  })
})

describe('highlightMove', () => {
  const a = { x: 0, y: 0, width: 200, height: 32 }
  const b = { x: 0, y: 32, width: 200, height: 32 }

  it('slides for pointer moves and arrow keys (FR-S19)', () => {
    expect(highlightMove(a, b, 'pointer').slide).toBe(true)
    expect(highlightMove(a, b, 'arrow').slide).toBe(true)
  })

  it('jumps for Home, End, Page Up, Page Down and typeahead (FR-S19)', () => {
    for (const cause of ['home-end', 'page', 'typeahead'] as const) {
      expect(highlightMove(a, b, cause).slide).toBe(false)
    }
  })

  it('appears in place when nothing was highlighted', () => {
    expect(highlightMove(null, b, 'arrow')).toEqual({ rect: b, slide: false })
  })

  it('returns a copy of the target, so a later change to the option does not move it', () => {
    const { rect } = highlightMove(a, b, 'arrow')
    expect(rect).toEqual(b)
    expect(rect).not.toBe(b)
  })
})
