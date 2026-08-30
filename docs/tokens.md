# haus tokens

`haus-tokens` is the source of truth for every visual value in haus: colour,
type, space, radius, elevation, and motion. It ships as plain CSS custom
properties (the runtime format) and a W3C Design Tokens JSON file (the handoff
format for tooling). haus is **light-mode only**: there is no dark theme and no
`light-dark()` layer.

## The three layers

Tokens are split into three files, wired to three CSS cascade layers so their
precedence is explicit and order-independent:

```
@layer haus.primitives   →   primitives.css   Raw values. No meaning.
@layer haus.semantics    →   semantics.css    Role aliases. No raw values.
@layer haus.motion       →   motion.css       Durations, easings, motion pairs.
```

### 1. Primitives (`primitives.css`)

Raw values only: palette steps, a numeric type scale, the spacing ramp, radii,
shadows, z-index, border widths, opacity, and icon sizes. Primitives carry **no
semantic meaning**: `--aronia-500` is "this exact plum", not "the primary
colour". Nothing outside this file defines raw values. Components read roles
from the semantic layer instead, with one documented exception: sizes, covered
below.

The colour primitives are six OKLCH palettes:

| Palette | Hue | Role at the semantic layer |
|---|---|---|
| **Aronia** (dusty purple) | 300° | brand / primary |
| **Damson** (cool near-grey) | 290° | surfaces, ink, borders |
| **Elderberry** (indigo) | 265° | info |
| **Greengage** (green) | 148° | success |
| **Mango** (golden) | 65° | warning |
| **Cherry** (warm red) | 27° | error |

Aronia is a full 100–950 ramp; Damson runs 0–950 (0 = white). The feedback hues
(elderberry, greengage, mango, cherry) ship a targeted subset of steps,
100/200/400/500/700/900, the steps the semantic layer actually consumes rather than a
complete ramp for its own sake.

### 2. Semantics (`semantics.css`)

Role aliases that point at primitives. This is the layer components consume,
for colour, type, spacing, radius, elevation and motion alike. Colours are named
for what they *do*, never for their palette:
`--color-primary-default` aliases `--aronia-500`; the word "aronia" never appears
here. The file declares `color-scheme: light`.

Semantic groups:

- **Surface**: `--color-surface-default | subtle | raised | overlay | sunken |
  inverse | disabled`. Elevation is expressed with shadow, not surface colour
  (`raised` is the same value as `default`).
- **Ink (text)**: `--color-ink-primary | secondary | tertiary | disabled |
  inverse | link | on-aronia`.
- **Border**: `--color-border-subtle | default | strong | focus | disabled`.
- **Primary (aronia)**: `default | hover | pressed | subtle | on-subtle |
  disabled`.
- **Feedback**: info (elderberry), success (greengage), warning (mango), error
  (cherry). Each provides `subtle | border | default | on-subtle | on-default |
  emphasis`; success and warning additionally provide a `solid` step.
- **Backdrop and inverse interactions**: computed with CSS relative colour
  syntax, e.g. `oklch(from var(--damson-950) l c h / var(--opacity-overlay))`.
  These reference a primitive and apply an opacity token, so they are computation,
  not raw values.
- **Focus ring**: `--shadow-focus` (a two-ring shadow: surface-coloured gap,
  then focus-coloured ring).
- **Typography roles**: see below.
- **Spacing**: three roles over one ladder. `--space-inset-*` is padding, the
  space inside a component between its edge and its content; `--space-gap-*` is
  space between siblings, set by the parent; `--space-stack-*` is margin, space
  a component asks for around itself. A given step is the same size whichever
  role reads it, so the roles stay comparable, and splitting them is what lets
  padding be retuned later without moving page rhythm. Only the steps components
  use are named: inset runs `2xs` to `2xl`, gap `2xs` to `md`, stack `2xs` and
  `xs`.
- **Radius**: `--radius-control` (Button, Input, Select, Textarea),
  `--radius-surface` (Card, Toast), `--radius-overlay` (Modal),
  `--radius-marker` (Checkbox, and Modal and Toast icons), `--radius-pill`
  (Badge, Toggle track). Named for
  what is rounded, so a component asks for the shape of the thing.
- **Elevation**: `--elevation-raised`, `--elevation-floating`,
  `--elevation-overlay`. Named for how high the thing sits.
- **Motion**: `--motion-duration-emphasis` for a deliberately slow, noticed
  movement. The curves and the reduced-motion duration are already roles in
  `motion.css` and are read from there.

#### The size exception

Two kinds of primitive read remain in the components, and both are deliberate.

Thirty-one declarations take a size off the space ladder, on `height`, `width`,
`min-*`/`max-*` and `transform` offsets. A size is a value rather than a role,
and calling a 20px control height `--space-inset-lg` would say something untrue
about what it is. No padding, gap or margin does this.

Fifty-six read a primitive that has no semantic alias because the primitive's
own name already is the role: `--font-sans`, `--weight-*`, `--border-width-*`,
`--tracking-normal`, `--opacity-disabled`, `--icon-sm`, `--z-modal`.

