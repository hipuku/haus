# haus tokens

`haus-tokens` is the source of truth for every visual value in haus: colour,
type, space, radius, elevation, and motion. It ships as plain CSS custom
properties (the runtime format) and a W3C Design Tokens JSON file (the handoff
format for tooling). haus is **light-mode only**: there is no dark theme and no
`light-dark()` layer.

## The four layers

Tokens are split into four files, wired to four CSS cascade layers so their
precedence is explicit and order-independent. `layers.css` declares the order
once, before anything opens a layer:

```
@layer haus.primitives   →   primitives.css   Raw values. No meaning.
@layer haus.brand        →   brand.css        Which primitive each role takes.
@layer haus.semantics    →   semantics.css    What each role means.
@layer haus.motion       →   motion.css       Durations, easings, motion pairs.
```

`haus.components` sits above these four and holds `haus-components/styles.css`,
so a consumer's own unlayered CSS beats all of it without a specificity fight.

### 1. Primitives (`primitives.css`)

Raw values only: palette steps, a numeric type scale, the spacing ramp, radii,
shadows, z-index, border widths, opacity, and icon sizes. Primitives carry **no
semantic meaning**: `--haus-aronia-500` is "this exact plum", not "the primary
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

### 2. Brand (`brand.css`)

Which primitive each role takes, and nothing else: no new names, no raw values,
no structure. 54 entries, and it is the one file a consumer replaces. A brand
author reads a flat list of choices, and a component author never sees this file
at all.

`brands/ruby.css` is a complete second brand, applied by
`<div data-haus-theme="ruby">` and nesting because custom properties inherit.
`BrandMap` in the TypeScript export is generated from this file, so a brand that
omits a role or misnames one fails a build rather than rendering an unresolved
`var()`.

### 3. Semantics (`semantics.css`)

What each role means. This is the layer components consume, for colour, type,
spacing, radius, elevation and motion alike. Every colour role reads a
`--haus-brand-*` entry, so a palette name never appears here:
`--haus-color-primary-default` reads `--haus-brand-primary-default`, and the word
"aronia" lives only in `primitives.css`. The file declares `color-scheme: light`,
and its roles are declared on `:root, [data-haus-theme]` so a themed subtree
re-resolves them.

Semantic groups:

