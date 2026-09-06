/**
 * The Figma build sheet: every component, every variant, rendered.
 *
 * A page to keep open beside Figma while building the library. For each
 * component it prints the Figma component-set name, the variant properties and
 * their values, and then every combination rendered by the real component.
 *
 * Generated rather than written, and that is the point. The sheet this replaces
 * was hand-built on 2026-08-25: 408KB of markup mimicking each component's DOM,
 * with the token layer pasted in beside it. By the time anyone read it again it
 * described a library that no longer existed. Button had grown from two tones
 * to five, six components had been added, every custom property had gained the
 * `--haus-` prefix, and nothing in the file could say so.
 *
 * This imports `haus-components` and renders it with `renderToStaticMarkup`, so
 * the markup is the component's own and the class names are the real hashed
 * ones that `dist/styles.css` targets. The stylesheets are read from `dist`
 * too. If the package changes, this changes with it or it does not build.
 *
 *   node packages/components/scripts/variant-sheet.mjs [outfile]
 *
 * Defaults to `FIGMA-VARIANTS-haus.html` next to the repo.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(PKG, "..", "..");
const TOKENS = join(ROOT, "packages", "tokens", "dist");
const COMPONENTS = join(PKG, "dist");

const C = await import(join(COMPONENTS, "index.js"));

/* ── the vocabulary, from types.ts ──────────────────────────────────────────
   Narrowed per component, and the narrowing is the interesting part: a
   component that has no design for a tone leaves it out rather than inventing
   a colour to satisfy the type. */
const TONE = ["neutral", "info", "success", "warning", "error"];
const APPEARANCE = ["subtle", "solid"];
const SIZE = ["sm", "md", "lg"];

const h = React.createElement;

/* ── a DOM, for the three that portal ────────────────────────────────────────
   Modal, Popover and Tooltip render their panel through createPortal, and a
   portal never appears in a renderToStaticMarkup string: it goes to a DOM node
   that does not exist on the server. So those three are rendered into jsdom and
   read back off document.body, which is the only way to print the thing being
   built. The old sheet left all three out, and a Figma library missing its
   overlay half is missing the half a product cannot avoid writing itself. */
const { JSDOM } = await import("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true });
const w = dom.window;
w.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node",
                   "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame",
                   "MutationObserver", "matchMedia", "CSS", "DOMRect"]) {
  if (w[key] === undefined) continue;
  try { Object.defineProperty(globalThis, key, { value: w[key], configurable: true, writable: true }); } catch {}
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import("react-dom/client");
const { flushSync } = await import("react-dom");

/** Render into a real document and return what landed in the body, portals and
 *  all. The host div is dropped from the output because it is scaffolding. */
const renderInDom = (element, { open } = {}) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  flushSync(() => createRoot(host).render(element));
  /* Tooltip has no `open` prop, deliberately: it is shown by hover or focus and
     nothing else, so the only way to print one is to do what a reader does.
     `open` names the selector to point at. */
  if (open) {
    const trigger = document.querySelector(open);
    /* Focus rather than hover: onFocusCapture listens for focusin, which
       bubbles, and React maps onPointerEnter through pointerover with logic a
       synthetic dispatch does not satisfy. Focus is also the path that matters:
       a tooltip only reachable by pointer is not reachable. */
    if (trigger) flushSync(() => trigger.dispatchEvent(new w.FocusEvent("focusin", { bubbles: true })));
  }
  const html = document.body.innerHTML;
  document.body.innerHTML = "";
  return html.replace(/^<div><\/div>/, "");
};

/**
 * Every component set to build, in the order they are worth building.
 *
 * `props` is the Figma variant-property matrix: each key becomes a variant
 * property and each value one of its options. `booleans` become Figma boolean
 * properties. `render` turns one combination into an element.
 */
