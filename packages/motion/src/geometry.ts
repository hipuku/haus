import { DURATION_CAPS_MS, type MotionRole } from './tokens.generated.js'

/** A box in CSS pixels, as getBoundingClientRect() gives one. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * The transform-origin that makes a surface grow out of the element that
 * opened it (quality bar: movement starts from where the element comes from).
 * The origin is the centre of the trigger, as a point inside the surface,
 * clamped to the surface's edges so a far-off trigger still gives a sensible
 * corner. Returned as a CSS value in px from the surface's top left.
 */
export function originFromTrigger(trigger: Rect, surface: Rect): string {
  const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))
  const x = clamp(trigger.x + trigger.width / 2 - surface.x, surface.width)
  const y = clamp(trigger.y + trigger.height / 2 - surface.y, surface.height)
  return `${round(x)}px ${round(y)}px`
}

const round = (value: number) => Math.round(value * 100) / 100

/**
 * The distance at which a distance-scaled role runs at its token duration.
 * A starting value, tuned with the Sheet and Tabs builds.
 */
export const DISTANCE_REFERENCE_PX = 400

/** The shortest a distance-scaled move runs, as a share of its token duration. */
export const DISTANCE_MIN_SHARE = 0.5

/**
 * Sheet and layout durations grow with the distance travelled and never pass
 * the role's cap (PRD FR-M13). Duration follows the square root of distance,
 * so a move twice as far takes about 1.4 times as long: long moves stay quick
 * and short ones do not look sluggish. Short moves never drop below half the
 * token duration.
 */
export function durationForDistance(
  role: Extract<MotionRole, 'sheet-enter' | 'sheet-exit' | 'layout'>,
  tokenMs: number,
  distancePx: number,
): number {
  if (!Number.isFinite(tokenMs) || tokenMs <= 0) return 0
  const distance = Number.isFinite(distancePx) ? Math.abs(distancePx) : 0
  const scaled = tokenMs * Math.sqrt(distance / DISTANCE_REFERENCE_PX)
  const floored = Math.max(tokenMs * DISTANCE_MIN_SHARE, scaled)
  return Math.round(Math.min(DURATION_CAPS_MS[role], floored))
}

/** What moved the highlight to a new option (PRD FR-S19). */
export type HighlightCause = 'pointer' | 'arrow' | 'home-end' | 'page' | 'typeahead'

/**
 * Where the single highlight element goes, and whether it slides there. It
 * slides for pointer moves and arrow keys, where the eye follows it; it jumps
 * for Home, End, Page Up, Page Down and typeahead, where the distance is large
 * and a slide would only delay the answer. With nothing highlighted before,
 * it appears in place.
 */
export function highlightMove(from: Rect | null, to: Rect, cause: HighlightCause): { rect: Rect; slide: boolean } {
  const slide = from !== null && (cause === 'pointer' || cause === 'arrow')
  return { rect: { ...to }, slide }
}
