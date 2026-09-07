/**
 * The three documentation pages, as they should read in the Figma file.
 *
 * Every haus Figma page except these is a drawing of something that also exists
 * in code, so the code can be the source. These three are the exception: they
 * are what the file has to say that the code cannot show, and until now they
 * existed only as a line in the plan saying "documentation pages, none".
 *
 * Each page here maps to one Figma page. The headings are the frames, the
 * tables are the content, and the values are read from the published packages
 * so nothing has to be transcribed by eye.
 *
 *   node scripts/figma-docs.mjs [outdir]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(PKG, "..", "..");
const TOKENS = join(ROOT, "packages", "tokens", "dist");
const SRC = join(ROOT, "packages", "tokens", "src");

const read = (f, dir = TOKENS) => readFileSync(join(dir, f), "utf8");
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Declarations of a family, as [name, value, trailing comment]. */
function declarations(css, pattern) {
  const out = [];
  for (const m of css.matchAll(/^\s*(--haus-[a-z0-9-]+)\s*:\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?/gm)) {
    if (pattern.test(m[1])) out.push([m[1], m[2].trim(), m[3] ?? ""]);
  }
  return out;
}

const primitives = read("primitives.css");
const semantics = read("semantics.css");
const motion = read("motion.css");
const version = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")).version;

const NAV = (here) =>
  [
    ["FIGMA-VARIANTS-haus.html", "Variants"],
    ["FIGMA-DOCS-tokens.html", "Page 1 · Tokens"],
    ["FIGMA-DOCS-motion.html", "Page 2 · Motion"],
    ["FIGMA-DOCS-getting-started.html", "Page 3 · Getting started"],
  ]
    .map(([href, label]) =>
      href === here
        ? `<span class="nav-here">${label}</span>`
        : `<a href="${href}">${label}</a>`,
    )
    .join("");

const shell = (here, title, intro, body) => `<!doctype html>
<meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Fira+Code:wght@400&display=swap">
<style>
${read("layers.css")}
${primitives}
${read("brand.css")}
${motion}
${semantics}
body { margin:0; padding:0 2.5rem 6rem; background:var(--haus-color-surface-subtle);
       font-family:var(--haus-font-sans); color:var(--haus-color-ink-primary); }
nav { position:sticky; top:0; display:flex; gap:.25rem; padding:.75rem 0; margin-bottom:2rem;
      background:var(--haus-color-surface-subtle); border-bottom:1px solid var(--haus-color-border-subtle); z-index:10; }
nav a, .nav-here { font-size:.8125rem; padding:.375rem .75rem; border-radius:var(--haus-radius-control); text-decoration:none; }
nav a { color:var(--haus-color-ink-secondary); }
nav a:hover { background:var(--haus-color-surface-default); color:var(--haus-color-ink-primary); }
.nav-here { background:var(--haus-color-primary-default); color:var(--haus-color-ink-on-primary); font-weight:500; }
h1 { font-size:2rem; line-height:1.15; margin:0 0 .75rem; }
h2 { font-size:1.25rem; margin:2.5rem 0 .5rem; }
h3 { font-size:.9375rem; margin:1.5rem 0 .5rem; }
p { max-width:46rem; line-height:1.6; color:var(--haus-color-ink-secondary); margin:0 0 .75rem; }
.lede { max-width:46rem; }
table { border-collapse:collapse; margin:.5rem 0 1rem; background:var(--haus-color-surface-default);
        border:1px solid var(--haus-color-border-subtle); border-radius:var(--haus-radius-surface); overflow:hidden; }
th, td { text-align:left; padding:.5rem .75rem; border-bottom:1px solid var(--haus-color-border-subtle);
         font-size:.8125rem; vertical-align:top; }
th { background:var(--haus-color-surface-subtle); font-weight:600; }
tr:last-child td { border-bottom:0; }
code, .mono { font-family:var(--haus-font-mono); font-size:.75rem; }
.frame { background:var(--haus-color-surface-default); border:1px solid var(--haus-color-border-subtle);
         border-radius:var(--haus-radius-surface); padding:1.25rem 1.5rem; margin:1rem 0; max-width:52rem; }
.frame h3 { margin-top:0; }
.callout { border-inline-start:3px solid var(--haus-color-primary-default); padding-inline-start:1rem;
           margin:1rem 0; max-width:46rem; }
.swatch { display:inline-block; width:1.25rem; height:1.25rem; border-radius:4px; vertical-align:-.25rem;
          border:1px solid var(--haus-color-border-default); margin-inline-end:.5rem; }
.bar { height:.5rem; background:var(--haus-color-primary-default); border-radius:99px; display:inline-block; vertical-align:middle; }
</style>
<nav>${NAV(here)}</nav>
<h1>${esc(title)}</h1>
<div class="lede">${intro}</div>
${body}
`;