const SETS = [
  {
    name: "Badge",
    note: "The cheapest complete demo of the shared vocabulary, and the one to build first. Tone carries meaning, Appearance carries how solidly it is expressed.",
    props: { Tone: [...TONE, "primary"], Appearance: APPEARANCE },
    booleans: { dot: [false, true] },
    render: ({ Tone, Appearance, dot }) =>
      h(C.Badge, { tone: Tone, appearance: Appearance, dot }, Tone),
  },
  {
    name: "Button",
    note: "The flagship, and ruling A5 in one component set: `variant` is visual weight, `tone` is meaning, and every tone composes with every weight. 60 variants. If time-boxed, build Variant x Size complete first, then the five tones at primary/md.",
    props: { Variant: ["primary", "secondary", "ghost", "text"], Tone: TONE, Size: SIZE },
    booleans: { loading: [false, true], disabled: [false, true] },
    render: ({ Variant, Tone, Size, loading, disabled }) =>
      h(C.Button, { variant: Variant, tone: Tone, size: Size, loading, disabled }, "Button"),
  },
  {
    name: "Input",
    note: "The focus ring role and the error state. Label, hint and error are boolean properties in Figma with text layers behind them, not variants.",
    props: {},
    booleans: { hint: [false, true], error: [false, true], required: [false, true] },
    render: ({ hint, error, required }) =>
      h(C.Input, {
        label: "Label",
        required,
        hint: hint ? "A hint under the field" : undefined,
        error: error ? "Something is wrong" : undefined,
        defaultValue: "Value",
      }),
  },
  {
    name: "Card",
    note: "The elevation roles. `elevated` reads --haus-elevation-floating, which is why the effect styles had to exist first.",
    props: { Variant: ["default", "elevated", "outlined"] },
    booleans: { padding: [true, false] },
    render: ({ Variant, padding }) =>
      h(C.Card, { variant: Variant, padding }, h("div", null, "Card content")),
  },
  {
    name: "Callout",
    note: "The newest promotion, and the evidence story worth putting on the documentation page: all three products built one before haus owned it.",
    props: { Tone: TONE },
    render: ({ Tone }) => h(C.Callout, { tone: Tone }, "A short callout, one sentence long."),
  },
  {
    name: "Toast",
    note: "Tone and Appearance again, and the one place the pair changes the surface rather than a chip. A plain Toast is tinted; the dark one is appearance=solid.",
    props: { Tone: TONE, Appearance: APPEARANCE },
    render: ({ Tone, Appearance }) =>
      h(C.Toast, { tone: Tone, appearance: Appearance, title: "Saved" }, "Your change was saved."),
  },
  {
    name: "Avatar",
    note: "Extends the size scale with xs and xl, documented rather than accidental: a picture has a use at 16px that a button does not.",
    props: { Size: ["xs", ...SIZE, "xl"], Status: ["online", "away", "busy", "offline"] },
    render: ({ Size, Status }) => h(C.Avatar, { size: Size, status: Status, name: "Ada Lovelace" }),
  },
  {
    name: "Checkbox",
    props: {},
    booleans: { checked: [false, true], disabled: [false, true] },
    render: ({ checked, disabled }) =>
      h(C.Checkbox, { label: "Checkbox", defaultChecked: checked, disabled }),
  },
  {
    name: "Toggle",
    note: "Narrowed to sm and md. There is no lg design, so there is no lg option.",
    props: { Size: ["sm", "md"] },
    booleans: { checked: [false, true], disabled: [false, true] },
    render: ({ Size, checked, disabled }) =>
      h(C.Toggle, { size: Size, label: "Toggle", defaultChecked: checked, disabled }),
  },
  {
    name: "Select",
    props: {},
    booleans: { error: [false, true], disabled: [false, true] },
    render: ({ error, disabled }) =>
      h(
        C.Select,
        {
          label: "Select",
          disabled,
          error: error ? "Pick one" : undefined,
          defaultValue: "a",
        },
        h("option", { value: "a" }, "Option A"),
        h("option", { value: "b" }, "Option B"),
      ),
  },
  {
    name: "Textarea",
    props: {},
    booleans: { error: [false, true], disabled: [false, true] },
    render: ({ error, disabled }) =>
      h(C.Textarea, {
        label: "Textarea",
        disabled,
        error: error ? "Too short" : undefined,
        defaultValue: "Some text",
      }),
  },
  {
    name: "RadioGroup",
    props: {},
    booleans: { disabled: [false, true] },
    render: ({ disabled }) =>
      h(C.RadioGroup, {
        label: "Radio group",
        name: `r${disabled}`,
        disabled,
        defaultValue: "a",
        options: [
          { value: "a", label: "First" },
          { value: "b", label: "Second" },
        ],
      }),
  },
  {
    name: "Divider",
    note: "One line of CSS that three products had each redrawn. Spacing is a variant property, orientation is the other.",
    props: { Orientation: ["horizontal"], Spacing: ["none", ...SIZE] },
    render: ({ Orientation, Spacing }) =>
      h(C.Divider, { orientation: Orientation, spacing: Spacing }),
  },
  {
    name: "EmptyState",
    note: "Twenty-five references across three products before haus owned it. The heading level is a prop, not a variant: it changes the document outline, not the drawing.",
    props: {},
    booleans: { action: [false, true] },
    render: ({ action }) =>
      h(C.EmptyState, {
        title: "Nothing here yet",
        description: "Add your first item to see it listed.",
        action: action ? h(C.Button, { variant: "primary", size: "md" }, "Add one") : undefined,
      }),
  },
  {
    name: "Tabs",
    note: "All three products built one and none of them was haus's.",
    props: { Size: SIZE },
    render: ({ Size }) =>
      h(C.Tabs, {
        size: Size,
        label: "Sections",
        value: "one",
        onValueChange: () => {},
        items: [
          { value: "one", label: "First" },
          { value: "two", label: "Second" },
          { value: "three", label: "Third", disabled: true },
        ],
      }),
  },
];

