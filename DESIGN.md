# haus: design

The design system itself: how the tokens are layered, how a brand is applied, the type system, how
the 20 components are shaped, and what checks hold it together. Each choice that has a numbered
record in [`docs/decisions/`](./docs/decisions/README.md) is summarised here in a sentence and
linked; the rest are recorded below as decision entries. The Figma file mirrors all of it:
[haus Design System](https://www.figma.com/design/Qo23P38COlJrfQmlM39Fa3/haus-Design-System).

## Contents

- [Tokens](#tokens)
  - [Layers](#layers)
  - [Colour space](#colour-space)
  - [Surface and ink pairs](#surface-and-ink-pairs)
  - [Brands](#brands)
  - [Theme](#theme)
- [Typography](#typography)
  - [Typefaces](#typefaces)
  - [Type roles](#type-roles)
- [Components](#components)
  - [Scope](#scope)
  - [Styling](#styling)
  - [Props](#props)
  - [Motion](#motion)
- [Accessibility](#accessibility)
- [Enforcement](#enforcement)
- [Decision records](#decision-records)
- [Known gaps](#known-gaps)

## Tokens

The reference for every token is [`docs/tokens.md`](./docs/tokens.md), and the brand contract is
[Brands](#brands) below, with its tiers in
[decision 0014](./docs/decisions/0014-the-brand-contract-is-tiered.md). Figma holds the same tokens
as two variable collections, `haus/primitives` (136 variables) and `haus/semantics` (171), with one
mode per shipped brand.

### Layers

**Decision.** Four layers, each a file and a cascade layer, declared in one order by `layers.css`:

```text
primitives.css   haus.primitives   raw values, no meaning
brand.css        haus.brand        which primitive each role takes
semantics.css    haus.semantics    what each role means, no palette names
motion.css       haus.motion       durations, easings and motion pairs
```

Components read the semantic layer for colour, padding, gap, margin, radius, elevation and motion.
Two kinds of primitive read are allowed: a size off the space ladder (an avatar, a checkbox box, a
toggle track), and a primitive whose own name is already the role, such as
`--haus-control-height-md` or an icon size.

**Reason.** A theme swap runs on the separation: replacing one layer cannot reach past the roles
into a component. A value whose role cannot be named stays a primitive, because an invented alias
would be a second name for the same number.

**Alternatives.** Three layers, with the brand's choices written into `semantics.css`. Replaced by a
separate brand layer in [decision 0003](./docs/decisions/0003-brand-and-roles-are-separate-layers.md),
so a consumer replaces one file of choices rather than editing the meanings.

### Colour space

**Decision.** Every colour is authored in OKLCH. Hex is a display format for tooling; the OKLCH value
is the source.

**Reason.** OKLCH is perceptually uniform: equal steps in lightness, chroma or hue look like equal
changes, so a ramp or a feedback scale is authored by reasoning about perception rather than by
adjusting hex values until they look even. Wide-gamut (P3) colour comes with it.

**Alternatives.** Hex and HSL. HSL's lightness is not perceptual, so two colours at the same HSL
lightness can differ visibly in brightness.

### Surface and ink pairs

**Decision.** Every surface role has a paired ink role: `--haus-color-success-subtle` with
`--haus-color-success-on-subtle`, and so on for every surface. `contrast.test.ts` measures each pair.

**Reason.** Surface and text contrast are specified together, so a component author never works out
a pairing at the call site, and a pair that drops below WCAG AA fails a test rather than a review.
The naming follows Material Design 3.

### Brands

**Decision.** A brand is one file that maps roles to primitives, scoped by `data-haus-theme`, so a
brand applies to a subtree and nests. `brand.css` is the default; `brands/vault.css` and
`brands/core.css` ship beside it. The contract has three tiers: a required base (surfaces, ink,
borders, primary, the backdrop), and optional feedback and form tiers, all or nothing per group.
Form covers radius, elevation and typeface.

**Reason.** Products differ in a few decisions (palette, typeface, shadows, corner radius) and share
the rest. The tiers say which ones a product must make and which it may leave to haus.

The full reasoning is in four records:
[0003](./docs/decisions/0003-brand-and-roles-are-separate-layers.md) (the brand layer),
[0014](./docs/decisions/0014-the-brand-contract-is-tiered.md) (the tiers),
[0015](./docs/decisions/0015-a-brand-states-form-not-only-colour.md) (form) and
[0019](./docs/decisions/0019-typeface-is-a-form-tier-brand-entry.md) (typeface).
[0016](./docs/decisions/0016-a-restated-value-is-a-copy-and-the-package-says-so.md) covers a consumer
that overrides a role to the value haus already gives.

### Theme

**Decision.** Light mode only. `semantics.css` declares `color-scheme: light`, and nothing uses
`light-dark()`.

**Reason.** [Decision 0002](./docs/decisions/0002-surface-polarity-is-fixed.md) fixes surface
polarity in the contract (white cards on a subtle page) because every ink is paired with the surface
it is safe on. A dark theme inverts polarity, so it cannot arrive as a brand, and doing it properly
would double the colour decisions to audit.

**Alternatives.** A `light-dark()` layer in the semantic tokens. Not taken; reopening it means
reopening 0002.

## Typography

### Typefaces

**Decision.** The default brand sets Manrope for the interface and Fira Code for mono, both from
Google Fonts. A brand can replace either through `--haus-brand-font-sans` and
`--haus-brand-font-mono`; core sets Gabarito.

**Reason.** Manrope is a variable font from 200 to 800, so the whole type scale ships in one font
load with no weight snapping. Fira Code has programming ligatures and a compact footprint.

**Alternatives.** A serif display face. It did not sit with the rest of the scale inside components,
and no component needed it.

### Type roles

**Decision.** Type is set by role rather than heading level: `display`, `heading-lg`, `heading`,
`heading-sm`, `body-lg`, `body`, `body-sm`, the mono ladder `mono-xs`, `mono-sm` and `mono-md`, and a
label family (`label-xs`, `label-sm`, `label-md`, `label-field`, `label-eyebrow`,
`label-caption`). Each role binds exactly four tokens: size, weight, leading and tracking.

**Reason.** A component author picks the role that fits the content, not the size that looks right,
which is how heading styles end up on decorative text. All four properties are tokens because a
component that takes only the size and infers the rest drifts from one written by someone else.

**Alternatives.** One mono role, replaced by the ladder in
[decision 0027](./docs/decisions/0027-mono-is-a-ladder-not-a-role.md). In Figma a text style that bound
only size and weight drifted the same way, settled in
[decision 0026](./docs/decisions/0026-a-type-role-binds-all-four-properties-in-figma.md).

## Components

Avatar, Badge, Button, Callout, Card, Checkbox, Divider, EmptyState, IconButton, Input, Modal,
Popover, RadioGroup, Select, Spinner, Tabs, Textarea, Toast, Toggle and Tooltip. Each has a story in
the [live Storybook](https://haus.hipuku.dev) and a page in the Figma file.

### Scope

**Decision.** Twenty components, and a component joins only when products that consume haus have
each built it independently.

**Reason.** Promotion on evidence keeps haus to what more than one product needed, rather than to the
list other design systems carry. [Decision 0013](./docs/decisions/0013-a-component-is-promoted-on-evidence.md)
sets the rule and [0017](./docs/decisions/0017-the-nineteenth-component-is-a-busy-indicator.md) applies
it to Spinner.

### Styling

**Decision.** Component styles are CSS Modules, compiled into one stylesheet that declares its own
cascade layer, `haus.components`, and written in logical properties.

**Reason.** The token layer is plain custom properties, so a consumer can use Tailwind, plain CSS or
CSS-in-JS against it; CSS Modules keep the component styles off any consumer's build tooling and
readable without a utility vocabulary. The layer lets a consumer's unlayered CSS win without a
specificity fight ([0006](./docs/decisions/0006-styles-css-declares-its-own-layer.md)), and logical
properties make the components correct right to left
([0010](./docs/decisions/0010-components-are-written-in-logical-properties.md)).

**Alternatives.** Tailwind for the components. Not taken: it would couple haus to one consumer
toolchain and make each component's styles depend on Tailwind's class names.

### Props

**Decision.** The props follow one set of rules across the package:

- `variant` is visual weight, `tone` is meaning, `appearance` is fill
  ([0005](./docs/decisions/0005-variant-and-tone-are-separate.md)), and a tone rule only remaps
  custom properties ([0012](./docs/decisions/0012-a-tone-declares-custom-properties-only.md)).
- `className` lands on the root element; a second target is a named prop
  ([0009](./docs/decisions/0009-classname-lands-on-the-root.md)).
- A component owns its box, never the caller's element, and says so
  ([0022](./docs/decisions/0022-ownership-is-stated-in-both-directions.md)).
- A union prop type exports each half by name
  ([0023](./docs/decisions/0023-a-union-prop-type-exports-its-halves.md)).

**Reason.** A consumer who has learned one component has learned the prop vocabulary of all 20.

### Motion

**Decision.** Every animated component sets `transition-duration` and `animation-duration` to
`--haus-duration-reduced` (0ms) under `prefers-reduced-motion: reduce`.

**Reason.** Some transforms carry position, such as the Toggle thumb and the Modal's entry offset.
Collapsing the duration keeps the transform, so the control still lands in its new state, only
without the movement. The value is a token so it can be tuned in one place.

**Alternatives.** Removing the transforms under the media query, rejected because the Toggle thumb
would no longer show which state it is in.

## Accessibility

Axe runs in all 20 component suites. `contrast.test.ts` measures every surface and ink pair against
WCAG AA with `haus-colour-utils`, and the focus ring against three surfaces at 3:1. Keyboard tests
cover arrows, Space, Escape and tab stops, and Modal's test checks that focus is trapped and
returned. The full list of what is checked, what is not, and the known limitations is in
[`docs/accessibility.md`](./docs/accessibility.md).

Focus is one treatment everywhere, a double ring with the element's own surface as the inner band
([0001](./docs/decisions/0001-focus-is-a-double-ring.md)), and every ring has a
`forced-colors: active` fallback because forced-colours mode drops box shadows.

## Enforcement

| Check                                | Fails when                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Stylelint `declaration-strict-value` | A colour, size, spacing, radius, shadow, type or z-index value is written raw in a component stylesheet          |
| `tokens.test.ts`                     | A component reads a colour, radius, shadow or motion primitive, or names a custom property that nothing declares |
| `logical-properties.test.ts`         | A component uses a physical inline-axis property, or a focus ring has no forced-colours fallback                 |
| `stories.test.ts`                    | A component has no story                                                                                         |
| `api-surface.test.tsx`               | A component in the barrel breaks a rule every component shares                                                   |
| `tokens:check`                       | The generated token files differ from what the generator writes                                                  |
| Chromatic                            | A story's rendering changes; the change waits for a person to accept or reject it                                |

### Storybook

**Decision.** Storybook is the published surface, and nothing ships without a story: every component,
and every token family on its own page.

**Reason.** A token or component a consumer cannot see in the published docs is one they will not
find. The token pages are held to the same visual standard as the components they document.

## Decision records

All 27 are indexed in [`docs/decisions/README.md`](./docs/decisions/README.md), with each one's status.
By subject:

| Subject           | Records                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens and brands | [0002](./docs/decisions/0002-surface-polarity-is-fixed.md), [0003](./docs/decisions/0003-brand-and-roles-are-separate-layers.md), [0014](./docs/decisions/0014-the-brand-contract-is-tiered.md), [0015](./docs/decisions/0015-a-brand-states-form-not-only-colour.md), [0016](./docs/decisions/0016-a-restated-value-is-a-copy-and-the-package-says-so.md), [0018](./docs/decisions/0018-vaults-twenty-are-settled-one-at-a-time.md), [0019](./docs/decisions/0019-typeface-is-a-form-tier-brand-entry.md) |
| Typography        | [0026](./docs/decisions/0026-a-type-role-binds-all-four-properties-in-figma.md), [0027](./docs/decisions/0027-mono-is-a-ladder-not-a-role.md)                                                                                                                                                                                                                                                                                                                                                              |
| Components        | [0008](./docs/decisions/0008-toast-is-presentational.md), [0011](./docs/decisions/0011-select-is-a-native-select.md), [0013](./docs/decisions/0013-a-component-is-promoted-on-evidence.md), [0017](./docs/decisions/0017-the-nineteenth-component-is-a-busy-indicator.md), [0020](./docs/decisions/0020-listbox-and-select-both-stay.md), [0021](./docs/decisions/0021-decision-states-are-badge-tones.md), [0025](./docs/decisions/0025-select-is-the-themed-control.md)                                  |
| Component API     | [0005](./docs/decisions/0005-variant-and-tone-are-separate.md), [0009](./docs/decisions/0009-classname-lands-on-the-root.md), [0012](./docs/decisions/0012-a-tone-declares-custom-properties-only.md), [0022](./docs/decisions/0022-ownership-is-stated-in-both-directions.md), [0023](./docs/decisions/0023-a-union-prop-type-exports-its-halves.md)                                                                                                                                                      |
| Styling and focus | [0001](./docs/decisions/0001-focus-is-a-double-ring.md), [0006](./docs/decisions/0006-styles-css-declares-its-own-layer.md), [0010](./docs/decisions/0010-components-are-written-in-logical-properties.md)                                                                                                                                                                                                                                                                                                 |
| Packaging         | [0004](./docs/decisions/0004-versioning-is-1-x.md), [0007](./docs/decisions/0007-no-meta-package.md), [0024](./docs/decisions/0024-the-rsc-path-is-guarded-by-its-rule.md)                                                                                                                                                                                                                                                                                                                                 |

## Known gaps

- **No dark theme.** Out of scope while decision 0002 stands.
- **Badge's tones** still declare colours directly rather than remapping custom properties, the last
  component decision 0012 has not reached.
- **No screen reader run.** The accessibility checks are automated; they cover the markup, not the
  experience of using it.
- **No right-to-left visual test.** The components are written in logical properties and a source
  test holds them there, but nothing renders one right to left under a visual diff.
- **Scope stops at tokens, components and Storybook.** There is no MCP server and no Figma Code
  Connect integration.
