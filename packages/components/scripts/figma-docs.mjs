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
     both layers can reach them.</p>
</div>

<div class="frame">
  <h3>Frame 2c &middot; Scopes, and why a role appears in one picker and not another</h3>
  <p>A Figma scope decides which fields offer a variable. It reads like a hint and behaves like a
     wall: <b>a role scoped to fills is absent from the stroke picker</b>, so the failure looks like
     the variable not existing rather than like a setting on it.</p>
  <div class="callout"><p><b>This was assigned from the name twice and was wrong twice.</b> The
  second rule was <i>surfaces stay fills and borders stay strokes</i>, which sounds obviously true.
  Every part of it fails against the components:</p>
  <table>
    <tr><th>Role</th><th>The name says</th><th>The components do</th></tr>
    <tr><td class="mono">border/default</td><td>stroke</td><td><b>fill.</b> Divider and Toggle draw a hairline as a filled rect, not as a stroke on something else</td></tr>
    <tr><td class="mono">primary/default</td><td>fill</td><td><b>stroke.</b> Checkbox and Radio draw the checked box's edge in the brand colour</td></tr>
    <tr><td class="mono">error/default</td><td>fill</td><td><b>stroke</b>, at five components: the invalid ring on Input, Textarea, Select, Checkbox and Radio</td></tr>
    <tr><td class="mono">*/border</td><td>fill, because these four are not under <code>border/</code> at all</td><td><b>stroke.</b> Toast, Callout and Button every one of them</td></tr>
    <tr><td class="mono">surface/default</td><td>fill</td><td><b>stroke.</b> Avatar rings itself in the page colour so a stack reads as separate</td></tr>
  </table>
  <p>So the rule is gone. <code>figma/role-usage.py</code> walks the stylesheets of haus and its
  three consumers, records which CSS property every <code>var(--haus-color-*)</code> lands on,
  resolves the component-local indirection that Button and Toast theme themselves through, and the
  property decides the scope, <b>because the property is the field</b>. Measured: <b>30 of the 55
  colour roles gained a scope they were missing, and none lost one.</b> The old rule was not
  approximately right, it was uniformly too narrow.</p></div>
  <p><b>What this means when you are building.</b> Every role is now offered wherever its own
     components use it. Two consequences worth knowing:</p>
  <ul>
    <li><b>A solid button needs no stroke in Figma.</b> The CSS sets
        <code>border-color</code> to the same colour as the background, but that border is a
        <em>sizing</em> device: it keeps solid, outline and ghost the same height. Auto layout
        already does that. Adding a same-colour stroke is a faithful copy of the code and the wrong
        drawing.</li>
    <li><b>An outline button's stroke is a real role</b>, and it is not the fill. Neutral takes
        <code>semantic/border/default</code>; the four status tones take
        <code>semantic/&lt;tone&gt;/border</code>,
        which is a step lighter than <code>&lt;tone&gt;/default</code> and is what the code uses.</li>
  </ul>
  <div class="callout"><p><b>One name in the generator was stale, and the file was already right.</b>
  <code>haus-variables.json</code>, the export this pipeline reads, still carries
  <code>semantic/ink/on-aronia</code>, a name haus renamed to
  <code>semantic/ink/on-primary</code> in <code>haus#24</code> on the rule that a role may not carry
  a palette name. The generator was copying it forward. The Figma file itself has the correct name,
  proven by the plugin's scope pass finding all 207 names without a miss, so the rename pass it
  carries is a guard with nothing to guard against. Kept anyway, because the next stale name in that
  export will not announce itself either.</p></div>
</div>

