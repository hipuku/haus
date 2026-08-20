/**
 * @vitest-environment happy-dom
 *
 * These tests never import `extractRawElements` and call it directly. They
 * rebuild it from its own source with `new Function`, which strips every
 * closure over module scope — exactly what Playwright's `page.evaluate` does
 * when it ships the function to the browser. A helper accidentally hoisted to
 * module scope, or a bundler's `__name` wrapper, passes a direct call and
 * fails here. That is the whole point: this suite guards the one property the
 * probe cannot lose.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { extractRawElements } from "./extract.js";
import type { ProbeOptions, RawElement } from "./types.js";

/** Rehydrate the function the way the browser does — no module scope, no imports. */
function asEvaluatedInPage(): (options?: ProbeOptions) => RawElement[] {
  return new Function(`return (${extractRawElements.toString()})`)() as (
    options?: ProbeOptions,
  ) => RawElement[];
}

const probe = asEvaluatedInPage();

beforeEach(() => {
  document.body.innerHTML = `
    <div id="page">
      <p>outside the component</p>
      <div id="probe" style="border-radius: 8px; padding: 16px">
        <span class="label">Save</span>
        <script>var noise = 1</script>
      </div>
    </div>
  `;
});

describe("browser serialisation", () => {
  it("survives being rebuilt from source with no closure", () => {
    expect(() => probe()).not.toThrow();
  });

  it("carries no bundler keepNames helper", () => {
    expect(extractRawElements.toString()).not.toContain("__name");
  });
});

describe("scoping", () => {
  it("reads the root element itself, not only its descendants", () => {
    const tags = probe({ root: "#probe" }).map((e) => e.tag);
    expect(tags).toContain("div");
    expect(tags).toContain("span");
  });

  it("excludes everything outside the root subtree", () => {
    const withText = probe({ root: "#probe" }).filter((e) => e.hasText);
    expect(withText.map((e) => e.tag)).not.toContain("p");
  });

  it("walks the whole document when no root is given", () => {
    expect(probe().map((e) => e.tag)).toContain("p");
  });

  it("returns nothing when the root selector matches nothing", () => {
    // A missed mount must not silently degrade into a whole-page read — that
    // would make a component that never rendered look clean.
    expect(probe({ root: "#never-mounted" })).toEqual([]);
  });

  it("skips non-visual tags inside the root", () => {
    expect(probe({ root: "#probe" }).map((e) => e.tag)).not.toContain("script");
  });
});

describe("options", () => {
  it("honours the maxElements ceiling", () => {
    expect(probe({ maxElements: 1 })).toHaveLength(1);
  });
});

describe("raw output", () => {
  it("returns unparsed computed-style strings for the probed element", () => {
    const [root] = probe({ root: "#probe" });
    expect(root!.raw.borderTopLeftRadius).toBe("8px");
    expect(root!.raw.paddingTop).toBe("16px");
  });

  it("marks direct text nodes", () => {
    const label = probe({ root: "#probe" }).find((e) => e.tag === "span");
    expect(label!.hasText).toBe(true);
  });
});
