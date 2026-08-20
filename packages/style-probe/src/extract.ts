/**
 * In-page extraction.
 *
 * `extractRawElements` is serialised and executed inside the browser context
 * via `page.evaluate`. Authoring rules, which are load-bearing:
 *
 *  - **Fully self-contained.** No imports, no references to module scope. Only
 *    the `import type` above survives, because types are erased at build time.
 *  - **No nested named functions.** Bundlers that enable `keepNames` wrap
 *    functions in a `__name(...)` helper that does not exist in the page
 *    context; helpers are inlined below rather than extracted. `tsup.config.ts`
 *    pins `keepNames: false` for the same reason.
 *  - **Plain data in, plain data out.** The options argument crosses the
 *    boundary as JSON; the return value is raw computed-style strings. All
 *    parsing happens later, Node-side, in `normalise.ts`.
 *
 * This is what makes the probe reusable: the same function reads a whole page
 * (drift's crawl) or one mounted component (loom's token read), decided purely
 * by the `root` option.
 */

import type { ProbeOptions, RawElement } from "./types.js";

/** Runs in the browser. Returns untouched computed-style strings per element. */
export function extractRawElements(options?: ProbeOptions): RawElement[] {
  const SKIP = new Set(["SCRIPT", "STYLE", "META", "LINK", "HEAD", "NOSCRIPT", "BR", "TEMPLATE"]);
  const maxElements = options?.maxElements ?? 12_000;
  const out: RawElement[] = [];

  // Scope: a named root reads that element plus its subtree (the single
  // component read); no root walks the whole document (the crawl). A root
  // selector that matches nothing yields an empty result rather than silently
  // falling back to the document — a missed mount must not look like a clean
  // component.
  let all: Element[];
  if (options?.root) {
    const rootEl = document.querySelector(options.root);
    if (!rootEl) return [];
    all = [rootEl, ...Array.from(rootEl.querySelectorAll("*"))];
  } else {
    all = Array.from(document.querySelectorAll("*"));
  }

  for (const node of all) {
    if (out.length >= maxElements) break;
    const el = node as HTMLElement;
    if (SKIP.has(el.tagName)) continue;

    const cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    // Effective background: walk ancestors (incl. self) to the first
    // non-transparent background; fall back to the white page canvas.
    // Deliberately walks past the probe root — the background a reader
    // actually sees is a property of the page, not of the subtree.
    let effectiveBg = "rgb(255, 255, 255)";
    let bgNode: Element | null = el;
    while (bgNode) {
      const bg = window.getComputedStyle(bgNode).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const parts = m[1]!.split(/[,/\s]+/).filter(Boolean);
        const alpha = parts.length >= 4 ? parseFloat(parts[3]!) : 1;
        if (alpha > 0) {
          effectiveBg = bg;
          break;
        }
      }
      bgNode = bgNode.parentElement;
    }

    let hasText = false;
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0) {
        hasText = true;
        break;
      }
    }

    out.push({
      tag: el.tagName.toLowerCase(),
      hasText,
      raw: {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        effectiveBackgroundColor: effectiveBg,
        borderTopColor: cs.borderTopColor,
        borderRightColor: cs.borderRightColor,
        borderBottomColor: cs.borderBottomColor,
        borderLeftColor: cs.borderLeftColor,
        borderTopWidth: cs.borderTopWidth,
        borderRightWidth: cs.borderRightWidth,
        borderBottomWidth: cs.borderBottomWidth,
        borderLeftWidth: cs.borderLeftWidth,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        borderTopLeftRadius: cs.borderTopLeftRadius,
        borderTopRightRadius: cs.borderTopRightRadius,
        borderBottomRightRadius: cs.borderBottomRightRadius,
        borderBottomLeftRadius: cs.borderBottomLeftRadius,
        boxShadow: cs.boxShadow,
        paddingTop: cs.paddingTop,
        paddingRight: cs.paddingRight,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        marginTop: cs.marginTop,
        marginRight: cs.marginRight,
        marginBottom: cs.marginBottom,
        marginLeft: cs.marginLeft,
        rowGap: cs.rowGap,
        columnGap: cs.columnGap,
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        filter: cs.filter,
        backdropFilter: cs.backdropFilter,
        backgroundImage: cs.backgroundImage,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      },
    });
  }

  return out;
}
