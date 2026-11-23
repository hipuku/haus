// GENERATED FROM packages/tokens/src/tokens.json (the motion-role group) by
// packages/tokens/scripts/build-tokens.ts. Do not edit.
// Regenerate with `pnpm --filter haus-tokens run tokens`; `tokens:check` fails CI if stale.

/** Upper limit on duration per role, in ms. A spring role is measured by its visual duration. */
export const DURATION_CAPS_MS = {
  press: 200,
  highlight: 200,
  feedback: 200,
  layout: 450,
  'popover-enter': 300,
  'popover-exit': 300,
  'dialog-enter': 400,
  'dialog-exit': 400,
  'sheet-enter': 450,
  'sheet-exit': 450,
} as const

export type MotionRole = keyof typeof DURATION_CAPS_MS

/** The two themes, plus reduced motion, which overrides either. */
export const MOTION_MODES = ['subtle', 'expressive', 'reduced'] as const

export type MotionMode = (typeof MOTION_MODES)[number]

/** Global limits every theme stays inside. */
export const MOTION_LIMITS = {
  bounceMax: 0.2,
  offsetMaxPx: 12,
  scaleMin: 0.92,
  reducedDurationMaxMs: 120,
} as const

export interface RoleToken {
  /** How long the CSS transition runs; for a spring, until it settles. */
  durationMs: number
  /** A CSS easing: cubic-bezier(), linear() for a spring, or linear for a jump. */
  easing: string
  offsetPx?: number
  scale?: number
  visualDurationMs?: number
  bounce?: number
}