- **Surface**: `--color-surface-default | subtle | raised | overlay | sunken |
  inverse | disabled`. Elevation is expressed with shadow rather than surface colour
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
- **Focus ring**: `--haus-shadow-focus` (a two-ring shadow: surface-coloured gap,
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
- **Radius**: `--haus-radius-control` (Button, Input, Select, Textarea),
  `--haus-radius-surface` (Card, Toast), `--haus-radius-overlay` (Modal),
  `--haus-radius-marker` (Checkbox, and Modal and Toast icons), `--haus-radius-pill`
  (Badge, Toggle track). Named for
  what is rounded, so a component asks for the shape of the thing.
- **Elevation**: `--haus-elevation-raised`, `--haus-elevation-floating`,
  `--haus-elevation-overlay`. Named for how high the thing sits.
- **Motion**: `--haus-motion-duration-emphasis` for a deliberately slow, noticed
  movement. The curves and the reduced-motion duration are already roles in
  `motion.css` and are read from there.

#### The size exception

Two kinds of primitive read remain in the components, and both are deliberate.

Thirty-one declarations take a size off the space ladder, on `height`, `width`,
`min-*`/`max-*` and `transform` offsets: the avatar sizes and its status dot,
the checkbox and radio boxes, the toggle track and thumb and the thumb's travel,
the modal's close button and max height, the toast and modal entry offsets, the
textarea's minimum height and the select chevron's offset. A size is a value
rather than a role, and calling a 16px checkbox `--haus-space-inset-md` would say
something untrue about what it is. No padding, gap or margin does this.

Control heights are a scale of their own rather than a step off the ladder,
because 36px and 44px are not on it. `--haus-control-height-sm`, `-md` and `-lg` are
28px, 36px and 44px: pointer density, the default, and the WCAG 2.5.8 AAA target
size. Button reads all three, Input and Select read the middle one, and
`min-height` is in stylelint's strict-value list so the next control cannot
invent a fourth height.

Sixty-one read a primitive that has no semantic alias because the primitive's
own name already is the role: `--haus-font-sans`, `--weight-*`, `--border-width-*`,
`--haus-tracking-normal`, `--haus-opacity-disabled`, `--haus-icon-sm`, `--haus-z-modal`,
`--control-height-*`.

No component reads a colour, radius, shadow or motion primitive. `tokens.test.ts`
in `haus-components` checks all of this on every run, so the counts above are
measured rather than remembered.

Two rules are enforced structurally:

- **Every surface has a paired `on-*` text token.** `--haus-color-success-subtle` is
  paired with `--haus-color-success-on-subtle`; the correct contrast is guaranteed by
  using the pair.
- **Every interactive scale has a disabled state.**

One deliberate asymmetry: `--haus-color-success-on-default` and
`--haus-color-warning-on-default` use dark text (`--haus-damson-900`), because green-500 and
mango-500 do not clear WCAG AA against white. `solid` variants (green-700,
mango-700) exist for the cases that need white text.

#### Typography roles

The type system has **roles rather than heading levels**: `display`, `heading-lg`, `heading`,
`heading-sm`, `body-lg`, `body`, `body-sm`, `label`, `label-sm`, `label-xs`,
`mono`. Every role declares exactly **four** properties, size, weight, leading and
tracking, each as its own token (`--type-<role>-size`, `-weight`, `-leading`,
`-tracking`). Use all four together; setting only `font-size` from a role is
using the system wrong.

### 4. Motion (`motion.css`)

- **Durations**: `--haus-duration-instant` (50ms) · `fast` (100ms) · `normal`
  (200ms) · `moderate` (300ms) · `slow` (500ms). Duration should be proportional
  to distance: `fast` for a checkbox tick, `moderate` for a drawer.
- **Easings**: `--haus-ease-enter` (arrive with intent), `--haus-ease-exit` (leave
  quickly), `--haus-ease-move` (position changes), `--haus-ease-spring` (overshoot),
  `--haus-ease-linear` (opacity fades). Enter and exit are intentionally different
  curves.
- **Composite tokens**: ready-made duration+easing pairs: `--haus-motion-fade-in`,
  `--haus-motion-fade-out`, `--haus-motion-slide-in`, `--haus-motion-slide-out`,
  `--haus-motion-micro`, `--haus-motion-interactive`.
- **Reduced motion**: `--haus-duration-reduced` (0ms). Under
  `prefers-reduced-motion: reduce`, animated components collapse *duration* to
  this token rather than removing transforms, so positional meaning (a toggle
  thumb, a modal offset) still applies.

## Why OKLCH

Every colour is authored in OKLCH, which is perceptually uniform:
equal numeric steps in L (lightness), C (chroma), or H (hue) produce
equal-feeling changes to the eye. That means palette ramps and feedback scales
can be reasoned about rather than guessed, hue stays stable across lightness
changes, and wide-gamut (P3) support comes for free. Conversion to hex is a
display concern for tooling; the OKLCH value stays the source.

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
@import 'haus-tokens/index.css';
```

That is the four files in the order they have to load. They are exported
individually too, and replacing `brand.css` is the documented case, but getting
the order wrong fails silently: an unresolved `var()` drops the declaration with
no warning and no build error.

```css
@import 'haus-tokens/layers.css';
@import 'haus-tokens/primitives.css';
@import 'haus-tokens/brand.css';
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
| `packages/tokens/src/brand.css` | Which primitive each role takes. The file a consumer replaces |
| `packages/tokens/src/brands/ruby.css` | A complete second brand, applied by `data-haus-theme` |
| `packages/tokens/src/semantics.css` | Role meanings: surface, ink, border, primary, feedback, focus, type roles, spacing, radius, elevation, motion |
| `packages/tokens/src/motion.css` | Durations, easings, composite motion tokens, reduced-motion |
| `packages/tokens/src/tokens.json` | W3C DTCG export of the same values |
| `packages/tokens/src/index.ts` | Typed JS `tokens` object |
