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
    figma: "12 variants, Tone x Appearance. `dot` is a boolean property: it only shows and hides a layer, which is the one thing a Figma boolean can do.",
    note: "The cheapest complete demo of the shared vocabulary, and the one to build first. Tone carries meaning, Appearance carries how solidly it is expressed.",
    props: { Tone: [...TONE, "primary"], Appearance: APPEARANCE },
    booleans: { dot: [false, true] },
    render: ({ Tone, Appearance, dot }) =>
      h(C.Badge, { tone: Tone, appearance: Appearance, dot }, Tone),
  },
  {
    name: "Button",
    figma: "120 variants, Variant x Tone x Size x Disabled. Disabled cannot be a boolean here because it sets opacity on the root and a boolean binds to layer visibility alone. `loading` can be a boolean, the spinner is a layer, but it also forces the disabled treatment, so a loading instance is the Disabled variant with that boolean on. Build Variant x Size at neutral first if time-boxed.",
    note: "The flagship, and ruling A5 in one component set: `variant` is visual weight, `tone` is meaning, and every tone composes with every weight. 60 variants. If time-boxed, build Variant x Size complete first, then the five tones at primary/md.",
    props: { Variant: ["primary", "secondary", "ghost", "text"], Tone: TONE, Size: SIZE },
    booleans: { loading: [false, true], disabled: [false, true] },
    render: ({ Variant, Tone, Size, loading, disabled }) =>
      h(C.Button, { variant: Variant, tone: Tone, size: Size, loading, disabled }, "Button"),
  },
  {
    name: "Input",
    figma: "5 variants. One variant property, State, with these five values.",
    note: "The five states are the five selectors in Input.module.css and there is no hover or active rule in the file. Drawn with every layer present, because that is the master variant and the booleans hide them from there: label, required, the two adornments, and the hint or the error line. Note where the adornments sit, inside the border, so they are inside whatever the state does to it. Everything else costs no frames: Label, Required, Prefix, Suffix, Hint, and Filled, which swaps two stacked text layers because placeholder against value is a fill change. Hint and error are mutually exclusive, the component renders {hint && !error}, so the hint is hidden in both Error states. Disabled beats error on source order, which is why this is one property with five values rather than State crossed with Error.",
    props: { State: ["Default", "Focus", "Error", "Error focus", "Disabled"] },
    force: ({ State }) => State === "Focus" || State === "Error focus",
    /* Every layer present, because that is how the master variant is built: the
       booleans hide them, so a variant drawn without them has nowhere to hide
       them from. It also shows the thing a bare field cannot, which is that the
       adornments sit inside the border and therefore inside whatever the state
       does to it. */
    render: ({ State }) =>
      h(C.Input, {
        label: "Amount",
        required: true,
        prefix: "$",
        suffix: "AUD",
        hint: State.startsWith("Error") ? undefined : "Including GST",
        error: State.startsWith("Error") ? "Enter an amount over zero" : undefined,
        disabled: State === "Disabled",
        defaultValue: "1250.00",
      }),
  },
  {
    name: "Input, the booleans",
    figma: "No new variants. Every row here is the same five State variants with a layer shown or hidden, which is the one thing a Figma boolean property can do.",
    note: "Prefix and suffix are slots inside the field's border, before and after the text, each a span carrying ink-secondary at body-sm. They are what a currency symbol, a unit, a protocol or a small icon goes in, and nothing in this repository had ever rendered one, which is a fair reason for them to be puzzling. Build both as hidden layers in all five variants and expose them as booleans. Filled is the pair of stacked text layers: hiding one shows the other.",
    props: {
      Property: ["Label off", "Required on", "Prefix", "Suffix", "Prefix and suffix", "Hint on", "Placeholder"],
    },
    render: ({ Property }) =>
      h(C.Input, {
        label: Property === "Label off" ? undefined : "Amount",
        required: Property === "Required on",
        prefix: Property === "Prefix" || Property === "Prefix and suffix" ? "$" : undefined,
        suffix: Property === "Suffix" || Property === "Prefix and suffix" ? "AUD" : undefined,
        hint: Property === "Hint on" ? "Including GST" : undefined,
        placeholder: Property === "Placeholder" ? "0.00" : undefined,
        defaultValue: Property === "Placeholder" ? undefined : "1250.00",
      }),
  },
  {
    name: "Card",
    figma: "6 variants, Variant x Padding. Padding has to be a variant rather than a boolean: it changes the frame padding, and a boolean only shows and hides a layer.",
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
    figma: "18 variants, Selection x State. Selection is Unchecked, Checked, Indeterminate; State is Default, Hover, Focus, Error, Error focus, Disabled. This component has a hover rule, which the three text controls do not. Disabled is 40% opacity on the whole frame, so it cannot be a boolean either.",
    props: {},
    booleans: { checked: [false, true], disabled: [false, true] },
    render: ({ checked, disabled }) =>
      h(C.Checkbox, { label: "Checkbox", defaultChecked: checked, disabled }),
  },
  {
    name: "Toggle",
    figma: "16 variants, Size x Checked x State, where State is Default, Hover, Focus, Disabled. Checked moves the thumb and repaints the track, disabled sets opacity on the whole frame, and neither is a layer toggle. 32 if you also build the Label position axis, which is worth deferring.",
    note: "Narrowed to sm and md. There is no lg design, so there is no lg option.",
    props: { Size: ["sm", "md"] },
    booleans: { checked: [false, true], disabled: [false, true] },
    render: ({ Size, checked, disabled }) =>
      h(C.Toggle, { size: Size, label: "Toggle", defaultChecked: checked, disabled }),
  },
  {
    name: "Textarea",
    figma: "5 variants, the same State property as Input.",
    note: "The identical five selectors. No adornment booleans; it gains a resize handle instead.",
    props: { State: ["Default", "Focus", "Error", "Error focus", "Disabled"] },
    force: ({ State }) => State === "Focus" || State === "Error focus",
    render: ({ State }) =>
      h(C.Textarea, {
        label: "Textarea",
        disabled: State === "Disabled",
        error: State.startsWith("Error") ? "Too short" : undefined,
        defaultValue: "Some text",
      }),
  },
  {
    name: "RadioGroup",
    figma: "Two components. The Radio item is 12 variants, Selection x State, the same six State values as Checkbox. RadioGroup is 2, Orientation vertical or horizontal, and holds instances of the item.",
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
    figma: "8 variants, Orientation x Spacing. Only the horizontal half is drawn here, because a vertical rule stretches to a flex parent and has nothing to stretch to on this page. Build both.",
    note: "One line of CSS that three products had each redrawn. Spacing is a variant property, orientation is the other.",
    props: { Orientation: ["horizontal"], Spacing: ["none", ...SIZE] },
    render: ({ Orientation, Spacing }) =>
      h(C.Divider, { orientation: Orientation, spacing: Spacing }),
  },
  {
    name: "EmptyState",
    figma: "1 variant. `action` is a boolean property: the slot is a layer, so both rows below are the same component.",
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
    figma: "Two components. The Tab item is 18 variants, Size x State, where State is Default, Hover, Focus, Selected, Selected focus and Disabled. The Tabs container is 3, Size, and holds instances. There is no Selected hover: hover only takes the text to ink-primary and a selected tab is already there.",
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
    figma: "3 variants, Size, which only caps the dialog width at 400, 560 or 720. Header, Close and Footer are boolean properties. 9 if you also build the close button's hover and focus, which is worth deferring.",
    figma: "3 variants, Size. `footer` is a boolean property, the footer is a layer, so the six rows below are three variants with it on and off.",
    dom: true,
    stage: "stage-fill",
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
    stage: "stage-anchor",
    note:
      "The primitive under vault's five menus and core's Dropdown. Placement and Align are the two variant properties and they are pure CSS against the trigger, so the preview draws a real trigger button under each one: without it every value renders in the same place and the properties look inert. Placement puts the panel above or below. Align pins the panel's start edge, its end edge, or stretches it to the trigger's width. Role is a prop rather than a variant, because dialog, menu, listbox and group draw identically and announce differently: one component set, four accessible roles. There is deliberately no collision detection, and the component says so: no flipping at the viewport edge and no shifting along the cross axis. Placement is the caller's answer, one level up, where the layout is known.",
    props: { Placement: ["bottom", "top"], Align: ["start", "end", "stretch"] },
    render: ({ Placement, Align }) => {
      const triggerRef = { current: null };
      return h(
        "span",
        { className: "anchor" },
        h(C.Button, { variant: "secondary", size: "md", ref: triggerRef }, "A wide trigger button"),
        h(
          C.Popover,
          {
            open: true,
            onClose: () => {},
            triggerRef,
            placement: Placement,
            align: Align,
            role: "dialog",
            label: "Popover",
          },
          /* Narrower than the trigger on purpose. `stretch` is inset-inline: 0, so
             the panel takes the trigger's width, and a panel whose content is
             already wider than the trigger cannot shrink to show it: stretch then
             renders identically to start and the property looks inert. */
          h("div", { style: { whiteSpace: "nowrap" } }, "Item"),
        ),
      );
    },
  },
  {
    name: "Tooltip",
    figma: "2 variants, Placement. The bubble is pinned to the trigger's leading edge rather than centred on it, deliberately, and that is the thing most likely to be corrected while building.",
    dom: true,
    stage: "stage-anchor",
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
  /* The count on the heading is how many stages are drawn below, which is not
     always how many component variants Figma needs. `figma` says the second
     number in words wherever the two differ, because a reader counts what is on
     the page: Input showed eight rows of content while needing five states, and
     the page never said so. */
  body += `<section><h2>${esc(set.name)} <span class="count">${rows.length} shown</span></h2>`;
  body += `<p class="figma"><b>In Figma:</b> ${esc(set.figma ?? `${rows.length} variants.`)}</p>`;
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
    const stageCls = [
      "stage",
      set.stage ?? "",
      set.force?.(row) ? "force-focus" : "",
    ].filter(Boolean).join(" ");
    body += `<figure class="${cls}"><figcaption>${esc(label(row))}</figcaption><div class="${stageCls}">${markup}</div></figure>`;
  }
  body += `</div></section>`;
}

