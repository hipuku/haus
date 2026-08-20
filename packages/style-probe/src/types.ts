/**
 * The probe contract — the boundary between "what the browser rendered" and
 * "what a design-system tool can reason about".
 *
 * Two shapes, deliberately separate:
 *
 *  - RawElement       what the in-browser probe returns: untouched
 *                     getComputedStyle strings, no parsing in the page context.
 *  - ExtractedElement what the Node-side normaliser produces: typed,
 *                     unit-normalised values ready for analysis.
 *
 * Keeping raw strings on one side and normalised values on the other means the
 * normalisation is pure, runs outside the browser, and is unit-testable without
 * launching a browser at all.
 */

/** Untouched computed-style strings for a single element, gathered in-page. */
export interface RawElement {
  tag: string;
  /** True when the element has non-whitespace direct text (a contrast candidate). */
  hasText: boolean;
  raw: {
    color: string;
    backgroundColor: string;
    /** Nearest non-transparent ancestor background (incl. self); page canvas as fallback. */
    effectiveBackgroundColor: string;
    borderTopColor: string;
    borderRightColor: string;
    borderBottomColor: string;
    borderLeftColor: string;
    borderTopWidth: string;
    borderRightWidth: string;
    borderBottomWidth: string;
    borderLeftWidth: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
    borderBottomRightRadius: string;
    borderBottomLeftRadius: string;
    boxShadow: string;
    paddingTop: string;
    paddingRight: string;
    paddingBottom: string;
    paddingLeft: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    rowGap?: string;
    columnGap?: string;
    opacity?: string;
    zIndex?: string;
    filter?: string;
    backdropFilter?: string;
    backgroundImage?: string;
    transitionDuration?: string;
    transitionTimingFunction?: string;
  };
}

/** Normalised, typed styles for a single element. Nulls mean "not set / not meaningful". */
export interface ElementStyle {
  /** Hex, lowercase. Includes a trailing alpha pair when alpha < 1. Null when fully transparent. */
  color: string | null;
  backgroundColor: string | null;
  /**
   * The background a reader actually sees behind this element's text:
   * the nearest non-transparent ancestor background, or the page canvas.
   * This is the value to pair with `color` for contrast.
   */
  effectiveBackgroundColor: string | null;
  /** Unique border colours across the four sides, nulls dropped. */
  borderColor: string[];
  /** First family in the stack, unquoted. */
  fontFamily: string | null;
  /** Pixels. */
  fontSize: number | null;
  /** Numeric weight (normal → 400, bold → 700). */
  fontWeight: number | null;
  /** Unitless ratio relative to font-size. Null for `normal`. */
  lineHeight: number | null;
  /** Em, relative to font-size. 0 for `normal`. */
  letterSpacing: number;
  /** Unique corner radii in pixels. */
  borderRadius: number[];
  /** Raw shadow value. Null for `none`. */
  boxShadow: string | null;
  /** [top, right, bottom, left] in pixels. */
  padding: [number, number, number, number];
  /** [top, right, bottom, left] in pixels. Can be negative. Absent on pre-margin crawls. */
  margin?: [number, number, number, number];
  /** Distinct flex/grid gap values (row + column) in pixels. Absent on pre-gap crawls. */
  gap?: number[];
  /** Border widths [top, right, bottom, left] in pixels. Absent on pre-border crawls. */
  borderWidths?: [number, number, number, number];
  /** Computed opacity, 0–1. 1 is the opaque default. */
  opacity?: number;
  /** Parsed z-index; null for `auto`. */
  zIndex?: number | null;
  /** Blur radii (px) from filter / backdrop-filter. */
  blur?: number[];
  /** Gradient declaration when background-image is a gradient; null otherwise. */
  gradient?: string | null;
  /** Transition durations in milliseconds (non-zero, distinct). */
  motionDurations?: number[];
  /** Transition timing functions (distinct). */
  motionEasings?: string[];
}

export interface ExtractedElement {
  tag: string;
  hasText: boolean;
  styles: ElementStyle;
}

/**
 * How much of the page to probe.
 *
 * Must stay a plain, JSON-serialisable object: it crosses into the browser
 * context as a `page.evaluate` argument.
 */
export interface ProbeOptions {
  /**
   * CSS selector for the subtree to read. When set, the probe reads the
   * matched element **and its descendants**, and nothing else — the
   * single-component read (mount one component, measure it). When omitted,
   * the whole document is walked — the site-wide crawl.
   */
  root?: string;
  /**
   * Ceiling on extracted elements. Defaults to 12,000.
   *
   * Safety valve: a single animation-heavy page (e.g. GSAP) can have tens of
   * thousands of nodes and exhaust the heap on its own. The design system lives
   * in the shared stylesheet, so the first several thousand elements already
   * cover the token set.
   */
  maxElements?: number;
}
