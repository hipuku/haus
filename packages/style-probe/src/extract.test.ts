/**
 * @vitest-environment happy-dom
 *
 * Every behavioural test here runs twice, against two copies of the same
 * function. `imported` is the module export. `evaluated` is rebuilt from its
 * own source with `new Function`, which strips every closure over module
 * scope, exactly what Playwright's `page.evaluate` does when it ships the
 * function to the browser. A helper accidentally hoisted to module scope, or a
 * bundler's `__name` wrapper, passes the first and fails the second.
 *
 * Running both is not redundant. Only the rehydrated copy proves the
 * serialisation property, and only the imported one is attributed by the
 * coverage instrumenter: a suite that called the rebuilt copy alone reported
 * `extract.ts` at 45% while in fact exercising it, because v8 charges the
 * execution to the anonymous function rather than to the file it came from.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { extractRawElements } from "./extract.js";
import type { ProbeOptions, RawElement } from "./types.js";

type Probe = (options?: ProbeOptions) => RawElement[];

/** Rehydrate the function the way the browser does, with no module scope and no imports. */
function asEvaluatedInPage(): Probe {
  return new Function(`return (${extractRawElements.toString()})`)() as Probe;
}

const PROBES: [string, Probe][] = [
  ["imported", extractRawElements],
  ["evaluated in page", asEvaluatedInPage()],
];

describe("browser serialisation", () => {
  it("survives being rebuilt from source with no closure", () => {
    expect(() => asEvaluatedInPage()()).not.toThrow();
  });

  it("carries no bundler keepNames helper", () => {
    expect(extractRawElements.toString()).not.toContain("__name");
  });
});

describe.each(PROBES)("%s", (_name, probe) => {
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
      // A missed mount must not silently degrade into a whole-page read, because that
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

    it("applies the default ceiling when none is given", () => {
      // The default is 12,000, well above this document, so the guard must not
      // truncate a page that is nowhere near it.
      expect(probe().length).toBeGreaterThan(1);
    });
  });

  describe("visibility", () => {
    it("skips display: none", () => {
      document.body.innerHTML = `<div id="probe"><span id="gone" style="display: none">x</span></div>`;
      expect(probe({ root: "#probe" }).map((e) => e.tag)).not.toContain("span");
    });

    it("skips visibility: hidden", () => {
      document.body.innerHTML = `<div id="probe"><span style="visibility: hidden">x</span></div>`;
      expect(probe({ root: "#probe" }).map((e) => e.tag)).not.toContain("span");
    });
  });

  describe("effective background", () => {
    it("takes the element's own background when it is opaque", () => {
      document.body.innerHTML = `<div id="probe" style="background-color: rgb(10, 20, 30)"></div>`;
      expect(probe({ root: "#probe" })[0]!.raw.effectiveBackgroundColor).toBe("rgb(10, 20, 30)");
    });

    it("walks to the nearest opaque ancestor through a transparent element", () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(1, 2, 3)">
          <div id="probe" style="background-color: transparent"><span id="leaf">x</span></div>
        </div>`;
      const leaf = probe({ root: "#leaf" })[0]!;
      expect(leaf.raw.effectiveBackgroundColor).toBe("rgb(1, 2, 3)");
    });

    it("treats a zero-alpha rgba() as transparent and keeps walking", () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(4, 5, 6)">
          <div id="probe" style="background-color: rgba(0, 0, 0, 0)"></div>
        </div>`;
      expect(probe({ root: "#probe" })[0]!.raw.effectiveBackgroundColor).toBe("rgb(4, 5, 6)");
    });

    it("stops at a partially transparent rgba(), which is still paint", () => {
      document.body.innerHTML = `<div id="probe" style="background-color: rgba(7, 8, 9, 0.5)"></div>`;
      expect(probe({ root: "#probe" })[0]!.raw.effectiveBackgroundColor).toContain("7");
    });

    it("falls back to the page canvas when no ancestor paints", () => {
      document.body.innerHTML = `<div id="probe"></div>`;
      expect(probe({ root: "#probe" })[0]!.raw.effectiveBackgroundColor).toBe("rgb(255, 255, 255)");
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

    it("does not mark an element whose only text is inside a child", () => {
      document.body.innerHTML = `<div id="probe"><span>Save</span></div>`;
      expect(probe({ root: "#probe" })[0]!.hasText).toBe(false);
    });

    it("does not mark whitespace-only text as text", () => {
      document.body.innerHTML = `<div id="probe">   \n   </div>`;
      expect(probe({ root: "#probe" })[0]!.hasText).toBe(false);
    });
  });
});
