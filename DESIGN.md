# Design and Engineering Decisions

Key decisions made during the design and build of haus, recorded so a later change knows what it replaces.

---

## Colour space: OKLCH over hex and HSL

OKLCH is perceptually uniform. Equal numeric steps in L, C, or H produce equal-feeling changes to the eye, which means palette ramps and feedback scales can be authored by reasoning about perception rather than guessing at hex values. Wide-gamut support (P3) is a free consequence. Every colour in haus is defined in OKLCH. Conversion to hex for tooling is a display concern; the OKLCH value stays the source.

## Hue family bins are fitted to named colours

`hueFamily` in `haus-colour-utils` reports which of eight families a colour belongs to. The
first version binned OKLCH hue at the midpoints between the measured hues of the eight
colours the families are named after, which is a construction that only holds if each
family is centred on its namesake.

Measured against 4,275 colours from `haus-colour-names` whose names end in a family word,
several are not. The median of 222 colours people call orange is hue 47, while `#ffa500`
is at 71, so a midpoint at 50 filed most oranges as red. Purple ran the other way: its
median is 312 and the bin ended at 310, which is why `#800080` came out as Pink.

The boundaries are now the set that maximises mean per-family recall over that data, which
moved it from 0.62 to 0.78. Per-family recall rather than plain accuracy, because there are
five times as many labelled greens as oranges and plain accuracy rises when a small family
is emptied into a large neighbour.

Two edges are judgement. Orange ends at 72 rather than the fitted 70, so that `#ffa500` is
still Orange, at a cost of 0.002. And purple and magenta cannot be separated at all:
`#800080` and `#ff00ff` are both hue 328 and differ only in lightness and chroma, so one of
the two is misnamed whatever the boundary does. 328 is Purple, because far more real
colours at that hue are called purple.

The fit is held by a test. `hue-families.test.ts` rebuilds the labelled set,
holds recall above 0.77, and asserts that every declared family is reachable, so a boundary
moved for one colour that looked wrong cannot quietly cost the other 4,274.

## Three-layer token architecture: primitives → semantics → components

Primitives hold raw values (no meaning, just numbers). Semantics hold intent: role names like `--haus-color-surface-default` that alias primitives. Components consume semantics for colour, padding, gap, margin, radius, elevation and motion, and no component reads a colour, radius, shadow or motion primitive. Two kinds of primitive read remain, both deliberate and both tested: 28 declarations take a size off the space ladder (avatar sizes, the checkbox and radio boxes, the toggle track and thumb, a few min/max bounds), because a size is a value rather than a role; and 31 read a primitive whose own name already is the role, such as `--haus-control-height-md` and the icon sizes the close buttons and the chevron bind to since haus#43 (this was 54 until haus#54 made typeface brandable and moved the 32 `--haus-font-sans` reads onto a role, then rose and fell with IconButton, Select, the native select's retirement in decision 0025 and IconButton's lg size; tokens.test.ts holds the ledger). That was 71 until haus#27 gave stacking, border width and opacity a role layer, which moved 30 reads up a layer without changing a single component declaration. Control heights were the exception to this until they had a scale: Button, Input and Select set `min-height` in raw pixels, and `min-height` is now in stylelint's strict-value list so the next one cannot. The separation is what a theme swap runs on: `brand.css` holds which primitive each role takes and nothing else, `brands/vault.css` and `brands/core.css` are two shipped brands against the same contract, and `BrandMap` is generated from `brand.css` so an omission is a type error rather than an unresolved `var()`. [Decision 0003](docs/decisions/0003-brand-and-roles-are-separate-layers.md) records the contract that makes it true and what it costs. A value whose role cannot be named stays a primitive.

## Role-based type system over a heading scale

The type system has roles rather than heading levels: `display`, `heading-lg`, `heading`, `heading-sm`, `body-lg`, `body`, `body-sm`, `mono`, and one label family, a size ramp (`label-xs`, `label-sm`, `label-md`) and three named variants (`label-field`, `label-eyebrow`, `label-caption`). This decouples visual hierarchy from document semantics. A component author picks the role that fits the content's purpose. Picking by the size that looks right produces h1 styles on decorative text.

