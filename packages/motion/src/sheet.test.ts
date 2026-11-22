import { describe, expect, it } from 'vitest'
import {
  DISMISS_VELOCITY,
  VELOCITY_WINDOW_MS,
  VelocityTracker,
  dragMovesSheet,
  releaseTarget,
  rubberBand,
} from './sheet.js'

describe('VelocityTracker', () => {
  it('reports px per ms, positive downwards', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(50, 25)
    expect(tracker.velocity(50)).toBe(0.5)
  })

  it('uses only the samples inside the window, so an early drag does not count', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(10, 300) // a fast start, well before release
    tracker.add(500, 300)
    tracker.add(500 + VELOCITY_WINDOW_MS, 310)
    expect(tracker.velocity(500 + VELOCITY_WINDOW_MS)).toBeCloseTo(0.1, 5)
  })

  it('keeps two samples even after a pause, so a flick after holding still is measured', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(1000, 40)
    expect(tracker.velocity(1000)).toBeCloseTo(0.04, 5)
  })

  it('reports 0 with fewer than two samples, or two at the same moment', () => {
    const tracker = new VelocityTracker()
    expect(tracker.velocity(5)).toBe(0)
    tracker.add(5, 10)
    expect(tracker.velocity(5)).toBe(0)
    tracker.add(5, 20)
    expect(tracker.velocity(5)).toBe(0)
  })

  it('reports 0 when the finger stopped before release, so holding still never dismisses', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(16, 20)
    tracker.add(32, 40) // a fast flick down, then no move events while the finger holds still
    expect(tracker.velocity(32 + VELOCITY_WINDOW_MS)).toBeCloseTo(1.25, 5)
    expect(tracker.velocity(32 + VELOCITY_WINDOW_MS + 1)).toBe(0)
    expect(releaseTarget(40, 400, tracker.velocity(2032))).toBe('open')
  })

  it('ignores stale samples at release, so a flick that already stopped does not dismiss', () => {
    /* Review finding on haus#146. add() prunes against the time of the last
       move event, so a pointer that flicked and then held still fires no
       further events and the fast early samples survive in the buffer. The
       freshness guard does not catch it, because the newest sample is recent.
       Before the fix this reported 1 px/ms, twice the dismiss threshold, and
       the sheet closed under a finger that had been still for 51 ms. */
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(50, 100)
    tracker.add(80, 100)
    tracker.add(100, 100)
    expect(tracker.velocity(151)).toBe(0)
    expect(releaseTarget(100, 400, tracker.velocity(151))).toBe('open')
  })

  it('forgets everything on reset', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(10, 10)
    tracker.reset()
    expect(tracker.velocity(5)).toBe(0)
  })
})

describe('releaseTarget', () => {
  const height = 400

  it('closes on a downward flick at or over the threshold, even near the top', () => {
    expect(releaseTarget(10, height, DISMISS_VELOCITY)).toBe('close')
  })

  it('stays open on an upward flick, even when dragged far down', () => {
    expect(releaseTarget(380, height, -DISMISS_VELOCITY)).toBe('open')
  })

  it('decides a slow release by distance: past half the height closes', () => {
    expect(releaseTarget(199, height, 0.1)).toBe('open')
    expect(releaseTarget(200, height, 0.1)).toBe('close')
  })

  it('stays open when the sheet has no height to measure against', () => {
    expect(releaseTarget(50, 0, 0)).toBe('open')
  })
})

describe('rubberBand', () => {
  it('follows the finger closely at first and less as the pull grows', () => {
    const small = rubberBand(10, 80)
    const large = rubberBand(400, 80)
    expect(small).toBeGreaterThan(8)
    expect(small).toBeLessThan(10)
    expect(large / 400).toBeLessThan(0.2)
  })

  it('never reaches the limit', () => {
    expect(rubberBand(1_000_000, 80)).toBeLessThan(80)
  })

  it('does not move for no pull, a negative pull or no limit', () => {
    expect(rubberBand(0, 80)).toBe(0)
    expect(rubberBand(-20, 80)).toBe(0)
    expect(rubberBand(20, 0)).toBe(0)
  })
})

describe('dragMovesSheet', () => {
  it('moves the sheet for a downward drag from the top of the list', () => {
    expect(dragMovesSheet(0, 12)).toBe(true)
  })

  it('scrolls the list when it is not at the top, or the drag is upwards', () => {
    expect(dragMovesSheet(40, 12)).toBe(false)
    expect(dragMovesSheet(0, -12)).toBe(false)
  })
})
