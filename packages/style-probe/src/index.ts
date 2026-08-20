/**
 * haus-style-probe — read a rendered element's design decisions.
 *
 * The shared measuring tool underneath the portfolio's design-system auditors.
 * Two halves, deliberately split at the browser boundary:
 *
 *   1. `extractRawElements` runs *in the page* and returns untouched
 *      computed-style strings. Scope it to one component with `{ root }`, or
 *      omit it to walk the whole document.
 *   2. `normaliseElement` runs *in Node* and turns those strings into typed,
 *      unit-normalised values — pure, deterministic, testable without a browser.
 *
 * The split is the point: the same probe answers "what does this whole site
 * ship?" (descriptive audit) and "what does this one mounted component
 * actually render?" (comparison against an intended design).
 *
 * @example
 * ```ts
 * import { extractRawElements, normaliseElement } from 'haus-style-probe'
 *
 * const raw = await page.evaluate(extractRawElements, { root: '#probe' })
 * const [component] = raw.map(normaliseElement)
 * component.styles.borderRadius // → [8]
 * ```
 */

export { extractRawElements } from "./extract.js";

export {
  normaliseElement,
  rgbToHex,
  firstFontFamily,
  pxToNumber,
  normaliseFontWeight,
  normaliseLineHeight,
  normaliseLetterSpacing,
  normaliseBoxShadow,
} from "./normalise.js";

export type { RawElement, ElementStyle, ExtractedElement, ProbeOptions } from "./types.js";
