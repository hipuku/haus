/**
 * Pure normalisation of raw computed-style strings into typed values.
 *
 * Nothing here touches the DOM or Playwright. Every function is deterministic
 * and individually testable. getComputedStyle returns colours as rgb()/rgba(),
 * lengths in px, and a handful of keywords (`normal`, `none`, `transparent`);
 * these functions collapse that surface into the ElementStyle shape.
 */

import { toHex } from "haus-colour-utils";
import type { ElementStyle, ExtractedElement, RawElement } from "./types.js";

/**
 * Any CSS colour → lowercase hex; null when fully transparent or unparseable.
 *
 * Delegates to haus-colour-utils. getComputedStyle stopped normalising to
 * `rgb()`: a colour authored in OKLCH comes back as `oklch(0.52 0.138 300)`
 * verbatim, so a probe that only speaks rgb() silently reports null for every
 * colour on a modern design system.
 *
 * @deprecated Prefer `toHex`. The name predates support for anything but rgb().
 */
export const rgbToHex = toHex;

/** First family in a font stack, unquoted and trimmed. */
export function firstFontFamily(stack: string): string | null {
  if (!stack) return null;
  const first = stack.split(",")[0];
  if (!first) return null;
  const cleaned = first.trim().replace(/^["']|["']$/g, "").trim();
  return cleaned.length ? cleaned : null;
}

/** "16px" → 16. Null when not a finite number. */
export function pxToNumber(value: string | undefined | null): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

const WEIGHT_KEYWORDS: Record<string, number> = {
  normal: 400,
  bold: 700,
};

export function normaliseFontWeight(value: string): number | null {
  if (!value) return null;
  const keyword = WEIGHT_KEYWORDS[value.trim().toLowerCase()];
  if (keyword) return keyword;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/**
 * Line-height → unitless ratio against font-size.
 * `normal` → null. A px value is divided by font-size. A bare number is kept.
 */
export function normaliseLineHeight(value: string, fontSizePx: number | null): number | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "normal") return null;

  if (v.endsWith("px")) {
    const px = parseFloat(v);
    if (!Number.isFinite(px) || !fontSizePx) return null;
    return round(px / fontSizePx, 3);
  }

  const n = parseFloat(v);
  return Number.isFinite(n) ? round(n, 3) : null;
}

/**
 * Letter-spacing → em against font-size. `normal` → 0.
 * A px value is divided by font-size.
 */
export function normaliseLetterSpacing(value: string, fontSizePx: number | null): number {
  if (!value) return 0;
  const v = value.trim().toLowerCase();
  if (v === "normal") return 0;

  const px = parseFloat(v);
  if (!Number.isFinite(px) || !fontSizePx) return 0;
  return round(px / fontSizePx, 4);
}

/** Raw shadow string, trimmed. `none` → null. */
export function normaliseBoxShadow(value: string): string | null {
  if (!value) return null;
  const v = value.trim();
  return v === "" || v.toLowerCase() === "none" ? null : v;
}

/** Unique values, original order, NaN/null dropped. */
function uniqueDefined<T>(values: (T | null)[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of values) {
    if (v === null) continue;
    if (typeof v === "number" && Number.isNaN(v)) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/** Split a comma-separated CSS list, respecting parens (e.g. cubic-bezier(…)). */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** Blur radii (px) pulled from filter / backdrop-filter declarations. */
function parseBlur(...filters: (string | undefined)[]): number[] {
  const out: number[] = [];
  for (const f of filters) {
    if (!f || f === "none") continue;
    for (const m of f.matchAll(/blur\(([\d.]+)px\)/g)) {
      const n = parseFloat(m[1]!);
      if (Number.isFinite(n) && n > 0) out.push(n);
    }
  }
  return uniqueDefined(out).sort((a, b) => a - b);
}

/** Transition durations in milliseconds (non-zero, distinct). */
function parseDurations(value: string | undefined): number[] {
  if (!value) return [];
  const out: number[] = [];
  for (const part of splitTopLevel(value)) {
    const n = parseFloat(part);
    if (!Number.isFinite(n)) continue;
    const ms = Math.round(/ms/.test(part) ? n : n * 1000);
    if (ms > 0) out.push(ms);
  }
  return uniqueDefined(out).sort((a, b) => a - b);
}

/** Normalise one element's raw computed strings into typed styles. */
export function normaliseElement(el: RawElement): ExtractedElement {
  const r = el.raw;
  const fontSize = pxToNumber(r.fontSize);

  // A side's border colour is only meaningful when that side has width.
  // Computed border-*-color defaults to currentColor even at width 0.
  const borderColorIfVisible = (color: string, width: string): string | null =>
    (pxToNumber(width) ?? 0) > 0 ? toHex(color) : null;

  const durations = parseDurations(r.transitionDuration);

  const styles: ElementStyle = {
    color: toHex(r.color),
    backgroundColor: toHex(r.backgroundColor),
    effectiveBackgroundColor: toHex(r.effectiveBackgroundColor),
    borderColor: uniqueDefined([
      borderColorIfVisible(r.borderTopColor, r.borderTopWidth),
      borderColorIfVisible(r.borderRightColor, r.borderRightWidth),
      borderColorIfVisible(r.borderBottomColor, r.borderBottomWidth),
      borderColorIfVisible(r.borderLeftColor, r.borderLeftWidth),
    ]),
    fontFamily: firstFontFamily(r.fontFamily),
    fontSize,
    fontWeight: normaliseFontWeight(r.fontWeight),
    lineHeight: normaliseLineHeight(r.lineHeight, fontSize),
    letterSpacing: normaliseLetterSpacing(r.letterSpacing, fontSize),
    borderRadius: uniqueDefined([
      pxToNumber(r.borderTopLeftRadius),
      pxToNumber(r.borderTopRightRadius),
      pxToNumber(r.borderBottomRightRadius),
      pxToNumber(r.borderBottomLeftRadius),
    ]),
    boxShadow: normaliseBoxShadow(r.boxShadow),
    padding: [
      pxToNumber(r.paddingTop) ?? 0,
      pxToNumber(r.paddingRight) ?? 0,
      pxToNumber(r.paddingBottom) ?? 0,
      pxToNumber(r.paddingLeft) ?? 0,
    ],
    margin: [
      pxToNumber(r.marginTop) ?? 0,
      pxToNumber(r.marginRight) ?? 0,
      pxToNumber(r.marginBottom) ?? 0,
      pxToNumber(r.marginLeft) ?? 0,
    ],
    gap: uniqueDefined([pxToNumber(r.rowGap), pxToNumber(r.columnGap)]),
    borderWidths: [
      pxToNumber(r.borderTopWidth) ?? 0,
      pxToNumber(r.borderRightWidth) ?? 0,
      pxToNumber(r.borderBottomWidth) ?? 0,
      pxToNumber(r.borderLeftWidth) ?? 0,
    ],
    opacity: r.opacity != null ? parseFloat(r.opacity) : undefined,
    zIndex: r.zIndex == null || r.zIndex === "auto" ? null : (pxToNumber(r.zIndex) ?? null),
    blur: parseBlur(r.filter, r.backdropFilter),
    gradient: r.backgroundImage && r.backgroundImage.includes("gradient(") ? r.backgroundImage : null,
    motionDurations: durations,
    motionEasings: durations.length ? uniqueDefined(splitTopLevel(r.transitionTimingFunction ?? "")) : [],
  };

  return { tag: el.tag, hasText: el.hasText, styles };
}