/* ═══ Page 1 · Tokens ═══════════════════════════════════════════════════════ */

const colourRoles = declarations(semantics, /^--haus-color-/);
const spaceRoles = declarations(semantics, /^--haus-space-(inset|gap|stack)-/);
const radiusRoles = declarations(semantics, /^--haus-radius-(control|surface|overlay|marker|pill)$/);
const elevationRoles = declarations(semantics, /^--haus-elevation-/);
const zRoles = declarations(semantics, /^--haus-z-[a-z]/);
const typeRoles = [
  ...new Set(
    [...semantics.matchAll(/^\s*(--haus-type-[a-z-]+?)-(size|weight|leading|tracking)\s*:/gm)].map(
      (m) => m[1],
    ),
  ),
];

const roleTable = (rows) =>
  `<table><tr><th>Variable</th><th>Resolves to</th><th>Use</th></tr>${rows
    .map(
      ([n, v, c]) =>
        `<tr><td class="mono">${esc(n.replace("--haus-", ""))}</td><td class="mono">${esc(v)}</td><td>${esc(c)}</td></tr>`,
    )
    .join("")}</table>`;

const tokensPage = shell(
  "FIGMA-DOCS-tokens.html",
  "Page 1 · Tokens",
  `<p>What this page is for: a designer opening the library should be able to answer
   <em>which variable do I reach for</em> without reading any CSS. That is the only question
   this page exists to answer, so it is organised by the decision being made rather than by
   the shape of the token file.</p>
   <p>Build it as <strong>one Figma page named <code>Tokens</code></strong> with the frames below,
   in this order. Values are read from <code>haus-tokens@${esc(version)}</code>.</p>`,
  `
<div class="frame">
  <h3>Frame 1 · The four layers, and why a designer only ever picks from one</h3>
  <p>Draw this as four stacked bands with an arrow up the side. The sentence under it is the
     whole point of the file:</p>
  <table>
    <tr><th>Layer</th><th>Holds</th><th>In Figma</th></tr>
    <tr><td><b>Primitives</b></td><td>Raw values. ${primitives.match(/--haus-/g).length} of them, no meaning attached</td><td><code>haus/primitives</code>, <b>hidden from publishing</b></td></tr>
    <tr><td><b>Brand</b></td><td>Which primitive each role takes. The one file a consumer replaces</td><td>The <code>haus</code> and <code>vault</code> modes on <code>haus/semantics</code></td></tr>
    <tr><td><b>Semantics</b></td><td>What the roles mean. Named for the decision, never the value</td><td><code>haus/semantics</code>, <b>the collection designers use</b></td></tr>
    <tr><td><b>Components</b></td><td>What each component does with the roles</td><td>The component sets themselves</td></tr>
  </table>
  <div class="callout"><p><b>The rule to write on the frame:</b> if you are picking a colour and you can
  see a number in its name, you are one layer too low. Primitives are hidden for that reason,
  not to keep them secret.</p></div>
</div>

<div class="frame">
  <h3>Frame 2 · Colour roles</h3>
  <p>${colourRoles.length} roles. Every surface has a paired <code>on-*</code> ink, and every
     interactive scale has a disabled state. Those two rules are worth stating on the frame,
     because they are what makes the set predictable rather than long.</p>
  ${roleTable(colourRoles.slice(0, 40))}
  <p class="mono">…and ${Math.max(0, colourRoles.length - 40)} more, all in the collection.</p>
</div>

<div class="frame">
  <h3>Frame 2b · What an <code>on-*</code> role is, and what may take it</h3>
  <p><b>The rule:</b> an <code>on-*</code> role is <em>the ink for that surface</em>, and a mark
     sitting on the same surface takes the same ink. A dot, an icon, a small glyph. Not just text.</p>
  <table>
    <tr><th>Component</th><th>Non-text mark</th><th>Takes</th></tr>
    <tr><td>Badge</td><td>the dot</td><td><code>currentColor</code>, which is the label's ink</td></tr>
    <tr><td>Callout</td><td>the icon</td><td><code>color-&lt;tone&gt;-on-subtle</code></td></tr>
    <tr><td>Toast</td><td>the icon</td><td><code>color-&lt;tone&gt;-on-subtle</code>, and <code>ink-secondary</code> when neutral</td></tr>
  </table>
  <div class="callout"><p><b>haus tried the alternative and deleted it.</b> Each status ramp carried a
  <code>400</code> step documented "Icon on subtle background", exactly the dedicated icon colour this
  rule seems to want. Measured against its own <code>100</code>: cherry 2.20:1, mango 2.01:1,
  greengage 1.95:1, elderberry 2.20:1. WCAG 1.4.11 wants <b>3:1</b> for non-text UI and every one
  failed, while the component that had the use case was already reaching past it for the
  <code>on-subtle</code> ink at 6.31:1 to 8.01:1. The component was right and the token was wrong.
  Deleted in <code>haus#35</code>.</p></div>
  <p><b>Why it is safe rather than sloppy:</b> an <code>on-*</code> role is built to clear 4.5:1
     because it carries text. A mark needs 3:1. Painting a dot with the ink over-delivers, and it
     guarantees the dot cannot drift from the label beside it.</p>
  <p><b>In Figma:</b> there is no <code>currentColor</code>, so bind the mark's fill to the same
     variable as the text layer's fill. That is the faithful translation, not a workaround. The
     <code>ink/*</code> and <code>*/on-*</code> roles are scoped to text, shape and frame fills so
     both layers can reach them; surfaces stay fills and borders stay strokes.</p>
</div>

<div class="frame">
  <h3>Frame 3 · Type roles</h3>
  <p>${typeRoles.length} roles, each bundling size, weight, leading and tracking. <b>These are the
     eleven text styles you already have</b>, so this frame is a specimen: one line of real text per
     role, labelled with the style name.</p>
  <p class="mono">${typeRoles.map((t) => esc(t.replace("--haus-type-", ""))).join(" · ")}</p>
  <div class="callout"><p><b>The rule:</b> a role carries the properties the thing actually chooses.
  Prose chooses all four, which is why the typeset roles bundle. Emphasis chooses weight alone,
  so <code>weight-emphasis</code> carries nothing else. A role that carries more than the decision
  forces call sites to override it.</p></div>
</div>

<div class="frame">
  <h3>Frame 4 · Space, radius, elevation, stacking</h3>
  <p>Three space families of twelve steps each, named for what they do rather than how big they are.</p>
  <table><tr><th>Family</th><th>Steps</th><th>Answers</th></tr>
    <tr><td class="mono">space-inset-*</td><td>12</td><td>padding inside a thing</td></tr>
    <tr><td class="mono">space-gap-*</td><td>12</td><td>the gap between siblings</td></tr>
    <tr><td class="mono">space-stack-*</td><td>12</td><td>the rhythm down a column</td></tr>
  </table>
  <h3>Radius</h3>${roleTable(radiusRoles)}
  <h3>Elevation</h3>
  <p>Three roles, and they are the three effect styles named <code>elevation/*</code>. Named for how
     high the thing sits, never how large its shadow is.</p>
  ${roleTable(elevationRoles)}
  <h3>Stacking</h3>
  <p>Eight named heights over a raw ladder. Figma has no z-index, so this frame is a diagram:
     a side elevation with the eight names stacked in order. It is worth drawing because two
     products previously decided their own stacking order and reconciled it never.</p>
  ${roleTable(zRoles)}
</div>

<div class="frame">
  <h3>Frame 5 · The brand swap</h3>
  <p>The frame that proves the architecture rather than describing it. Two identical component
     rows, side by side, one under each mode of <code>haus/semantics</code>.</p>
  <table><tr><th>Mode</th><th>Primary</th><th>What it is</th></tr>
    <tr><td class="mono">haus</td><td><span class="swatch" style="background:var(--haus-aronia-500)"></span>aronia-500</td><td>the default brand</td></tr>
    <tr><td class="mono">vault</td><td><span class="swatch" style="background:var(--haus-ruby-500,#aa1155)"></span>ruby-500</td><td>a shipped product's palette, not an invention</td></tr>
  </table>
  <div class="callout"><p><b>Write this on the frame:</b> six rows differ out of fifty-four. The brand
  answers <em>whose</em>, the ramp answers <em>which colour</em>. vault ships six gemstone ramps, so the
  mode is called <code>vault</code> and the ramp stays <code>ruby</code>.</p></div>
</div>
`,
);