/**
 * The three that portal, rendered into a document rather than described.
 *
 * `dom: true` sends the set through jsdom. Popover additionally needs a
 * trigger element to anchor to, which is what `trigger` builds.
 */
const PORTALLED = [
  {
    name: "Modal",
    dom: true,
    note:
      "Reads --haus-elevation-overlay for the panel and the backdrop role for the scrim, so both effect styles have to exist before this is built. In Figma: the panel at three widths, with a title slot, a body slot and an optional footer slot. The backdrop is a separate rectangle at the backdrop colour, not a shadow.",
    props: { Size: SIZE },
    booleans: { footer: [false, true] },
    render: ({ Size, footer }) =>
      h(
        C.Modal,
        {
          open: true,
          onClose: () => {},
          title: "Modal title",
          size: Size,
          footer: footer
            ? h(
                "div",
                { style: { display: "flex", gap: ".5rem", justifyContent: "flex-end" } },
                h(C.Button, { variant: "text", size: "md" }, "Cancel"),
                h(C.Button, { variant: "primary", size: "md" }, "Confirm"),
              )
            : undefined,
        },
        "One paragraph of body copy, so the panel has something to size against.",
      ),
  },
  {
    name: "Popover",
    dom: true,
    note:
      "The primitive under vault's five menus and core's Dropdown. Align and Placement are variant properties; Width is too, and `trigger` means match the trigger's width. Role is a prop rather than a variant, because dialog, menu, listbox and group draw identically and announce differently: one component set, four accessible roles.",
    props: { Placement: ["bottom", "top"], Align: ["start", "end", "stretch"], Width: ["sm", "md"] },
    render: ({ Placement, Align, Width }) => {
      const triggerRef = { current: document.createElement("button") };
      return h(
        C.Popover,
        {
          open: true,
          onClose: () => {},
          triggerRef,
          placement: Placement,
          align: Align,
          width: Width,
          role: "dialog",
          label: "Popover",
        },
        h("div", { style: { padding: ".25rem 0" } }, "Popover content"),
      );
    },
  },
  {
    name: "Tooltip",
    dom: true,
    open: "button",
    note:
      "One product built it, and it has the hardest accessibility contract of the six: it must not be the only place information lives, it has to survive keyboard focus as well as hover, and it is not a Popover. The file should say that last part out loud. Placement is the only variant property; the delay is a prop and has no drawing.",
    props: { Placement: ["top", "bottom"] },
    render: ({ Placement }) =>
      h(
        C.Tooltip,
        { content: "A short tooltip", placement: Placement, delay: 0 },
        h(C.Button, { variant: "secondary", size: "md" }, "Trigger"),
      ),
  },
];