const css = (f, dir = TOKENS) => readFileSync(join(dir, f), "utf8");
const tokenCss = ["layers.css", "primitives.css", "brand.css", "motion.css", "semantics.css"]
  .map((f) => css(f))
  .join("\n");
const componentCss = css("styles.css", COMPONENTS);

/**
 * The focus states, rendered.
 *
 * Three of a text control's five states come from props and render on their
 * own: default, error and disabled. The other two are `:focus-visible`, and a
 * string of static markup has no focus, so this page used to omit them. That is
 * how it came to show eight rows for Input, which are content combinations,
 * while Figma needs five, which are states. Somebody reading the page counted
 * the rows.
 *
 * So the focus rules are re-applied under a `.force-focus` ancestor, and
 * **generated from the shipped stylesheet rather than restated**. A hand-written
 * copy of `box-shadow: var(--haus-focus-ring)` here would be a second place for
 * the focus treatment to live, and this repository has already paid for one of
 * those: `Colours.stories.tsx` typed the ramps by hand and went on drawing the
 * old ones for a day after the 1.0 cut changed them.
 *
 * Every rule whose selector mentions `:focus-visible` is emitted again with
 * that pseudo-class removed and `.force-focus` prepended, so the declarations
 * are the same characters the browser would have applied. If the component
 * stops using `:focus-visible`, nothing matches and the stage renders
 * unfocused, which is visible rather than silent.
 */