/* ═══ Page 2 · Motion ═══════════════════════════════════════════════════════ */

const durations = declarations(motion, /^--haus-duration-/);
const eases = declarations(motion, /^--haus-ease-/);
const pairs = declarations(motion, /^--haus-motion-/);

const motionPage = shell(
  "FIGMA-DOCS-motion.html",
  "Page 2 · Motion",
  `<p><strong>This is the page that has to exist.</strong> Figma cannot bind a duration or an easing
   curve to a variable, so unlike every other token in the system these have no home in the file
   except a page that writes them down. Leave it out and motion is the one layer a designer
   cannot look up.</p>
   <p>Build it as <strong>one Figma page named <code>Motion</code></strong>. Values from
   <code>haus-tokens@${esc(version)}</code>.</p>`,
  `
<div class="frame">
  <h3>Frame 1 · Durations</h3>
  <p>Draw each as a labelled bar whose width is proportional to the number, so the scale is
     legible at a glance rather than read as five similar figures.</p>
  <table><tr><th>Token</th><th>Value</th><th>Bar</th><th>Use</th></tr>
  ${durations
    .map(
      ([n, v, c]) =>
        `<tr><td class="mono">${esc(n.replace("--haus-", ""))}</td><td class="mono">${esc(v)}</td>` +
        `<td><span class="bar" style="width:${Math.max(4, parseInt(v) / 2)}px"></span></td><td>${esc(c)}</td></tr>`,
    )
    .join("")}
  </table>
  <div class="callout"><p><b>Write this on the frame:</b> <code>duration-reduced</code> is <code>0ms</code>
  and it is not a value anyone picks. Components read it under
  <code>@media (prefers-reduced-motion: reduce)</code>, which is how the whole system answers that
  setting in one place instead of ninety.</p></div>
</div>

<div class="frame">
  <h3>Frame 2 · Easing curves</h3>
  <p>Draw each curve as a small graph, 120&times;120, with the control points marked. A cubic-bezier
     written as four numbers is unreadable; drawn, the difference between enter and exit is obvious.</p>
  <table><tr><th>Token</th><th>Curve</th><th>Use</th></tr>
  ${eases
    .map(
      ([n, v, c]) =>
        `<tr><td class="mono">${esc(n.replace("--haus-", ""))}</td><td class="mono">${esc(v)}</td><td>${esc(c)}</td></tr>`,
    )
    .join("")}
  </table>
</div>

<div class="frame">
  <h3>Frame 3 · The pairs a component actually reads</h3>
  <p>A component never picks a duration and an easing separately. It reads one of these, which is
     why they exist: the pairing is the decision, and leaving it to the call site is how two
     things that should move together stop doing so.</p>
  <table><tr><th>Token</th><th>Resolves to</th><th>Use</th></tr>
  ${pairs
    .map(
      ([n, v, c]) =>
        `<tr><td class="mono">${esc(n.replace("--haus-", ""))}</td><td class="mono">${esc(v.replace(/var\(--haus-/g, "").replace(/\)/g, ""))}</td><td>${esc(c)}</td></tr>`,
    )
    .join("")}
  </table>
  <div class="callout"><p><b>The one to put in Figma's own prototype settings:</b>
  <code>motion-interactive</code> for hover and focus, <code>motion-micro</code> for a checkbox or a
  toggle. If a prototype transition has to pick a number, pick from this table so the file and the
  code agree.</p></div>
</div>
`,
);

