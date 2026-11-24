// GENERATED FROM packages/tokens/src/tokens.json (the motion-role group) by
// packages/tokens/scripts/build-tokens.ts. Do not edit.
// Regenerate with `pnpm --filter @hipuku/tokens run tokens`; `tokens:check` fails CI if stale.

/** Upper limit on duration per role, in ms. A spring role is measured by its visual duration. */
export const DURATION_CAPS_MS = {
  press: 200,
  highlight: 300,
  feedback: 300,
  layout: 450,
  'popover-enter': 300,
  'popover-exit': 300,
  'dialog-enter': 450,
  'dialog-exit': 450,
  'sheet-enter': 500,
  'sheet-exit': 500,
  'toast-enter': 450,
  'toast-exit': 450,
  indicator: 400,
  draw: 500,
} as const

export type MotionRole = keyof typeof DURATION_CAPS_MS

/** The two themes, plus reduced motion, which overrides either. */
export const MOTION_MODES = ['subtle', 'expressive', 'reduced'] as const

export type MotionMode = (typeof MOTION_MODES)[number]

/** Global limits every theme stays inside. */
export const MOTION_LIMITS = {
  bounceMax: 0.3,
  offsetMaxPx: 24,
  scaleMin: 0.88,
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
    highlight: { durationMs: 265, easing: 'linear(0, 0.023, 0.0791, 0.1536, 0.2367, 0.3215, 0.4039, 0.4811, 0.5519, 0.6156, 0.672, 0.7216, 0.7646, 0.8018, 0.8336, 0.8608, 0.8838, 0.9033, 0.9196, 0.9334, 0.9449, 0.9544, 0.9624, 0.969, 0.9745, 0.9791, 0.9828, 0.9859, 0.9885, 0.9906, 0.9923, 0.9937, 0.9949, 0.9958, 0.9966, 0.9972, 0.9977, 0.9982, 0.9985, 0.9988, 1)', visualDurationMs: 150, bounce: 0 },
    feedback: { durationMs: 353, easing: 'linear(0, 0.0229, 0.0789, 0.1534, 0.2364, 0.3211, 0.4034, 0.4806, 0.5514, 0.615, 0.6715, 0.7211, 0.7642, 0.8014, 0.8332, 0.8604, 0.8835, 0.903, 0.9194, 0.9331, 0.9447, 0.9543, 0.9623, 0.9689, 0.9744, 0.979, 0.9828, 0.9859, 0.9884, 0.9905, 0.9923, 0.9937, 0.9948, 0.9958, 0.9966, 0.9972, 0.9977, 0.9981, 0.9985, 0.9988, 1)', visualDurationMs: 200, bounce: 0 },
    layout: { durationMs: 441, easing: 'linear(0, 0.0229, 0.0789, 0.1533, 0.2362, 0.3209, 0.4031, 0.4803, 0.5511, 0.6147, 0.6712, 0.7208, 0.7639, 0.8011, 0.833, 0.8602, 0.8833, 0.9028, 0.9192, 0.933, 0.9445, 0.9542, 0.9622, 0.9688, 0.9744, 0.9789, 0.9827, 0.9858, 0.9884, 0.9905, 0.9922, 0.9936, 0.9948, 0.9958, 0.9966, 0.9972, 0.9977, 0.9981, 0.9985, 0.9988, 1)', visualDurationMs: 250, bounce: 0 },
    'popover-enter': { durationMs: 160, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 6, scale: 0.97 },
    'popover-exit': { durationMs: 100, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'dialog-enter': { durationMs: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 0.97 },
    'dialog-exit': { durationMs: 140, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'sheet-enter': { durationMs: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 0.97 },
    'sheet-exit': { durationMs: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'toast-enter': { durationMs: 240, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', offsetPx: 8, scale: 1 },
    'toast-exit': { durationMs: 140, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    indicator: { durationMs: 353, easing: 'linear(0, 0.0229, 0.0789, 0.1534, 0.2364, 0.3211, 0.4034, 0.4806, 0.5514, 0.615, 0.6715, 0.7211, 0.7642, 0.8014, 0.8332, 0.8604, 0.8835, 0.903, 0.9194, 0.9331, 0.9447, 0.9543, 0.9623, 0.9689, 0.9744, 0.979, 0.9828, 0.9859, 0.9884, 0.9905, 0.9923, 0.9937, 0.9948, 0.9958, 0.9966, 0.9972, 0.9977, 0.9981, 0.9985, 0.9988, 1)', visualDurationMs: 200, bounce: 0 },
    draw: { durationMs: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  expressive: {
    press: { durationMs: 160, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', scale: 0.95 },
    highlight: { durationMs: 424, easing: 'linear(0, 0.023, 0.0791, 0.1536, 0.2367, 0.3215, 0.4039, 0.4811, 0.5519, 0.6156, 0.672, 0.7216, 0.7646, 0.8018, 0.8336, 0.8608, 0.8838, 0.9033, 0.9196, 0.9334, 0.9449, 0.9544, 0.9624, 0.969, 0.9745, 0.9791, 0.9828, 0.9859, 0.9885, 0.9906, 0.9923, 0.9937, 0.9949, 0.9958, 0.9966, 0.9972, 0.9977, 0.9982, 0.9985, 0.9988, 1)', visualDurationMs: 240, bounce: 0 },
    feedback: { durationMs: 530, easing: 'linear(0, 0.023, 0.0791, 0.1536, 0.2367, 0.3215, 0.4039, 0.4811, 0.5519, 0.6156, 0.672, 0.7216, 0.7646, 0.8018, 0.8336, 0.8608, 0.8838, 0.9033, 0.9196, 0.9334, 0.9449, 0.9544, 0.9624, 0.969, 0.9745, 0.9791, 0.9828, 0.9859, 0.9885, 0.9906, 0.9923, 0.9937, 0.9949, 0.9958, 0.9966, 0.9972, 0.9977, 0.9982, 0.9985, 0.9988, 1)', visualDurationMs: 300, bounce: 0 },
    layout: { durationMs: 581, easing: 'linear(0, 0.0181, 0.0654, 0.1326, 0.2123, 0.2986, 0.3866, 0.473, 0.5551, 0.6313, 0.7004, 0.762, 0.8158, 0.862, 0.9009, 0.9332, 0.9594, 0.9802, 0.9963, 1.0084, 1.017, 1.0228, 1.0264, 1.028, 1.0283, 1.0276, 1.0261, 1.024, 1.0217, 1.0192, 1.0167, 1.0143, 1.012, 1.0099, 1.008, 1.0063, 1.0049, 1.0036, 1.0025, 1.0017, 1)', visualDurationMs: 380, bounce: 0.25 },
    'popover-enter': { durationMs: 421, easing: 'linear(0, 0.0201, 0.0715, 0.1435, 0.2272, 0.3162, 0.4055, 0.4918, 0.5725, 0.6462, 0.7122, 0.7701, 0.8201, 0.8625, 0.8979, 0.9271, 0.9506, 0.9692, 0.9837, 0.9946, 1.0025, 1.0081, 1.0118, 1.014, 1.015, 1.0151, 1.0147, 1.0138, 1.0126, 1.0113, 1.01, 1.0086, 1.0073, 1.0061, 1.0051, 1.0041, 1.0032, 1.0025, 1.0019, 1.0014, 1)', offsetPx: 16, scale: 0.9, visualDurationMs: 260, bounce: 0.2 },
    'popover-exit': { durationMs: 160, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'dialog-enter': { durationMs: 615, easing: 'linear(0, 0.02, 0.0715, 0.1433, 0.227, 0.316, 0.4053, 0.4915, 0.5722, 0.6459, 0.7119, 0.7698, 0.8198, 0.8622, 0.8977, 0.9269, 0.9504, 0.9691, 0.9835, 0.9945, 1.0025, 1.0081, 1.0118, 1.014, 1.015, 1.0151, 1.0147, 1.0138, 1.0126, 1.0113, 1.01, 1.0086, 1.0074, 1.0062, 1.0051, 1.0041, 1.0033, 1.0025, 1.0019, 1.0014, 1)', offsetPx: 24, scale: 0.9, visualDurationMs: 380, bounce: 0.2 },
    'dialog-exit': { durationMs: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'sheet-enter': { durationMs: 753, easing: 'linear(0, 0.0212, 0.0748, 0.1487, 0.2336, 0.3227, 0.4111, 0.4955, 0.5738, 0.6447, 0.7078, 0.7629, 0.8104, 0.8506, 0.8843, 0.9122, 0.9349, 0.9531, 0.9675, 0.9788, 0.9874, 0.9938, 0.9985, 1.0018, 1.0039, 1.0053, 1.006, 1.0063, 1.0062, 1.0059, 1.0055, 1.0049, 1.0044, 1.0038, 1.0033, 1.0028, 1.0023, 1.0019, 1.0016, 1.0013, 1)', offsetPx: 24, scale: 0.9, visualDurationMs: 450, bounce: 0.15 },
    'sheet-exit': { durationMs: 300, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'toast-enter': { durationMs: 612, easing: 'linear(0, 0.0181, 0.0655, 0.1328, 0.2126, 0.2989, 0.387, 0.4734, 0.5555, 0.6317, 0.7009, 0.7624, 0.8162, 0.8623, 0.9013, 0.9335, 0.9597, 0.9805, 0.9965, 1.0085, 1.0171, 1.0229, 1.0264, 1.0281, 1.0283, 1.0276, 1.026, 1.024, 1.0217, 1.0192, 1.0167, 1.0143, 1.012, 1.0099, 1.008, 1.0063, 1.0048, 1.0036, 1.0025, 1.0017, 1)', offsetPx: 16, scale: 0.92, visualDurationMs: 400, bounce: 0.25 },
    'toast-exit': { durationMs: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    indicator: { durationMs: 486, easing: 'linear(0, 0.0201, 0.0716, 0.1436, 0.2274, 0.3164, 0.4058, 0.492, 0.5728, 0.6465, 0.7125, 0.7704, 0.8203, 0.8627, 0.8982, 0.9273, 0.9508, 0.9694, 0.9838, 0.9947, 1.0026, 1.0082, 1.0118, 1.014, 1.015, 1.0151, 1.0147, 1.0138, 1.0126, 1.0113, 1.0099, 1.0086, 1.0073, 1.0061, 1.005, 1.0041, 1.0032, 1.0025, 1.0019, 1.0014, 1)', visualDurationMs: 300, bounce: 0.2 },
    draw: { durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
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
    'toast-enter': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', offsetPx: 0, scale: 1 },
    'toast-exit': { durationMs: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    indicator: { durationMs: 0, easing: 'linear' },
    draw: { durationMs: 0, easing: 'linear' },
  },
}

/** Stagger on first open, per mode. */
export const STAGGER: Record<MotionMode, { stepMs: number; maxMs: number }> = {
  subtle: { stepMs: 0, maxMs: 0 },
  expressive: { stepMs: 40, maxMs: 200 },
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
    highlight: { type: 'spring', visualDuration: 0.15, bounce: 0 },
    feedback: { type: 'spring', visualDuration: 0.2, bounce: 0 },
    layout: { type: 'spring', visualDuration: 0.25, bounce: 0 },
    'popover-enter': { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
    'popover-exit': { duration: 0.1, ease: [0.4, 0, 1, 1] },
    'dialog-enter': { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
    'dialog-exit': { duration: 0.14, ease: [0.4, 0, 1, 1] },
    'sheet-enter': { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    'sheet-exit': { duration: 0.2, ease: [0.4, 0, 1, 1] },
    'toast-enter': { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
    'toast-exit': { duration: 0.14, ease: [0.4, 0, 1, 1] },
    indicator: { type: 'spring', visualDuration: 0.2, bounce: 0 },
    draw: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  expressive: {
    press: { duration: 0.16, ease: [0.65, 0, 0.35, 1] },
    highlight: { type: 'spring', visualDuration: 0.24, bounce: 0 },
    feedback: { type: 'spring', visualDuration: 0.3, bounce: 0 },
    layout: { type: 'spring', visualDuration: 0.38, bounce: 0.25 },
    'popover-enter': { type: 'spring', visualDuration: 0.26, bounce: 0.2 },
    'popover-exit': { duration: 0.16, ease: [0.4, 0, 1, 1] },
    'dialog-enter': { type: 'spring', visualDuration: 0.38, bounce: 0.2 },
    'dialog-exit': { duration: 0.24, ease: [0.4, 0, 1, 1] },
    'sheet-enter': { type: 'spring', visualDuration: 0.45, bounce: 0.15 },
    'sheet-exit': { duration: 0.3, ease: [0.4, 0, 1, 1] },
    'toast-enter': { type: 'spring', visualDuration: 0.4, bounce: 0.25 },
    'toast-exit': { duration: 0.24, ease: [0.4, 0, 1, 1] },
    indicator: { type: 'spring', visualDuration: 0.3, bounce: 0.2 },
    draw: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
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
    'toast-enter': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    'toast-exit': { duration: 0.12, ease: [0.65, 0, 0.35, 1] },
    indicator: { duration: 0 },
    draw: { duration: 0 },
  },
}
