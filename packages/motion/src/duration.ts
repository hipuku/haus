import { DURATION_CAPS_MS, type MotionRole } from './tokens.generated.js'

/**
 * Clamps a duration to the range 0 to the role's cap (PRD FR-M13). The caps
 * are generated from tokens/source, so the engine and the CSS read the same
 * numbers. A value that is not a finite number returns 0, so a bad token
 * produces no animation rather than an unbounded one.
 */
export function capDuration(role: MotionRole, ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.min(ms, DURATION_CAPS_MS[role])
}