/* ═══ Page 3 · Getting started ══════════════════════════════════════════════ */

const startedPage = shell(
  "FIGMA-DOCS-getting-started.html",
  "Page 3 · Getting started",
  `<p>The page a designer lands on first, and the one a hiring reviewer reads in ninety seconds.
   Its job is to make the file navigable and to state the two or three rules that make the
   component sets predictable.</p>
   <p>Build it as <strong>the first Figma page, named <code>Getting started</code></strong>, and set
   it as the file's thumbnail.</p>`,
  `
<div class="frame">
  <h3>Frame 1 · What this file is</h3>
  <p>Three sentences, no more. Something close to:</p>
  <div class="callout"><p>haus is a design system of ${18} components on a four-layer token
  architecture, published to npm as five packages and consumed by three products. This file is the
  design half. The code is at <code>github.com/hipuku/haus</code> and the component API is the same
  in both.</p></div>
  <p>Then the version, so the file dates itself:
     <code class="mono">haus-components ${esc(version)}</code>.</p>
</div>

<div class="frame">
  <h3>Frame 2 · The vocabulary</h3>
  <p><b>The single most useful frame in the file.</b> Three words do most of the work across every
     component, and a designer who learns them can predict the next component's properties without
     opening it.</p>
  <table>
    <tr><th>Property</th><th>Values</th><th>Means</th></tr>
    <tr><td class="mono">tone</td><td class="mono">neutral · info · success · warning · error</td>
        <td>What a thing <b>means</b>. Never how heavy it looks</td></tr>
    <tr><td class="mono">appearance</td><td class="mono">subtle · solid</td>
        <td>How solidly the tone is expressed. Fill, not meaning</td></tr>
    <tr><td class="mono">size</td><td class="mono">sm · md · lg</td>
        <td>The size scale. Avatar extends it with xs and xl</td></tr>
  </table>
  <div class="callout"><p><b>Write the history on the frame, because it is the argument:</b> before this,
  <code>variant</code> meant three different things. Visual weight on Button, elevation on Card,
  semantics on Badge, and Button said <code>danger</code> where Badge said <code>error</code>. One word
  for three concepts, and two words for one.</p></div>
  <p><b>And the rule that keeps it honest:</b> a component narrows the union to the values it has a
     design for and says so. Toggle takes <code>sm</code> and <code>md</code> only. Narrowing is
     honest; inventing a colour to satisfy a type is not.</p>
</div>

<div class="frame">
  <h3>Frame 3 · How to use the library</h3>
  <table>
    <tr><th>Do</th><th>Not</th></tr>
    <tr><td>Bind a fill to a variable from <code>haus/semantics</code></td><td>Match a hex by eye</td></tr>
    <tr><td>Pick a role: <code>surface/default</code>, <code>ink/secondary</code></td><td>Pick a primitive: <code>damson/100</code></td></tr>
    <tr><td>Apply a text style</td><td>Set size and weight by hand</td></tr>
    <tr><td>Apply <code>elevation/*</code></td><td>Draw a shadow</td></tr>
    <tr><td>Detach only to propose a change</td><td>Detach to get past a missing variant</td></tr>
  </table>
  <p>The last row is the one worth a sentence: a missing variant is a gap in the system, and the
     useful response is to file it rather than to work around it locally. That is how the six newest
     components arrived, each measured across three products before it was promoted.</p>
</div>

<div class="frame">
  <h3>Frame 4 · What is in the file, and what is not</h3>
  <table>
    <tr><th>Page</th><th>Holds</th></tr>
    <tr><td>Getting started</td><td>this</td></tr>
    <tr><td>Tokens</td><td>the four layers, the roles, the brand swap</td></tr>
    <tr><td>Motion</td><td>durations and curves, written out because Figma cannot bind them</td></tr>
    <tr><td>Components</td><td>18 component sets</td></tr>
  </table>
  <p><b>Not in this file, deliberately:</b> dark mode, a second product's screens, and anything that
     exists only here and not in the package. A Figma file that promises something the code does not
     ship is the drift this whole system was built to detect.</p>
</div>
`,
);

/* ═══ write ════════════════════════════════════════════════════════════════ */

const outdir = process.argv[2] ?? join(ROOT, "..");
const pages = [
  ["FIGMA-DOCS-tokens.html", tokensPage],
  ["FIGMA-DOCS-motion.html", motionPage],
  ["FIGMA-DOCS-getting-started.html", startedPage],
];
for (const [name, html] of pages) {
  writeFileSync(join(outdir, name), html);
  console.log(`wrote ${name}`);
}
