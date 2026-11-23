import { DURATION_CAPS_MS, type MotionRole } from './tokens.generated.js'

/**
 * Clamps a duration to the range 0 to the role's cap (PRD FR-M13). A value that
 * is not a finite number returns 0, so a bad token produces no animation rather
 * than an unbounded one.
 *
 * The caps come from `tokens.generated.ts`, which the token build writes from
 * the `motion-role` group in packages/tokens/src/tokens.json. The same group
 * gives the CSS its role custom properties.
 */
export function capDuration(role: MotionRole, ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.min(ms, DURATION_CAPS_MS[role])
}
