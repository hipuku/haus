/**
 * haus states its tokens three times: typed JS constants (index.ts), W3C-DTCG
 * JSON (tokens.json), and CSS custom properties (primitives.css). Three
 * hand-maintained copies of one truth is exactly the drift this design system
 * exists to prevent elsewhere — so it gets caught here, mechanically.
 *
 * The three are not byte-identical, and should not be. DTCG stores a font
 * family as an array, a cubic-bezier as four numbers, and a composite as an
 * alias string (`{duration.normal} {easing.enter}`); the JS and CSS forms store
 * the CSS-ready value. This suite compares them *after* accounting for the
 * representation, so a genuine value change fails and a formatting difference
 * does not.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tokens } from "./index.js";

const json = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
const primitivesCss = readFileSync(new URL("./primitives.css", import.meta.url), "utf8");

/** DTCG tree → { "color.aronia.500": <$value> }, keeping the raw typed value. */
function flattenDtcg(node: Record<string, unknown>, path: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if ("$value" in record) out[[...path, key].join(".")] = record["$value"];
      else Object.assign(out, flattenDtcg(record, [...path, key]));
    }
  }
  return out;
}

/** JS token object → { "color.aronia.500": "oklch(...)" }. */
function flattenJs(node: object, path: string[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object") Object.assign(out, flattenJs(value, [...path, key]));
    else out[[...path, key].join(".")] = String(value);
  }
  return out;
}

/** `--aronia-500: oklch(...)` → { "aronia-500": "oklch(...)" }. Comments stripped. */
function parseCustomProperties(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[name!] = value!.trim();
  }
  return out;
}

/**
 * Collapse a DTCG typed value to the CSS string the other two forms hold.
 * Only the composite types differ; everything else is already a string.
 */
function toCssValue(value: unknown): string {
  if (Array.isArray(value)) {
    // fontFamily → a CSS stack (multi-word families quoted, as CSS requires);
    // cubicBezier → four numbers in a cubic-bezier().
    if (value.every((v) => typeof v === "number")) {
      return `cubic-bezier(${value.map((n) => (n as number).toFixed(2)).join(", ")})`;
    }
    // fontFamily: haus quotes the named face and leaves the generic fallbacks
    // bare — `'Manrope', system-ui, sans-serif`.
    const [face, ...fallbacks] = value.map(String);
    return [`'${face}'`, ...fallbacks].join(", ");
  }
  return String(value);
}

/** Resolve DTCG aliases: `{duration.normal} {easing.enter}` → `200ms cubic-bezier(...)`. */
function resolveAliases(value: string, all: Record<string, unknown>): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => toCssValue(all[ref]));
}

const dtcg = flattenDtcg(json);
const js = flattenJs(tokens);
const css = parseCustomProperties(primitivesCss);

describe("JS constants agree with the DTCG JSON", () => {
  // Semantic tokens and shadow.focus live in the JSON and in semantics.css, but
  // deliberately not in the JS object: the JS export is the primitive layer.
  const jsonOnly = (key: string) => key.startsWith("semantic.") || key === "shadow.focus";

  it("declares every JS token in the JSON", () => {
    expect(Object.keys(js).filter((k) => !(k in dtcg))).toEqual([]);
  });

  it("declares every primitive JSON token in JS", () => {
    expect(Object.keys(dtcg).filter((k) => !jsonOnly(k) && !(k in js))).toEqual([]);
  });

  it("agrees on every shared value, once DTCG types are resolved", () => {
    const mismatches = Object.keys(js)
      .filter((k) => k in dtcg)
      .map((k) => ({ token: k, js: js[k], json: resolveAliases(toCssValue(dtcg[k]), dtcg) }))
      .filter((m) => m.js !== m.json);
    expect(mismatches).toEqual([]);
  });
});

describe("CSS custom properties agree with the JS constants", () => {
  // The JS path → the CSS custom-property name. Breakpoints are JS-only by
  // design: custom properties cannot be used inside @media conditions.
  const NAMING: Array<[string, (leaf: string) => string]> = [
    ["font.size", (l) => `text-${l}`],
    ["font.weight", (l) => `weight-${l}`],
    ["font.lineHeight", (l) => `leading-${l}`],
    ["font.tracking", (l) => `tracking-${l}`],
    ["font.family", (l) => `font-${l}`],
    ["spacing", (l) => `space-${l}`],
    ["radius", (l) => `radius-${l}`],
    ["shadow", (l) => `shadow-${l}`],
    ["zIndex", (l) => `z-${l}`],
    ["borderWidth", (l) => `border-width-${l}`],
    ["opacity", (l) => `opacity-${l}`],
    ["iconSize", (l) => `icon-${l}`],
  ];

  function cssNameFor(path: string): string | null {
    if (path.startsWith("color.")) {
      const [, family, step] = path.split(".");
      return `${family}-${step}`;
    }
    for (const [prefix, name] of NAMING) {
      if (path.startsWith(`${prefix}.`)) return name(path.slice(prefix.length + 1));
    }
    return null;
  }

  it("defines a custom property for every mapped JS token", () => {
    const missing = Object.keys(js)
      .map((k) => ({ token: k, css: cssNameFor(k) }))
      .filter((m) => m.css !== null && !(m.css! in css))
      .map((m) => `${m.token} → --${m.css}`);
    expect(missing).toEqual([]);
  });

  it("agrees on every mapped value", () => {
    const mismatches = Object.keys(js)
      .map((k) => ({ token: k, name: cssNameFor(k) }))
      .filter((m) => m.name !== null && m.name in css)
      .map((m) => ({ token: m.token, js: js[m.token], css: css[m.name!] }))
      .filter((m) => m.js !== m.css);
    expect(mismatches).toEqual([]);
  });

  it("declares no primitive custom property that JS does not know about", () => {
    const known = new Set(Object.keys(js).map(cssNameFor).filter(Boolean) as string[]);
    expect(Object.keys(css).filter((name) => !known.has(name))).toEqual([]);
  });
});
