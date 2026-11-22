import { describe, expect, it } from 'vitest'
import {
  SPRING_LINEAR_POINTS,
  SPRING_POINTS_PER_CYCLE,
  SPRING_REST_DELTA,
  springPosition,
  springSettleTime,
  springToLinear,
} from './spring.js'

const snappy = { visualDuration: 0.2, bounce: 0 }
const bouncy = { visualDuration: 0.22, bounce: 0.15 }

/** Samples a curve finely, so overshoot between linear() points is not missed. */
function sample(options: { visualDuration: number; bounce: number }, until: number): number[] {
  const out: number[] = []
  for (let t = 0; t <= until; t += 0.0005) out.push(springPosition(options, t))
  return out
}

describe('springPosition', () => {
  it('starts at rest at 0', () => {
    expect(springPosition(snappy, 0)).toBe(0)
    expect(springPosition(bouncy, 0)).toBeCloseTo(0, 12)
  })

  it('is within 4% of the target at its visual duration when bounce is 0', () => {
    // The counterintuitive part of Motion's definition: visualDuration is when
    // the motion looks done, not when it is. The tail runs on past it.
    const atVisual = springPosition(snappy, snappy.visualDuration)
    expect(atVisual).toBeGreaterThan(0.96)
    expect(atVisual).toBeLessThan(1)
  })

  it('never passes the target when bounce is 0', () => {
    expect(Math.max(...sample(snappy, 1))).toBeLessThanOrEqual(1)
  })

  it('overshoots the target when bounce is above 0', () => {
    expect(Math.max(...sample(bouncy, 1))).toBeGreaterThan(1)
  })

  it('overshoots further as bounce rises', () => {
    const peak = (bounce: number) => Math.max(...sample({ visualDuration: 0.3, bounce }, 2))
    expect(peak(0.1)).toBeLessThan(peak(0.2))
  })

  it('treats a negative bounce as 0, so the spring is never overdamped', () => {
    const plain = { visualDuration: 0.3, bounce: 0 }
    const negative = { visualDuration: 0.3, bounce: -0.5 }
    for (const t of [0.05, 0.1, 0.2, 0.4]) {
      expect(springPosition(negative, t)).toBe(springPosition(plain, t))
    }
  })

  it('keeps some damping at bounce 1, so it still settles', () => {
    expect(springSettleTime({ visualDuration: 0.2, bounce: 1 })).toBeLessThan(20)
  })

  it('rejects a visual duration that is not a positive number', () => {
    for (const visualDuration of [0, -0.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => springPosition({ visualDuration, bounce: 0 }, 0.1)).toThrow(RangeError)
    }
  })

  it('rejects a bounce that is not finite', () => {
    expect(() => springPosition({ visualDuration: 0.2, bounce: Number.NaN }, 0.1)).toThrow(RangeError)
  })

  it('rejects a duration that is positive and finite but gives an unusable frequency', () => {
    /* Review finding on haus#146. Both of these pass the positive-and-finite
       check and then break the maths. 1.2 × MAX_VALUE overflows to Infinity, so
       omega is 0, the remaining-distance bound is a constant 1 and
       springSettleTime never returns: a hang, not a wrong answer. MIN_VALUE
       gives an infinite omega and NaN positions, so the loop exits at once and
       reports a 1 ms settle that means nothing. */
    for (const visualDuration of [Number.MAX_VALUE, Number.MIN_VALUE]) {
      expect(() => springPosition({ visualDuration, bounce: 0 }, 0.1)).toThrow(RangeError)
      expect(() => springSettleTime({ visualDuration, bounce: 0 })).toThrow(RangeError)
      expect(() => springToLinear({ visualDuration, bounce: 0 })).toThrow(RangeError)
    }
  })
})

describe('springSettleTime', () => {
  it('is longer than the visual duration', () => {
    expect(springSettleTime(snappy)).toBeGreaterThan(snappy.visualDuration)
    expect(springSettleTime(bouncy)).toBeGreaterThan(bouncy.visualDuration)
  })

  it('stays inside the rest band from the settle time on', () => {
    for (const options of [snappy, bouncy, { visualDuration: 0.32, bounce: 0.1 }]) {
      const settled = springSettleTime(options)
      for (let t = settled; t < settled + 2; t += 0.0005) {
        expect(Math.abs(1 - springPosition(options, t))).toBeLessThan(SPRING_REST_DELTA)
      }
    }
  })

  it('is outside the rest band just before the settle time', () => {
    for (const options of [snappy, bouncy]) {
      const settled = springSettleTime(options)
      let outsideBefore = false
      for (let t = settled - 0.01; t < settled; t += 0.0005) {
        if (Math.abs(1 - springPosition(options, t)) >= SPRING_REST_DELTA) outsideBefore = true
      }
      expect(outsideBefore).toBe(true)
    }
  })

  it('grows with the visual duration', () => {
    expect(springSettleTime({ visualDuration: 0.3, bounce: 0 })).toBeGreaterThan(springSettleTime(snappy))
  })

  it('is a whole number of milliseconds', () => {
    const ms = springSettleTime(bouncy) * 1000
    expect(Math.abs(ms - Math.round(ms))).toBeLessThan(1e-9)
  })
})

describe('springToLinear', () => {
  it('runs for the settle time', () => {
    expect(springToLinear(snappy).durationMs).toBe(Math.round(springSettleTime(snappy) * 1000))
  })

  it('starts on 0 and ends on exactly 1', () => {
    const points = springToLinear(bouncy).easing.slice('linear('.length, -1).split(', ').map(Number)
    expect(points).toHaveLength(SPRING_LINEAR_POINTS + 1)
    expect(points[0]).toBe(0)
    expect(points.at(-1)).toBe(1)
  })

  it('keeps the overshoot in the easing, as values above 1', () => {
    const points = springToLinear(bouncy).easing.slice(7, -1).split(', ').map(Number)
    expect(Math.max(...points)).toBeGreaterThan(1)
  })

  it('adds points for a spring that swings many times, so its peaks are not lost', () => {
    const wobbly = { visualDuration: 0.3, bounce: 0.95 }
    const { durationMs, easing } = springToLinear(wobbly)
    const points = easing.slice(7, -1).split(', ').map(Number)
    expect(points.length).toBeGreaterThan(SPRING_LINEAR_POINTS * 4)
    // The first overshoot, read from the exact curve, survives sampling to within 2%.
    const truePeak = Math.max(...sample(wobbly, durationMs / 1000))
    expect(Math.max(...points)).toBeGreaterThan(truePeak - 0.02)
    // Every swing gets at least SPRING_POINTS_PER_CYCLE points: count the peaks.
    const peaks = points.filter(
      (p, i) => i > 0 && i < points.length - 1 && p > (points[i - 1] ?? 0) && p >= (points[i + 1] ?? 0),
    ).length
    expect(points.length / peaks).toBeGreaterThanOrEqual(SPRING_POINTS_PER_CYCLE * 0.9)
  })

  it('writes each point with at most four decimal places', () => {
    for (const point of springToLinear(bouncy).easing.slice(7, -1).split(', ')) {
      expect(point).toMatch(/^-?\d+(\.\d{1,4})?$/)
    }
  })
})
