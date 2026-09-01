# Design and Engineering Decisions

Key decisions made during the design and build of haus. Recorded to explain the *why*, not as immutable rules, but so future changes are made with full awareness of what they replace.

---

## Colour space: OKLCH over hex and HSL

OKLCH gives perceptual uniformity that hex and HSL don't. Equal numeric steps in L, C, or H produce equal-feeling changes to the eye, which means palette ramps and feedback scales can be authored by reasoning about perception rather than guessing at hex values. Wide-gamut support (P3) is a free consequence. Every colour in haus is defined in OKLCH; conversion to hex for tooling is a display concern, not a source-of-truth concern.

## Hue family bins fitted to named colours, not derived from anchors

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

The fit is a test rather than a comment. `hue-families.test.ts` rebuilds the labelled set,
holds recall above 0.77, and asserts that every declared family is reachable, so a boundary
moved for one colour that looked wrong cannot quietly cost the other 4,274.

## Three-layer token architecture: primitives → semantics → components

Primitives hold raw values (no meaning, just numbers). Semantics hold intent: role names like `--color-surface-default` that alias primitives. Components consume semantics for colour, padding, gap, margin, radius, elevation and motion, and no component reads a colour, radius, shadow or motion primitive. Two kinds of primitive read remain, both deliberate and both tested: 31 declarations take a size off the space ladder (avatar sizes, the checkbox and radio boxes, the toggle track and thumb, a few min/max bounds), because a size is a value rather than a role; and 61 read a primitive whose own name already is the role, such as `--font-sans`, `--border-width-default` and `--control-height-md`. Control heights were the exception to this until they had a scale: Button, Input and Select set `min-height` in raw pixels, and `min-height` is now in stylelint's strict-value list so the next one cannot. This separation is what a theme swap will rest on, but it does not yet deliver one: the brand and the roles are the same file today, so a swap is not the single-file change this paragraph used to promise. [Decision 0003](docs/decisions/0003-brand-and-roles-are-separate-layers.md) records the contract that makes it true and what it costs. It also enforces a discipline: if you can't name what a token *does*, it shouldn't exist.

## Role-based type system over a heading scale

The type system has no h1-h6. It has roles: `display`, `heading-lg`, `heading`, `heading-sm`, `body-lg`, `body`, `body-sm`, `label`, `label-sm`, `label-xs`, `mono`. This decouples visual hierarchy from document semantics. A component author picks the role that fits the content's purpose, not the size that looks right. It also prevents the common mistake of using h1 styles on decorative text to get a large font size.

## The four-property rule for type tokens

Every type role defines exactly four properties: size, weight, line-height, and tracking. All four are declared as semantic tokens. Setting only font-size from a type token and inferring the rest introduces inconsistency between components authored by different people. The rule makes "using the system correctly" the path of least resistance.

## CSS Modules over Tailwind for components

Component CSS uses CSS Modules. The token layer is plain CSS custom properties, so any consuming project can use Tailwind, vanilla CSS, or CSS-in-JS against the tokens. Keeping component styles in CSS Modules avoids coupling haus to any consumer's build tooling, and means the component styles are readable without knowing Tailwind's class vocabulary. Utility classes are a consumer's choice, not the system's.

## Semantic `on-*` pairing for every surface token

Every surface token has a corresponding `on-*` text token: `--color-success-subtle` is paired with `--color-success-on-subtle`. This is borrowed from Material Design 3's insight that surface and text contrast should be specified together, not left for component authors to work out at usage time. It also makes contrast failures impossible to accidentally introduce: use the paired token and the contrast is guaranteed by construction.

## W3C Design Tokens JSON as the canonical export format

`tokens.json` conforms to the W3C Design Tokens 1.0 format. This means haus tokens are compatible with Style Dictionary, Theo, and any token pipeline that reads the spec without any haus-specific tooling. The CSS custom properties are the runtime format; the JSON is the handoff format for tools and downstream systems.

## Monorepo with pnpm workspaces

Five packages: `tokens`, `components`, `colour-utils`, `style-probe` and `colour-names`. Keeping them separate means a project that only needs the token layer doesn't pull in the React component code, a project using `colour-utils` server-side doesn't depend on the browser component bundle, and a project that wants CIEDE2000 doesn't pay 764KB for 31,900 names it never asks about. pnpm workspaces because workspace symlinks work reliably across packages without manual linking and the lockfile deduplication keeps the install footprint small.

## Manrope for UI, Fira Code for mono

Manrope is a variable font with a wide weight range (200-800), which means the full type scale ships in one font load with no fallback weight snapping. Fira Code has programming ligatures and a compact footprint. Both are available on Google Fonts, which removes the self-hosting requirement for a v1 system. A serif display face was tried and rejected: mixing one into UI components fought the type scale, and nothing outside a marketing page wanted it.

## Light mode only

haus is light mode only, and dark mode is out of scope, and not a deferred layer. The semantic layer declares `color-scheme: light` and there is no `light-dark()` usage anywhere in the tokens. Doing dark mode properly would require auditing every semantic token for dark-mode contrast, which doubles the colour decision surface; the system is deliberately scoped to prove the light token structure without that cost. Revisiting it would mean reopening [decision 0002](docs/decisions/0002-surface-polarity-is-fixed.md), which fixes surface polarity in the contract rather than leaving it to a brand: a dark theme is a polarity inversion, so under that decision it cannot arrive as a theme at all.

Scope is locked in two other ways worth recording here: there is **no MCP server** and **no Figma Code Connect** integration. The product surface is the token packages, the 12 React components, and Storybook, and nothing more.

## Storybook as the product, not documentation

For an open-source design system, Storybook is what consumers actually read. A token that exists in `primitives.css` but has no story is a token that doesn't exist for the people using the system. The rule enforced here: nothing ships without a corresponding story. This also means the token pages are themselves a design artefact: they need to look good, not just be technically correct.

## `prefers-reduced-motion` policy

All animated components respect `prefers-reduced-motion: reduce` by overriding `transition-duration` and `animation-duration` to `--duration-reduced`.

The override targets duration rather than using `transition: none` because:
- Some transforms carry positional meaning (Toggle thumb, Modal entry offset) and need to apply even without animation
- A control that snaps instantly to its new position still communicates state; one that doesn't move at all is ambiguous

`--duration-reduced` is a named token rather than a hardcoded `0ms` so it stays tunable and reads as intentional in the source.
