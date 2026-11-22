/**
 * The physics of a draggable sheet (PRD FR-S14, FR-S24): how fast the finger
 * was moving when it let go, whether that dismisses the sheet, how the sheet
 * resists being pulled past its open position, and when a drag belongs to the
 * sheet rather than the list scrolling inside it. Plain functions, so they run
 * the same under any renderer and test without a browser.
 */

/** Only samples this recent count towards release velocity. A starting value. */
export const VELOCITY_WINDOW_MS = 100

/** A release faster than this, downwards, dismisses the sheet. px per ms; a starting value. */
export const DISMISS_VELOCITY = 0.5

/** A release dragged further than this share of the sheet's height dismisses it. A starting value. */
export const DISMISS_DISTANCE_SHARE = 0.5

interface Sample {
  t: number
  y: number
}

/**
 * Collects pointer positions during a drag and reports the velocity at
 * release, in px per ms, positive downwards. Velocity is the slope across the
 * samples in the last VELOCITY_WINDOW_MS, so one noisy event at the end does
 * not decide the result.
 */
export class VelocityTracker {
  private samples: Sample[] = []

  add(timeMs: number, y: number): void {
    this.samples.push({ t: timeMs, y })
    const cutoff = timeMs - VELOCITY_WINDOW_MS
    while (this.samples.length > 2 && (this.samples[0] as Sample).t < cutoff) this.samples.shift()
  }

  /**
   * px per ms over the window, at `nowMs` (the release time, on the same clock
   * as add()). A pointer that holds still fires no move events, so the last
   * samples can be from a flick that already ended: when the newest sample is
   * older than VELOCITY_WINDOW_MS, the finger has stopped and velocity is 0.
   * Also 0 with fewer than two samples or no time between them.
   */
  velocity(nowMs: number): number {
    /* The window is reapplied here, against the release time, and not only in
       add(). add() prunes against the time of the last move event, so a pointer
       that moved fast and then held still fires no further events and leaves
       its earlier, faster samples in the buffer. The slope across the whole
       buffer then reports a flick that had already finished: samples at
       (0,0), (50,100), (80,100), (100,100) released at 151 ms gave 1 px/ms,
       twice the dismiss threshold, when the two samples inside the window both
       sat at 100 and the real velocity was 0. The sheet dismissed itself under
       a still finger.

       The freshness guard below does not catch it, because it only asks
       whether the newest sample is recent, not whether the oldest one is.

       When fewer than two samples fall inside the window the whole buffer is
       used instead, which is the fallback that measures a flick after a pause:
       there is no recent pair to take a slope from, and the only estimate
       available is the one spanning the gap. */
    const cutoff = nowMs - VELOCITY_WINDOW_MS
    const recent = this.samples.filter(sample => sample.t >= cutoff)
    const window = recent.length >= 2 ? recent : this.samples
    const first = window[0]
    const last = window[window.length - 1]
    if (!first || !last || last.t <= first.t) return 0
    if (nowMs - last.t > VELOCITY_WINDOW_MS) return 0
    return (last.y - first.y) / (last.t - first.t)
  }

  reset(): void {
    this.samples = []
  }
}

/**
 * Where the sheet goes when the finger lifts: closed if it was flicked down
 * fast enough or dragged past half its height, otherwise back open. A fast
 * flick upwards keeps it open even if it was dragged far, because the last
 * thing the person did was push it back.
 */
export function releaseTarget(offsetPx: number, heightPx: number, velocity: number): 'close' | 'open' {
  if (velocity <= -DISMISS_VELOCITY) return 'open'
  if (velocity >= DISMISS_VELOCITY) return 'close'
  return heightPx > 0 && offsetPx >= heightPx * DISMISS_DISTANCE_SHARE ? 'close' : 'open'
}

/**
 * How far the sheet moves for a drag past its open position. The further the
 * pull, the less the sheet follows, approaching `limitPx` and never passing
 * it, so the sheet gives under the finger without detaching from its edge.
 */
export function rubberBand(overshootPx: number, limitPx: number): number {
  if (overshootPx <= 0 || limitPx <= 0) return 0
  return limitPx * (1 - 1 / (overshootPx / limitPx + 1))
}

/**
 * Whether a vertical drag moves the sheet or scrolls the list inside it
 * (scroll handoff, FR-S14). A downward drag from the top of the list moves the
 * sheet; any other drag scrolls, so a list in the middle of its content is
 * never dismissed by accident.
 */
export function dragMovesSheet(listScrollTop: number, deltaY: number): boolean {
  return listScrollTop <= 0 && deltaY > 0
}