## The four-property rule for type tokens

Every type role defines exactly four properties: size, weight, line-height, and tracking. All four are declared as semantic tokens. Setting only font-size from a type token and inferring the rest introduces inconsistency between components authored by different people.

## CSS Modules over Tailwind for components

Component CSS uses CSS Modules. The token layer is plain CSS custom properties, so any consuming project can use Tailwind, vanilla CSS, or CSS-in-JS against the tokens. Keeping component styles in CSS Modules avoids coupling haus to any consumer's build tooling, and means the component styles are readable without knowing Tailwind's class vocabulary. Utility classes stay a consumer's choice.

## Semantic `on-*` pairing for every surface token

Every surface token has a corresponding `on-*` text token: `--haus-color-success-subtle` is paired with `--haus-color-success-on-subtle`. Surface and text contrast are specified together, so a component author never works out a pairing at the call site. The approach is Material Design 3's. Using the paired token gives the contrast the token layer specifies.

## W3C Design Tokens JSON as the canonical export format

`tokens.json` conforms to the W3C Design Tokens 1.0 format. This means haus tokens are compatible with Style Dictionary, Theo, and any token pipeline that reads the spec without any haus-specific tooling. The CSS custom properties are the runtime format; the JSON is the handoff format for tools and downstream systems.

## Monorepo with pnpm workspaces

Five packages: `tokens`, `components`, `colour-utils`, `style-probe` and `colour-names`. Keeping them separate means a project that only needs the token layer doesn't pull in the React component code, a project using `colour-utils` server-side doesn't depend on the browser component bundle, and a project that wants CIEDE2000 doesn't pay 764KB for 31,900 names it never asks about. pnpm workspaces because workspace symlinks work reliably across packages without manual linking and the lockfile deduplication keeps the install footprint small.

## Manrope for UI, Fira Code for mono

Manrope is a variable font with a wide weight range (200-800), which means the full type scale ships in one font load with no fallback weight snapping. Fira Code has programming ligatures and a compact footprint. Both are available on Google Fonts, which removes the self-hosting requirement for a v1 system. A serif display face was tried and rejected: it did not sit with the rest of the scale inside UI components, and no component needed it.

## Light mode only

haus is light mode only. Dark mode is out of scope, not a deferred layer. The semantic layer declares `color-scheme: light` and there is no `light-dark()` usage anywhere in the tokens. Doing dark mode properly would require auditing every semantic token for dark-mode contrast, which doubles the colour decision surface; the system is deliberately scoped to prove the light token structure without that cost. Revisiting it would mean reopening [decision 0002](docs/decisions/0002-surface-polarity-is-fixed.md), which fixes surface polarity in the contract rather than leaving it to a brand: a dark theme is a polarity inversion, so under that decision it cannot arrive as a theme at all.

Scope is locked in two other ways worth recording here: there is **no MCP server** and **no Figma Code Connect** integration. The product surface is the token packages, the 20 React components, and Storybook, and nothing more.

## Storybook is the product surface

Storybook is the published surface, so a token declared in `primitives.css` with no story is one a consumer never sees. The rule enforced here: nothing ships without a corresponding story. The token pages are held to the same visual standard as the components they document.

## `prefers-reduced-motion` policy

All animated components respect `prefers-reduced-motion: reduce` by overriding `transition-duration` and `animation-duration` to `--haus-duration-reduced`.

The override targets duration rather than using `transition: none` because:
- Some transforms carry positional meaning (Toggle thumb, Modal entry offset) and need to apply even without animation
- A control that snaps straight to its new position still shows the state; with `transition: none` the Toggle thumb and the Modal offset would not move at all

`--haus-duration-reduced` is a named token rather than a hardcoded `0ms`, so the value is tunable in one place.