/** Every role in every mode, resolved to values. The same values as the CSS custom properties. */
export const MOTION_TOKENS: Record<MotionMode, Record<MotionRole, RoleToken>> = {
  subtle: {
    press: { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', scale: 0.98 },
    highlight: { durationMs: 353, easing: 'linear(0, 0.0229, 0.0789, 0.1534, 0.2364, 0.3211, 0.4034, 0.4806, 0.5514, 0.615, 0.6715, 0.7211, 0.7642, 0.8014, 0.8332, 0.8604, 0.8835, 0.903, 0.9194, 0.9331, 0.9447, 0.9543, 0.9623, 0.9689, 0.9744, 0.979, 0.9828, 0.9859, 0.9884, 0.9905, 0.9923, 0.9937, 0.9948, 0.9958, 0.9966, 0.9972, 0.9977, 0.9981, 0.9985, 0.9988, 1)', visualDurationMs: 200, bounce: 0 },
    feedback: { durationMs: 353, easing: 'linear(0, 0.0229, 0.0789, 0.1534, 0.2364, 0.3211, 0.4034, 0.4806, 0.5514, 0.615, 0.6715, 0.7211, 0.7642, 0.8014, 0.8332, 0.8604, 0.8835, 0.903, 0.9194, 0.9331, 0.9447, 0.9543, 0.9623, 0.9689, 0.9744, 0.979, 0.9828, 0.9859, 0.9884, 0.9905, 0.9923, 0.9937, 0.9948, 0.9958, 0.9966, 0.9972, 0.9977, 0.9981, 0.9985, 0.9988, 1)', visualDurationMs: 200, bounce: 0 },
    layout: { durationMs: 530, easing: 'linear(0, 0.023, 0.0791, 0.1536, 0.2367, 0.3215, 0.4039, 0.4811, 0.5519, 0.6156, 0.672, 0.7216, 0.7646, 0.8018, 0.8336, 0.8608, 0.8838, 0.9033, 0.9196, 0.9334, 0.9449, 0.9544, 0.9624, 0.969, 0.9745, 0.9791, 0.9828, 0.9859, 0.9885, 0.9906, 0.9923, 0.9937, 0.9949, 0.9958, 0.9966, 0.9972, 0.9977, 0.9982, 0.9985, 0.9988, 1)', visualDurationMs: 300, bounce: 0 },
    'popover-enter': { durationMs: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 4, scale: 0.96 },
    'popover-exit': { durationMs: 120, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'dialog-enter': { durationMs: 240, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 4, scale: 0.96 },
    'dialog-exit': { durationMs: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'sheet-enter': { durationMs: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 4, scale: 0.96 },
    'sheet-exit': { durationMs: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
  },
  expressive: {
    press: { durationMs: 180, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', scale: 0.96 },
    highlight: { durationMs: 335, easing: 'linear(0, 0.0212, 0.075, 0.149, 0.234, 0.3231, 0.4116, 0.4961, 0.5744, 0.6454, 0.7084, 0.7635, 0.8109, 0.8511, 0.8848, 0.9126, 0.9352, 0.9534, 0.9678, 0.979, 0.9875, 0.9939, 0.9986, 1.0018, 1.004, 1.0053, 1.006, 1.0063, 1.0062, 1.0059, 1.0055, 1.0049, 1.0044, 1.0038, 1.0033, 1.0028, 1.0023, 1.0019, 1.0016, 1.0012, 1)', visualDurationMs: 200, bounce: 0.15 },
    feedback: { durationMs: 335, easing: 'linear(0, 0.0212, 0.075, 0.149, 0.234, 0.3231, 0.4116, 0.4961, 0.5744, 0.6454, 0.7084, 0.7635, 0.8109, 0.8511, 0.8848, 0.9126, 0.9352, 0.9534, 0.9678, 0.979, 0.9875, 0.9939, 0.9986, 1.0018, 1.004, 1.0053, 1.006, 1.0063, 1.0062, 1.0059, 1.0055, 1.0049, 1.0044, 1.0038, 1.0033, 1.0028, 1.0023, 1.0019, 1.0016, 1.0012, 1)', visualDurationMs: 200, bounce: 0.15 },
    layout: { durationMs: 512, easing: 'linear(0, 0.0193, 0.0683, 0.1358, 0.2136, 0.2956, 0.3775, 0.4563, 0.5302, 0.598, 0.6591, 0.7134, 0.7611, 0.8026, 0.8382, 0.8685, 0.8941, 0.9155, 0.9332, 0.9478, 0.9598, 0.9694, 0.9771, 0.9833, 0.9881, 0.9918, 0.9947, 0.9968, 0.9984, 0.9996, 1.0004, 1.0009, 1.0013, 1.0014, 1.0015, 1.0015, 1.0015, 1.0014, 1.0012, 1.0011, 1)', visualDurationMs: 320, bounce: 0.1 },
    'popover-enter': { durationMs: 240, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 0.94 },
    'popover-exit': { durationMs: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'dialog-enter': { durationMs: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 0.94 },
    'dialog-exit': { durationMs: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'sheet-enter': { durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 0.94 },
    'sheet-exit': { durationMs: 320, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
  },
  reduced: {
    press: { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', scale: 1 },
    highlight: { durationMs: 0, easing: 'linear' },
    feedback: { durationMs: 0, easing: 'linear' },
    layout: { durationMs: 0, easing: 'linear' },
    'popover-enter': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', offsetPx: 0, scale: 1 },
    'popover-exit': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    'dialog-enter': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', offsetPx: 0, scale: 1 },
    'dialog-exit': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    'sheet-enter': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', offsetPx: 0, scale: 1 },
    'sheet-exit': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  },
}

/** Stagger on first open, per mode. */
export const STAGGER: Record<MotionMode, { stepMs: number; maxMs: number }> = {
  subtle: { stepMs: 20, maxMs: 120 },
  expressive: { stepMs: 30, maxMs: 180 },
  reduced: { stepMs: 0, maxMs: 0 },
}

/** A transition in the shape Motion takes: seconds, a cubic-bezier array, or a spring. */
export type MotionTransition =
  | { type: 'spring'; visualDuration: number; bounce: number }
  | { duration: number; ease?: [number, number, number, number] }

/** The Motion adapter: each role in each mode as a Motion transition. */
export const MOTION_TRANSITIONS: Record<MotionMode, Record<MotionRole, MotionTransition>> = {
  subtle: {
    press: { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    highlight: { type: 'spring', visualDuration: 0.2, bounce: 0 },
    feedback: { type: 'spring', visualDuration: 0.2, bounce: 0 },
    layout: { type: 'spring', visualDuration: 0.3, bounce: 0 },
    'popover-enter': { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
    'popover-exit': { duration: 0.12, ease: [0.4, 0, 1, 1] },
    'dialog-enter': { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
    'dialog-exit': { duration: 0.18, ease: [0.4, 0, 1, 1] },
    'sheet-enter': { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    'sheet-exit': { duration: 0.24, ease: [0.4, 0, 1, 1] },
  },
  expressive: {
    press: { duration: 0.18, ease: [0.65, 0, 0.35, 1] },
    highlight: { type: 'spring', visualDuration: 0.2, bounce: 0.15 },
    feedback: { type: 'spring', visualDuration: 0.2, bounce: 0.15 },
    layout: { type: 'spring', visualDuration: 0.32, bounce: 0.1 },
    'popover-enter': { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
    'popover-exit': { duration: 0.18, ease: [0.4, 0, 1, 1] },
    'dialog-enter': { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    'dialog-exit': { duration: 0.24, ease: [0.4, 0, 1, 1] },
    'sheet-enter': { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    'sheet-exit': { duration: 0.32, ease: [0.4, 0, 1, 1] },
  },
  reduced: {
    press: { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    highlight: { duration: 0 },
    feedback: { duration: 0 },
    layout: { duration: 0 },
    'popover-enter': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'popover-exit': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'dialog-enter': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'dialog-exit': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'sheet-enter': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'sheet-exit': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
  },
}
