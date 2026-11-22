import { DURATION_CAPS_MS, type MotionRole } from './tokens.generated.js'

/**
 * Clamps a duration to the range 0 to the role's cap (PRD FR-M13). A value that
 * is not a finite number returns 0, so a bad token produces no animation rather
 * than an unbounded one.
 *
 * The caps come from `tokens.generated.ts`, which nothing in this repository
 * generates: it was carried over with the engine and its generator was not. So
 * the caps are the engine's own numbers and must not be assumed to match the
 * CSS until the token source carries roles and caps and the token build emits
 * this file. See the package README.
 */
export function capDuration(role: MotionRole, ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.min(ms, DURATION_CAPS_MS[role])
}
