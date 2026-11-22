/**
 * Springs are defined as { visualDuration, bounce } (PRD FR-M4), the same two
 * numbers Motion takes, and converted with the same formula Motion uses, so a
 * CSS animation on a generated linear() easing and a Motion spring with the
 * same options trace the same curve.
 *
 * The curve is a unit-mass damped spring released from rest at 0 towards 1.
 * Its position has a closed form, so it is computed exactly rather than by
 * stepping a simulation.
 */
export interface SpringOptions {
  /** Seconds until the motion looks finished; the tail after it is under 4% of the distance. */
  visualDuration: number
  /** 0 is no overshoot; higher values overshoot and settle back. */
  bounce: number
}

/** How close to the target, as a fraction of the distance, counts as settled. */
export const SPRING_REST_DELTA = 0.001

/** The fewest points sampled along the curve for a linear() easing. */
export const SPRING_LINEAR_POINTS = 40

/**
 * Points per oscillation in a linear() easing. A very bouncy spring swings many
 * times before it settles, and a fixed number of points spread over all of
 * them would miss the peaks and draw a different curve (aliasing), so the
 * count grows with the number of swings.
 */
export const SPRING_POINTS_PER_CYCLE = 16

interface SpringShape {
  /** Undamped angular frequency, radians per second. */
  omega: number
  /** Damping ratio, from 0.05 (very springy) to 1 (critically damped). */
  zeta: number
}

function shape({ visualDuration, bounce }: SpringOptions): SpringShape {
  if (!Number.isFinite(visualDuration) || visualDuration <= 0) {
    throw new RangeError(`visualDuration must be a positive number of seconds, got ${visualDuration}`)
  }
  if (!Number.isFinite(bounce)) {
    throw new RangeError(`bounce must be a finite number, got ${bounce}`)
  }
  // Motion's conversion: stiffness = (2π / (1.2 × visualDuration))², and a
  // damping ratio of 1 - bounce, kept between 0.05 and 1 so the spring always
  // settles and never becomes overdamped.
  return {
    omega: (2 * Math.PI) / (1.2 * visualDuration),
    zeta: Math.min(1, Math.max(0.05, 1 - bounce)),
  }
}

function positionAt({ omega, zeta }: SpringShape, t: number): number {
  if (zeta === 1) return 1 - Math.exp(-omega * t) * (1 + omega * t)
  const damped = omega * Math.sqrt(1 - zeta * zeta)
  const decay = Math.exp(-zeta * omega * t)
  return 1 - decay * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t))
}

/**
 * An upper bound on the distance left to travel at time t. It only falls, so
 * once it is under the rest delta the spring cannot leave the settled band again.
 */
function remainingBound({ omega, zeta }: SpringShape, t: number): number {
  if (zeta === 1) return Math.exp(-omega * t) * (1 + omega * t)
  return Math.exp(-zeta * omega * t) / Math.sqrt(1 - zeta * zeta)
}

/** Position at time t (seconds): 0 at the start, 1 at the target. */
export function springPosition(options: SpringOptions, t: number): number {
  return positionAt(shape(options), t)
}

/**
 * Seconds until the spring stays within SPRING_REST_DELTA of its target, to the
 * nearest millisecond. Always longer than visualDuration, because the curve
 * approaches the target without reaching it.
 */
export function springSettleTime(options: SpringOptions): number {
  const spring = shape(options)
  const step = 0.001
  let lastOutside = 0
  for (let t = 0; remainingBound(spring, t) >= SPRING_REST_DELTA; t += step) {
    if (Math.abs(1 - positionAt(spring, t)) >= SPRING_REST_DELTA) lastOutside = t
  }
  return Math.round((lastOutside + step) * 1000) / 1000
}

/**
 * The spring as a CSS linear() easing and the duration to run it over, so a
 * component without Motion can still move on a spring (PRD FR-M4, FR-M15).
 */
export function springToLinear(options: SpringOptions): { durationMs: number; easing: string } {
  const spring = shape(options)
  const seconds = springSettleTime(options)
  const count = linearPointCount(spring, seconds)
  const points: number[] = []
  for (let i = 0; i <= count; i++) {
    points.push(Number(positionAt(spring, (seconds * i) / count).toFixed(4)))
  }
  // The last sample is within the rest delta of 1; ending exactly on 1 means the
  // element finishes where it was going rather than a hair short.
  points[count] = 1
  return { durationMs: Math.round(seconds * 1000), easing: `linear(${points.join(', ')})` }
}

/** Intervals in the linear() easing: SPRING_POINTS_PER_CYCLE per swing, and never fewer than SPRING_LINEAR_POINTS. */
function linearPointCount({ omega, zeta }: SpringShape, seconds: number): number {
  if (zeta >= 1) return SPRING_LINEAR_POINTS
  const cycles = (seconds * omega * Math.sqrt(1 - zeta * zeta)) / (2 * Math.PI)
  return Math.max(SPRING_LINEAR_POINTS, Math.ceil(cycles * SPRING_POINTS_PER_CYCLE))
}
