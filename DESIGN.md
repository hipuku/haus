# Design and Engineering Decisions

Key decisions made during the design and build of haus. Recorded to explain the *why*, not as immutable rules, but so future changes are made with full awareness of what they replace.

---

## Colour space: OKLCH over hex and HSL

OKLCH gives perceptual uniformity that hex and HSL don't. Equal numeric steps in L, C, or H produce equal-feeling changes to the eye, which means palette ramps and feedback scales can be authored by reasoning about perception rather than guessing at hex values. Wide-gamut support (P3) is a free consequence. Every colour in haus is defined in OKLCH; conversion to hex for tooling is a display concern, not a source-of-truth concern.

## Three-layer token architecture: primitives → semantics → components

Primitives hold raw values (no meaning, just numbers). Semantics hold intent: role names like `--color-surface-default` that alias primitives. Components consume semantics only; they never reach through to primitives. This separation means a theme swap (high-contrast, a brand variant) is a single-file change to `semantics.css` with zero component edits. It also enforces a discipline: if you can't name what a token *does*, it shouldn't exist.

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

Three packages: `tokens`, `components`, `colour-utils`. Keeping them separate means a project that only needs the token layer doesn't pull in the React component code, and a project using `colour-utils` server-side doesn't depend on the browser component bundle. pnpm workspaces because workspace symlinks work reliably across packages without manual linking and the lockfile deduplication keeps the install footprint small.

## Manrope for UI, Fira Code for mono

Manrope is a variable font with a wide weight range (200-800), which means the full type scale ships in one font load with no fallback weight snapping. Fira Code has programming ligatures and a compact footprint. Both are available on Google Fonts, which removes the self-hosting requirement for a v1 system. Domine is loaded for the marketing site only and is explicitly excluded from the token package. Mixing a serif display font into UI components was rejected.

## Light mode only

haus is light mode only, and dark mode is out of scope — not a deferred layer. The semantic layer declares `color-scheme: light` and there is no `light-dark()` usage anywhere in the tokens. Doing dark mode properly would require auditing every semantic token for dark-mode contrast, which doubles the colour decision surface; the system is deliberately scoped to prove the light token structure without that cost. If dark mode were ever revisited, it would live entirely in `semantics.css` with zero component edits — but that is explicitly not part of this system.

Scope is locked in two other ways worth recording here: there is **no MCP server** and **no Figma Code Connect** integration. The product surface is the token packages, the 12 React components, and Storybook — nothing more.

## Storybook as the product, not documentation

For an open-source design system, Storybook is what consumers actually read. A token that exists in `primitives.css` but has no story is a token that doesn't exist for the people using the system. The rule enforced here: nothing ships without a corresponding story. This also means the token pages are themselves a design artefact: they need to look good, not just be technically correct.

## `prefers-reduced-motion` policy

All animated components respect `prefers-reduced-motion: reduce` by overriding `transition-duration` and `animation-duration` to `--duration-reduced`.

The override targets duration rather than using `transition: none` because:
- Some transforms carry positional meaning (Toggle thumb, Modal entry offset) and need to apply even without animation
- A control that snaps instantly to its new position still communicates state; one that doesn't move at all is ambiguous

`--duration-reduced` is a named token rather than a hardcoded `0ms` so it stays tunable and reads as intentional in the source.