/* ── render ────────────────────────────────────────────────────────────────*/

const combos = (props, booleans) => {
  let out = [{}];
  for (const [key, values] of Object.entries(props ?? {})) {
    out = out.flatMap((row) => values.map((v) => ({ ...row, [key]: v })));
  }
  for (const [key, values] of Object.entries(booleans ?? {})) {
    out = out.flatMap((row) => values.map((v) => ({ ...row, [key]: v })));
  }
  return out;
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const label = (row) =>
  Object.entries(row)
    .filter(([, v]) => v !== false)
    .map(([k, v]) => (v === true ? k : `${k}=${v}`))
    .join(" · ") || "default";

let body = "";
let total = 0;

for (const set of [...SETS, ...PORTALLED]) {
  const rows = combos(set.props, set.booleans);
  total += rows.length;
  const propList = [
    ...Object.entries(set.props ?? {}).map(([k, v]) => `<b>${esc(k)}</b>: ${v.map(esc).join(" | ")}`),
    ...Object.keys(set.booleans ?? {}).map((k) => `<b>${esc(k)}</b>: boolean`),
  ];
  body += `<section><h2>${esc(set.name)} <span class="count">${rows.length} variants</span></h2>`;
  if (set.note) body += `<p class="note">${esc(set.note)}</p>`;
  if (propList.length) body += `<p class="props">${propList.join(" &nbsp;·&nbsp; ")}</p>`;
  body += `<div class="grid">`;
  for (const row of rows) {
    let markup;
    try {
      markup = set.dom ? renderInDom(set.render(row), { open: set.open }) : renderToStaticMarkup(set.render(row));
    } catch (error) {
      markup = `<span class="err">${esc(error.message)}</span>`;
    }
    const cls = set.dom ? "figure wide" : "figure";
    body += `<figure class="${cls}"><figcaption>${esc(label(row))}</figcaption><div class="stage">${markup}</div></figure>`;
  }
  body += `</div></section>`;
}

const css = (f, dir = TOKENS) => readFileSync(join(dir, f), "utf8");
const tokenCss = ["layers.css", "primitives.css", "brand.css", "motion.css", "semantics.css"]
  .map((f) => css(f))
  .join("\n");
const componentCss = css("styles.css", COMPONENTS);

const version = JSON.parse(
  readFileSync(join(PKG, "package.json"), "utf8"),
).version;

const html = `<!doctype html>
<meta charset="utf-8">
<title>haus variants, for the Figma build</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Fira+Code:wght@400&display=swap">
<style>
${tokenCss}
${componentCss}
/* the sheet's own chrome, deliberately outside every haus layer */
nav { position: sticky; top: 0; display: flex; gap: .25rem; padding: .75rem 0; margin-bottom: 2rem;
      background: var(--haus-color-surface-subtle); border-bottom: 1px solid var(--haus-color-border-subtle); z-index: 10; }
nav a, .nav-here { font-size: .8125rem; padding: .375rem .75rem; border-radius: var(--haus-radius-control); text-decoration: none; }
nav a { color: var(--haus-color-ink-secondary); }
nav a:hover { background: var(--haus-color-surface-default); color: var(--haus-color-ink-primary); }
.nav-here { background: var(--haus-color-primary-default); color: var(--haus-color-ink-on-primary); font-weight: 500; }
.wide { grid-column: 1 / -1; }
/* Modal's backdrop and Popover's panel are position: fixed, which on a page of
   previews means every one of them covers the viewport and the last one wins.
   A transform on the stage makes it the containing block for fixed descendants,
   so each overlay is trapped inside its own card. The contain and isolation
   properties both leave position: fixed alone; a transform is the one that works.
   There is no JS here, so an escaped backdrop cannot be dismissed either. */
.wide .stage { min-height: 16rem; align-items: stretch; padding: 0;
               transform: translateZ(0); position: relative; overflow: hidden; }
.wide .stage > * { position: absolute; inset: 0; }
body { margin: 0; padding: 0 2.5rem 6rem; background: var(--haus-color-surface-subtle);
       font-family: var(--haus-font-sans); color: var(--haus-color-ink-primary); }
header { max-width: 60rem; margin-bottom: 3rem; }
h1 { font: var(--haus-type-display-weight, 700) 2rem/1.15 var(--haus-font-sans); margin: 0 0 .75rem; }
header p { max-width: 46rem; line-height: 1.6; color: var(--haus-color-ink-secondary); margin: 0 0 .5rem; }
section { margin-bottom: 4rem; }
h2 { font-size: 1.25rem; margin: 0 0 .35rem; display: flex; align-items: baseline; gap: .75rem; }
h3 { font-size: 1rem; margin: 0 0 .25rem; }
.count { font-size: .75rem; font-weight: 500; color: var(--haus-color-ink-tertiary); }
.note { max-width: 46rem; line-height: 1.6; color: var(--haus-color-ink-secondary); margin: 0 0 .5rem; }
.props { font-family: var(--haus-font-mono); font-size: .75rem; color: var(--haus-color-ink-secondary);
         margin: 0 0 1.25rem; line-height: 1.7; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 1rem; }
figure { margin: 0; background: var(--haus-color-surface-default); border: 1px solid var(--haus-color-border-subtle);
         border-radius: var(--haus-radius-surface); overflow: hidden; }
figcaption { font-family: var(--haus-font-mono); font-size: .6875rem; padding: .5rem .75rem;
             color: var(--haus-color-ink-tertiary); border-bottom: 1px solid var(--haus-color-border-subtle);
             background: var(--haus-color-surface-subtle); word-break: break-word; }
.stage { padding: 1.25rem; display: flex; align-items: center; justify-content: center; min-height: 4.5rem; }
.portalled { background: var(--haus-color-surface-default); border: 1px solid var(--haus-color-border-subtle);
             border-radius: var(--haus-radius-surface); padding: 1.25rem; margin-bottom: 1rem; max-width: 50rem; }
.err { color: var(--haus-color-error-default); font-family: var(--haus-font-mono); font-size: .75rem; }
</style>
<nav>
  <span class="nav-here">Variants</span>
  <a href="FIGMA-DOCS-tokens.html">Page 1 &middot; Tokens</a>
  <a href="FIGMA-DOCS-motion.html">Page 2 &middot; Motion</a>
  <a href="FIGMA-DOCS-getting-started.html">Page 3 &middot; Getting started</a>
</nav>
<header>
  <h1>haus variants, for the Figma build</h1>
  <p>Every variant of every component in <code>haus-components@${esc(version)}</code>, rendered by the
     package itself. ${total} variants across ${SETS.length + PORTALLED.length} component sets, including the three that portal.</p>
  <p>Each caption is the Figma variant-property combination to name the variant. The stylesheets are
     the published ones, so the colours, spacing and type here are the tokens already in your Figma
     file: bind a fill to the variable rather than matching the hex by eye.</p>
  <p>Generated by <code>packages/components/scripts/variant-sheet.mjs</code>. The sheet this replaces was hand-written
     and had drifted: it showed twelve components when there were eighteen, and Button with two
     tones when it takes five.</p>
</header>
${body}
`;

const out = process.argv[2] ?? join(ROOT, "..", "FIGMA-VARIANTS-haus.html");
writeFileSync(out, html);
console.log(`${total} variants across ${SETS.length + PORTALLED.length} sets -> ${out}`);