function forcedFocusCss(sheet, components) {
  /* Re-apply a component's whole cascade with `:focus-visible` satisfied.
   *
   * Brace-aware rather than a regex over the file, because the first version was
   * a regex and it lifted the `@media (forced-colors: active)` rules out of
   * their media query. Those set `outline: 2px solid Highlight`, correct inside
   * Windows High Contrast and a stray outline on every focused stage anywhere
   * else.
   *
   * And *every* rule of the component, not only the ones mentioning focus,
   * which the second version got wrong. Input's error border works by source
   * order: `.inputWrap:has(:focus-visible)` sets `border-color` to the focus
   * role, and `.inputWrap.error` sets it to the error role three rules later at
   * equal specificity, so the error colour wins. Forcing only the focus rule
   * lifts it out of that ordering and above every layered rule, and the Error
   * focus stage rendered with a purple border where the component draws a red
   * one. Copying the component's rules in their original order reproduces the
   * cascade among themselves, because every selector gains the same one class.
   *
   * Caught by rendering the page in a real browser and reading the computed
   * border colour, which is the only thing that could have caught it: the
   * markup was correct, the generated CSS was correct rule by rule, and the
   * result was wrong.
   */
  const out = [];
  const wanted = (selector) =>
    [...components].some((name) => selector.includes(`haus-${name}-`));
  const emit = (selector, body) => {
    if (!wanted(selector)) return;
    const forced = selector
      .split(",")
      .map((one) => `.force-focus ${one.trim().replace(/:has\(:focus-visible\)/g, "").replace(/:focus-visible/g, "")}`)
      .join(", ");
    out.push(`${forced} { ${body.trim()} }`);
  };
  const scan = (text) => {
    let cursor = 0;
    while (cursor < text.length) {
      const open = text.indexOf("{", cursor);
      if (open === -1) return;
      const prelude = text.slice(cursor, open).trim();
      let depth = 1;
      let close = open + 1;
      for (; close < text.length && depth > 0; close++) {
        if (text[close] === "{") depth++;
        else if (text[close] === "}") depth--;
      }
      const body = text.slice(open + 1, close - 1);
      if (prelude.startsWith("@layer") || prelude.startsWith("@supports")) scan(body);
      else if (!prelude.startsWith("@")) emit(prelude, body);
      cursor = close;
    }
  };
  scan(sheet);
  if (!out.length) throw new Error("the forced-focus pass matched nothing");
  const stray = out.filter((r) => /highlight/i.test(r));
  if (stray.length) throw new Error(`forced-colors rules escaped their media query: ${stray[0]}`);
  return `/* Generated from styles.css by variant-sheet.mjs. See forcedFocusCss. */\n${out.join("\n")}`;
}

const focusCss = forcedFocusCss(
  componentCss,
  new Set([...SETS, ...PORTALLED].filter((set) => set.force).map((set) => set.name)),
);

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
${focusCss}
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
.wide .stage { min-height: 16rem; transform: translateZ(0); position: relative; overflow: hidden; }
/* Modal fills its card: the backdrop is the scrim and should read as one. */
.stage-fill { align-items: stretch; padding: 0; }
.stage-fill > * { position: absolute; inset: 0; }
/* Popover and Tooltip are positioned against a trigger the caller owns, so the
   preview has to supply one. Without it every placement and align value renders
   in the same spot and the properties look like they do nothing, which is
   exactly how the first version of this sheet read. */
.stage-anchor { align-items: center; justify-content: center; padding: 4rem 1.25rem; }
.anchor { position: relative; display: inline-block; }
.anchor > button { pointer-events: none; }
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
.figma { max-width: 46rem; line-height: 1.6; margin: 0 0 .5rem; padding: .5rem .75rem;
         border-inline-start: 3px solid var(--haus-color-primary-default);
         background: var(--haus-color-primary-subtle); color: var(--haus-color-ink-primary);
         border-radius: 0 var(--haus-radius-control) var(--haus-radius-control) 0; }
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
