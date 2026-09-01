/* ─── haus / tokens ──────────────────────────────────────────────────────────
   Typed constants for the primitive layer.

   The CSS custom properties are the runtime form; this exists for the places
   they cannot reach: @media conditions, build config, style-in-JS. Semantic
   tokens are deliberately absent: their whole job is to be swappable at
   runtime, which freezing them into a constant would defeat.

   GENERATED FROM src/tokens.json. Do not edit.
   Regenerate with `npm run tokens`; `npm run tokens:check` fails CI if stale.
   ─────────────────────────────────────────────────────────────────────────── */

export const tokens = {
  color: {
    aronia: {
      "100": "oklch(97% 0.012 300)",
      "200": "oklch(92% 0.028 300)",
      "300": "oklch(84% 0.058 300)",
      "400": "oklch(72% 0.100 300)",
      "500": "oklch(52% 0.138 300)",
      "600": "oklch(43% 0.125 300)",
      "700": "oklch(35% 0.105 300)",
      "800": "oklch(26% 0.080 300)",
      "900": "oklch(18% 0.052 300)",
      "950": "oklch(12% 0.032 300)",
    },
    damson: {
      "0": "oklch(100% 0 0)",
      "50": "oklch(99% 0.003 290)",
      "100": "oklch(97% 0.006 290)",
      "200": "oklch(93% 0.008 290)",
      "300": "oklch(86% 0.010 290)",
      "400": "oklch(74% 0.010 290)",
      "500": "oklch(60% 0.008 290)",
      "600": "oklch(48% 0.007 290)",
      "700": "oklch(37% 0.006 290)",
      "800": "oklch(27% 0.005 290)",
      "900": "oklch(18% 0.003 290)",
      "950": "oklch(11% 0.002 290)",
    },
    elderberry: {
      "100": "oklch(97% 0.020 265)",
      "200": "oklch(93% 0.040 265)",
      "400": "oklch(74% 0.160 265)",
      "500": "oklch(55% 0.200 265)",
      "700": "oklch(42% 0.160 265)",
      "900": "oklch(30% 0.120 265)",
    },
    greengage: {
      "100": "oklch(97% 0.030 148)",
      "200": "oklch(93% 0.055 148)",
      "400": "oklch(75% 0.150 148)",
      "500": "oklch(58% 0.185 148)",
      "700": "oklch(45% 0.150 148)",
      "900": "oklch(33% 0.110 148)",
    },
    mango: {
      "100": "oklch(97% 0.025 65)",
      "200": "oklch(93% 0.045 65)",
      "400": "oklch(76% 0.145 65)",
      "500": "oklch(60% 0.175 65)",
      "700": "oklch(47% 0.142 65)",
      "900": "oklch(38% 0.110 65)",
    },
    cherry: {
      "100": "oklch(97% 0.030 27)",
      "200": "oklch(93% 0.055 27)",
      "400": "oklch(74% 0.160 27)",
      "500": "oklch(58% 0.200 27)",
      "700": "oklch(44% 0.168 27)",
      "900": "oklch(33% 0.110 27)",
    },
  },
  font: {
    family: {
      sans: "'Manrope', system-ui, sans-serif",
      mono: "'Fira Code', ui-monospace, monospace",
    },
    size: {
      "11": "0.6875rem",
      "12": "0.75rem",
      "13": "0.8125rem",
      "14": "0.875rem",
      "16": "1rem",
      "20": "1.25rem",
      "24": "1.5rem",
      "30": "1.875rem",
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.15,
      tighter: 1.2,
      snug: 1.25,
      compact: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.6,
    },
    tracking: {
      tight: "-0.01em",
      normal: "0em",
      wide: "0.02em",
      widest: "0.08em",
    },
  },
  spacing: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  duration: {
    instant: "50ms",
    fast: "100ms",
    normal: "200ms",
    moderate: "300ms",
    slow: "500ms",
  },
  easing: {
    enter: "cubic-bezier(0.00, 0.00, 0.20, 1.00)",
    exit: "cubic-bezier(0.40, 0.00, 1.00, 1.00)",
    move: "cubic-bezier(0.40, 0.00, 0.20, 1.00)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1.00)",
    linear: "linear",
  },
  motion: {
    "fade-in": "200ms cubic-bezier(0.00, 0.00, 0.20, 1.00)",
    "fade-out": "100ms cubic-bezier(0.40, 0.00, 1.00, 1.00)",
    "slide-in": "300ms cubic-bezier(0.00, 0.00, 0.20, 1.00)",
    "slide-out": "100ms cubic-bezier(0.40, 0.00, 1.00, 1.00)",
    micro: "100ms cubic-bezier(0.40, 0.00, 0.20, 1.00)",
    interactive: "200ms cubic-bezier(0.40, 0.00, 0.20, 1.00)",
  },
  shadow: {
    none: "none",
    sm: "0 1px 2px oklch(18% 0.003 290 / 0.06)",
    md: "0 4px 6px -1px oklch(18% 0.003 290 / 0.10), 0 2px 4px -2px oklch(18% 0.003 290 / 0.10)",
    lg: "0 10px 15px -3px oklch(18% 0.003 290 / 0.10), 0 4px 6px -4px oklch(18% 0.003 290 / 0.07)",
    xl: "0 20px 25px -5px oklch(18% 0.003 290 / 0.10), 0 8px 10px -6px oklch(18% 0.003 290 / 0.10)",
  },
  zIndex: {
    base: 0,
    raised: 10,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    toast: 500,
    tooltip: 600,
  },
  borderWidth: {
    default: "1px",
    thick: "2px",
  },
  opacity: {
    disabled: 0.4,
    overlay: 0.6,
  },
  iconSize: {
    xs: "0.75rem",
    sm: "1rem",
    md: "1.25rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  breakpoint: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const

export type Tokens = typeof tokens

/* The brand map's type and role list, generated from brand.css. Re-exported here
   so a consumer has one entry point rather than two. */
export type { BrandMap } from './brand'
export { brandRoles } from './brand'