No component reads a colour, radius, shadow or motion primitive. `tokens.test.ts`
in `haus-components` checks all of this on every run, so the counts above are
measured rather than remembered.

Two rules are enforced structurally:

- **Every surface has a paired `on-*` text token.** `--color-success-subtle` is
  paired with `--color-success-on-subtle`; the correct contrast is guaranteed by
  using the pair.
- **Every interactive scale has a disabled state.**

One deliberate asymmetry: `--color-success-on-default` and
`--color-warning-on-default` use dark text (`--damson-900`), because green-500 and
mango-500 do not clear WCAG AA against white. `solid` variants (green-700,
mango-700) exist for the cases that need white text.

#### Typography roles

The type system has **roles, not h1–h6**: `display`, `heading-lg`, `heading`,
`heading-sm`, `body-lg`, `body`, `body-sm`, `label`, `label-sm`, `label-xs`,
`mono`. Every role declares exactly **four** properties, size, weight, leading and
tracking, each as its own token (`--type-<role>-size`, `-weight`, `-leading`,
`-tracking`). Use all four together; setting only `font-size` from a role is
using the system wrong.

### 3. Motion (`motion.css`)

- **Durations**: `--duration-instant` (50ms) · `fast` (100ms) · `normal`
  (200ms) · `moderate` (300ms) · `slow` (500ms). Duration should be proportional
  to distance: `fast` for a checkbox tick, `moderate` for a drawer.
- **Easings**: `--ease-enter` (arrive with intent), `--ease-exit` (leave
  quickly), `--ease-move` (position changes), `--ease-spring` (overshoot),
  `--ease-linear` (opacity fades). Enter and exit are intentionally different
  curves.
- **Composite tokens**: ready-made duration+easing pairs: `--motion-fade-in`,
  `--motion-fade-out`, `--motion-slide-in`, `--motion-slide-out`,
  `--motion-micro`, `--motion-interactive`.
- **Reduced motion**: `--duration-reduced` (0ms). Under
  `prefers-reduced-motion: reduce`, animated components collapse *duration* to
  this token rather than removing transforms, so positional meaning (a toggle
  thumb, a modal offset) still applies.

## Why OKLCH

Every colour is authored in OKLCH, not hex or HSL. OKLCH is perceptually uniform:
equal numeric steps in L (lightness), C (chroma), or H (hue) produce
equal-feeling changes to the eye. That means palette ramps and feedback scales
can be reasoned about rather than guessed, hue stays stable across lightness
changes, and wide-gamut (P3) support comes for free. Conversion to hex is a
display concern for tooling, never the source of truth.

Hue separation is intentional and maintained: each feedback hue sits far enough
from its neighbours to avoid perceptual confusion (a warning that reads as
primary, info that looks like error). Damson shares Aronia's hue family (290° vs
300°) on purpose. At its near-zero chroma it reads as a neutral, giving the
whole system a subtle, cohesive plum undertone.

## Consuming the tokens

The package exposes both the CSS files and a typed JS object.

### CSS custom properties (runtime)

Import the layers once at your app root, in order:

```css
@import 'haus-tokens/primitives.css';
@import 'haus-tokens/semantics.css';
@import 'haus-tokens/motion.css';
```

Then reference the **semantic** tokens in your own CSS, without reaching through
to a palette step:

```css
.cta {
  background: var(--color-primary-default);
  color: var(--color-ink-on-aronia);
  padding: var(--space-inset-sm) var(--space-inset-lg);
  border-radius: var(--radius-control);
  transition: background var(--motion-interactive);
}
.cta:hover  { background: var(--color-primary-hover); }
.cta:focus-visible { box-shadow: var(--shadow-focus); }
```

Because the tokens are plain custom properties, a consuming project can use them
from vanilla CSS, CSS Modules, Tailwind, or CSS-in-JS. haus does not couple you
to any styling tool.

### W3C Design Tokens JSON (handoff)

`tokens.json` conforms to the [W3C Design Tokens](https://tr.designtokens.org/format/)
format, so it feeds Style Dictionary, Theo, or any spec-compliant pipeline with no
haus-specific tooling:

```js
import tokens from 'haus-tokens/tokens.json' with { type: 'json' }
```

### Typed JS object

The package's main export is a typed `tokens` object mirroring the same values,
useful for CSS-in-JS or reading a value in JavaScript:

```ts
import { tokens } from 'haus-tokens'

tokens.color.aronia[500]     // 'oklch(52% 0.138 300)'
tokens.duration.moderate     // '300ms'
tokens.motion['fade-in']     // '200ms cubic-bezier(0.00, 0.00, 0.20, 1.00)'
```

## Source files

| File | Contents |
|---|---|
| `packages/tokens/src/primitives.css` | Raw palette, type scale, space, radius, shadow, z-index, border, opacity, icon sizes |
| `packages/tokens/src/semantics.css` | Role aliases: surface, ink, border, primary, feedback, focus, type roles, spacing, radius, elevation, motion |
| `packages/tokens/src/motion.css` | Durations, easings, composite motion tokens, reduced-motion |
| `packages/tokens/src/tokens.json` | W3C DTCG export of the same values |
| `packages/tokens/src/index.ts` | Typed JS `tokens` object |