<div class="frame">
  <h3>Frame 2d &middot; Two numbers that are not the number CSS writes</h3>
  <p>Figma's numeric fields carry units that CSS's do not, and a value copied across rather than
     translated is silently wrong in both of these.</p>
  <table>
    <tr><th>Field</th><th>CSS</th><th>Figma</th><th>What a straight copy does</th></tr>
    <tr><td>Opacity</td><td class="mono">0.4</td><td class="mono">40</td><td>sets the layer to <b>0.4%</b> and it disappears</td></tr>
    <tr><td>Line height</td><td class="mono">1.4</td><td class="mono">140%</td><td>sets <b>1.4px</b> and collapses the paragraph to a line</td></tr>
  </table>
  <p>Opacity has an exact translation, so <code>opacity/disabled</code> and
     <code>opacity/overlay</code> stay variables and hold <b>40</b> and <b>60</b>. Their
     <code>codeSyntax</code> still reads <code>0.4</code>, because that is what the code says.</p>
  <p>Line height has none: Figma has no unitless multiplier and has declined percentage support for
     variables bound to that field since 2024. So the seven <code>line-height/*</code> variables
     were deleted rather than shipped wrong, and line height lives in the eleven text styles as a
     percentage. Same reasoning as <code>haus#35</code> deleting the <code>400</code> step: a token
     whose only available use is wrong is a trap, not headroom.</p>
</div>

<div class="frame">
  <h3>Frame 3 · Type roles</h3>
  <p>${typeRoles.length} roles, each bundling size, weight, leading and tracking, and there is
     <b>one text style per role</b>. This frame is a specimen: one line of real text per role,
     labelled with the style name.</p>
  <div class="callout"><p><b>There were eleven styles for twelve roles, and the missing one is the
  one every form label reads.</b> This paragraph used to say "12 roles" and "these are the eleven
  text styles you already have" in consecutive sentences, and <code>STYLES.md</code> listed eleven.
  The absentee is <code>type/field-label</code>. Input, Radio, Select and Textarea all read
  <code>--haus-type-field-label-*</code>, so building any of them meant reaching for the nearest
  style, and the nearest is <code>label-sm</code>: <b>identical at 12px, 140% and 0.24px, and wrong
  by one step of weight</b>, 500 against 600. Create it. That is the least visible kind of
  disagreement and the most durable, because nothing looks broken.</p></div>
  <p class="mono">${typeRoles.map((t) => esc(t.replace("--haus-type-", ""))).join(" · ")}</p>
  <div class="callout"><p><b>Line height is a percentage in Figma, and has no variable.</b>
  CSS writes it unitless, <code>1.4</code>, meaning 1.4&times; the font size. Figma has no unitless
  multiplier: typing <code>1.4</code> sets 1.4&nbsp;<em>pixels</em>, and binding a number variable to
  that field does the same, because a number bound to line height is read as pixels. So
  <code>1.4</code> is <b>140%</b>, and it lives in the text style rather than in a variable. The
  seven <code>line-height/*</code> variables were removed for that reason: nothing aliased them and
  the only way to reach one was to bind it and get collapsed text with no warning.</p></div>
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
    <tr><td>Pick a role: <code>semantic/surface/default</code>, <code>semantic/ink/secondary</code></td><td>Pick a primitive: <code>color/damson/100</code></td></tr>
    <tr><td>Apply a text style</td><td>Set size and weight by hand</td></tr>
    <tr><td>Apply <code>elevation/*</code></td><td>Draw a shadow</td></tr>
    <tr><td>Detach only to propose a change</td><td>Detach to get past a missing variant</td></tr>
  </table>
  <p>The last row is the one worth a sentence: a missing variant is a gap in the system, and the
     useful response is to file it rather than to work around it locally. That is how the six newest
     components arrived, each measured across three products before it was promoted.</p>
</div>

<div class="frame">
  <h3>Frame 3b &middot; One component end to end, with the names spelled exactly</h3>
  <p>Button, because it has the most variants and every trap in the file. <b>Every name below is the
     name Figma shows.</b> The path matters: a role is <code>semantic/primary/default</code>, three
     segments, inside the collection <code>haus/semantics</code>. Writing it
     <code>color/primary-default</code> finds nothing.</p>

  <h4>Base, shared by all 18 variants</h4>
  <table>
    <tr><th>Property</th><th>Bind to</th><th>Resolves to</th></tr>
    <tr><td>Corner radius</td><td class="mono">semantic/radius/control</td><td><b>8px</b></td></tr>
    <tr><td>Gap, icon to label</td><td class="mono">semantic/space/gap-xs</td><td><b>8px</b></td></tr>
    <tr><td>Font family</td><td class="mono">font-family/sans</td><td>Manrope</td></tr>
    <tr><td>Letter spacing</td><td class="mono">tracking/normal</td><td><b>0</b></td></tr>
    <tr><td>Stroke width, where there is a stroke</td><td class="mono">border-width/default</td><td><b>1px</b></td></tr>
    <tr><td>Disabled opacity</td><td class="mono">opacity/disabled</td><td><b>40</b></td></tr>
    <tr><td>Font weight</td><td><b>no variable.</b> Set <b>500</b></td><td>see below</td></tr>
  </table>
  <p>The last four are in <code>haus/primitives</code>, which is hidden from publishing but bindable
     in this file. They are primitives because haus has no semantic role for a font family, a
     tracking step or a stroke width, and inventing one to make the layer tidy is the thing the
     token rules forbid.</p>

  <h4>Size</h4>
  <table>
    <tr><th></th><th>Text style</th><th>Padding, v &middot; h</th><th>Min height</th></tr>
    <tr><td><b>sm</b></td><td class="mono">label-sm</td><td class="mono">semantic/space/inset-2xs &middot; semantic/space/inset-sm</td><td><b>28px</b></td></tr>
    <tr><td><b>md</b></td><td class="mono">label</td><td class="mono">semantic/space/inset-xs &middot; semantic/space/inset-md</td><td><b>36px</b></td></tr>
    <tr><td><b>lg</b></td><td class="mono">body</td><td class="mono">semantic/space/inset-sm &middot; semantic/space/inset-lg</td><td><b>44px</b></td></tr>
  </table>

  <div class="callout"><p><b>Two of the three text styles need an override, and this is the one
  thing on this page that cannot be read off a variable name.</b> Button sets weight and tracking on
  itself, not per size, so it overrides whatever the text style carries:</p>
  <table>
    <tr><th>Size</th><th>Style gives</th><th>Button needs</th><th></th></tr>
    <tr><td><b>sm</b></td><td>tracking <code>wide</code>, 0.02em</td><td>tracking <b>0</b></td><td>override</td></tr>
    <tr><td><b>md</b></td><td>13px, weight 500, tracking 0</td><td>the same</td><td><b>exact match</b></td></tr>
    <tr><td><b>lg</b></td><td>weight <code>regular</code>, 400</td><td>weight <b>500</b></td><td>override</td></tr>
  </table>
  <p>So <code>md</code> takes its style clean, and <code>sm</code> and <code>lg</code> take the style
  and then change one field. A Figma build that applies all three styles untouched is wrong at two
  sizes out of three, in a way nothing in the file will report.</p></div>

  <div class="callout"><p><b>Min height has no variable.</b> haus declares
  <code>--haus-control-height-{sm,md,lg}</code> at 28, 36 and 44px and none of the three is in the
  Figma file, so the number is typed by hand and drifts silently. 44px is the WCAG 2.5.8 AAA target
  size and Apple's HIG minimum, which makes it the worst of the three to lose. Filed.</p></div>

  <h4>Variant, at Tone = neutral</h4>
  <table>
    <tr><th>Variant</th><th>Fill</th><th>Stroke</th><th>Label</th></tr>
    <tr><td><b>primary</b></td><td class="mono">semantic/primary/default</td><td><b>none</b></td><td class="mono">semantic/ink/on-primary</td></tr>
    <tr><td><b>secondary</b></td><td class="mono">semantic/surface/subtle</td><td class="mono">semantic/border/default</td><td class="mono">semantic/ink/primary</td></tr>
    <tr><td><b>ghost</b></td><td>none</td><td>none</td><td class="mono">semantic/ink/primary</td></tr>
    <tr><td><b>text</b></td><td>none</td><td>none</td><td>inherits; underlined</td></tr>
  </table>
  <div class="callout"><p><b><code>primary</code> takes no stroke, and that is a correction.</b> The
  CSS does set <code>border-color</code> on it, to the same colour as the background. That border is
  not an edge, it is a <em>sizing</em> device: it keeps primary, secondary and ghost the same height
  when only one of them has a visible outline. Auto layout already does that, so copying the
  declaration faithfully gives you a same-colour stroke that changes the drawing and buys nothing.
  <b>Read what a declaration is for, not only what it says.</b></p></div>
  <p>The four status tones change only the three colours, never the geometry. Their stroke is
     <code>semantic/&lt;tone&gt;/border</code>, a step lighter than
     <code>semantic/&lt;tone&gt;/default</code>, which is the fill.</p>
</div>

<div class="frame">
  <h3>Frame 3c &middot; Where the code and the file disagree, and what to do about each</h3>
  <p><code>figma/reconcile.py</code> reads all 18 component stylesheets, resolves the
     component-local indirection they theme themselves through, and asks one question per token:
     <b>what does a designer bind for this?</b> 131 distinct tokens. 90 are a variable, 24 are a
     style, 6 are motion and have no Figma object of any type, and <b>11 have nothing</b>.</p>

  <h4>Nothing to bind, 11</h4>
  <table>
    <tr><th>Tokens</th><th>Read by</th><th>What to do</th></tr>
    <tr><td class="mono">type/field-label &times;4</td><td>Input, Radio, Select, Textarea</td><td><b>Create the text style.</b> 12px, SemiBold 600, 140%, 0.24px. See Frame 3 on the tokens page</td></tr>
    <tr><td class="mono">control-height-{sm,md,lg}</td><td>Button, Input, Select</td><td>No variable. Type 28 / 36 / 44. <code>haus#38</code></td></tr>
    <tr><td class="mono">weight-emphasis, weight-strong</td><td>Button, Avatar</td><td>No variable. They resolve to <code>font-weight/medium</code> (500) and <code>font-weight/semibold</code> (600); bind those</td></tr>
    <tr><td class="mono">avatar-bg, avatar-fg</td><td>Avatar</td><td>Set from code per initials. The default is <code>semantic/primary/subtle</code> and <code>semantic/primary/on-subtle</code>; bind those</td></tr>
  </table>
  <p>Only the first is a build error waiting to happen. The other three are documented values a
     designer can reach, once someone says which.</p>

  <h4>Bindable, but under a different name, 16</h4>
  <p>These resolve. A designer reading the code and searching the picker for the name they just read
     does not find them, which is the same cost as missing with extra steps.</p>
  <table>
    <tr><th>The code says</th><th>Figma says</th></tr>
    <tr><td class="mono">--haus-font-sans</td><td class="mono">font-family/sans</td></tr>
    <tr><td class="mono">--haus-icon-sm</td><td class="mono">icon-size/sm</td></tr>
    <tr><td class="mono">--haus-space-4</td><td class="mono">spacing/4</td></tr>
    <tr><td class="mono">--haus-z-modal</td><td class="mono">z-index/modal</td></tr>
  </table>
  <p>The last one is not only a name. <code>haus#27</code> moved the eight stacking <em>roles</em>
     into <code>semantics.css</code> and left a raw ladder behind in the primitives, and the Figma
     file predates that: it still holds the role names in <code>haus/primitives</code>. So
     <code>z-index/modal</code> is in the collection a consumer is not supposed to pick from. The
     second collection pass fixes it.</p>

  <div class="callout"><p><b>Twelve components size things with the spacing scale, because there is
  no size scale.</b> Checkbox and Radio are <code>--haus-space-4</code> square, Avatar's five sizes
  are <code>space-6</code> through <code>space-16</code>, Toggle's track is
  <code>space-7</code> by <code>space-4</code>. The semantic space families are inset, gap and
  stack, all of which are about the room <em>around</em> something, so a component sizing itself has
  to drop to the raw scale. It resolves and it is consistent, and it is the same shape of gap as the
  control heights: a real decision with no role to carry it.</p></div>

  <h4>In the file, read by nothing</h4>
  <p>Five text styles (<code>body-lg</code>, <code>heading</code>, <code>heading-lg</code>,
     <code>display</code>, <code>mono</code>), the <code>shadow/md</code> effect style, and 26
     semantic variables, of which 23 are the upper reaches of the three space ladders. <b>None of
     this is a defect.</b> A design system ships a vocabulary wider than its own components use, and
     a heading style with no component reading it is what a product page is built from. It is listed
     so the difference between "unused" and "missing" stays visible, because the two look identical
     in a picker.</p>
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
