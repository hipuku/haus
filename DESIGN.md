# haus: design

The design system itself: how the tokens are layered, how a brand is applied, the type system, how
the 20 components are shaped, and what checks hold it together. The numbered rulings behind it are
under [Decisions](#decisions), each with what it was chosen over and what it costs. The Figma file
mirrors all of it:
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
- [Decisions](#decisions)
- [Known gaps](#known-gaps)

## Tokens

The reference for every token is [`docs/tokens.md`](./docs/tokens.md), and the brand contract is
[Brands](#brands) below, with its tiers in
[decision 0014](#0014-the-brand-contract-is-tiered). Figma holds the same tokens
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
separate brand layer in [decision 0003](#0003-the-brand-and-the-role-system-are-separate-layers),
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
[0003](#0003-the-brand-and-the-role-system-are-separate-layers) (the brand layer),
[0014](#0014-the-brand-contract-is-tiered) (the tiers),
[0015](#0015-a-brand-states-form-as-well-as-colour) (form) and
[0019](#0019-typeface-is-a-form-tier-brand-entry-and-moving-it-is-a-major) (typeface).
[0016](#0016-a-restated-value-is-a-copy-and-the-package-says-so) covers a consumer
that overrides a role to the value haus already gives.

### Theme

**Decision.** Light mode only. `semantics.css` declares `color-scheme: light`, and nothing uses
`light-dark()`.

**Reason.** [Decision 0002](#0002-surface-polarity-is-fixed-by-the-contract) fixes surface
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
[decision 0027](#0027-mono-is-a-ladder-not-a-role). In Figma a text style that bound
only size and weight drifted the same way, settled in
[decision 0026](#0026-a-type-role-binds-all-four-of-its-properties-in-figma).

## Components

Avatar, Badge, Button, Callout, Card, Checkbox, Divider, EmptyState, IconButton, Input, Modal,
Popover, RadioGroup, Select, Spinner, Tabs, Textarea, Toast, Toggle and Tooltip. Each has a story in
the [live Storybook](https://haus.hipuku.dev) and a page in the Figma file.

### Scope

**Decision.** Twenty components, and a component joins only when products that consume haus have
each built it independently.

**Reason.** Promotion on evidence keeps haus to what more than one product needed, rather than to the
list other design systems carry. [Decision 0013](#0013-a-component-is-promoted-on-evidence-not-on-taste)
sets the rule and [0017](#0017-the-nineteenth-component-is-a-busy-indicator) applies
it to Spinner.

### Styling

**Decision.** Component styles are CSS Modules, compiled into one stylesheet that declares its own
cascade layer, `haus.components`, and written in logical properties.

**Reason.** The token layer is plain custom properties, so a consumer can use Tailwind, plain CSS or
CSS-in-JS against it; CSS Modules keep the component styles off any consumer's build tooling and
readable without a utility vocabulary. The layer lets a consumer's unlayered CSS win without a
specificity fight ([0006](#0006-the-component-stylesheet-declares-its-own-cascade-layer)), and logical
properties make the components correct right to left
([0010](#0010-components-are-written-in-logical-properties)).

**Alternatives.** Tailwind for the components. Not taken: it would couple haus to one consumer
toolchain and make each component's styles depend on Tailwind's class names.

### Props

**Decision.** The props follow one set of rules across the package:

- `variant` is visual weight, `tone` is meaning, `appearance` is fill
  ([0005](#0005-variant-and-tone-are-separate-props)), and a tone rule only remaps
  custom properties ([0012](#0012-a-tone-rule-declares-custom-properties-only)).
- `className` lands on the root element; a second target is a named prop
  ([0009](#0009-classname-lands-on-the-root-element)).
- A component owns its box, never the caller's element, and says so
  ([0022](#0022-ownership-is-stated-in-both-directions)).
- A union prop type exports each half by name
  ([0023](#0023-a-union-prop-type-exports-its-halves)).

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
([0001](#0001-focus-is-a-double-ring)), and every ring has a
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

## Decisions

The rulings the system is built on, numbered in the order they were made. Each records what was
chosen, what it was chosen over and what it costs. Status is about the decision, not the code: two
are superseded, and one is not yet true of every component.

| Subject           | Decisions                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens and brands | [0002](#0002-surface-polarity-is-fixed-by-the-contract), [0003](#0003-the-brand-and-the-role-system-are-separate-layers), [0014](#0014-the-brand-contract-is-tiered), [0015](#0015-a-brand-states-form-as-well-as-colour), [0016](#0016-a-restated-value-is-a-copy-and-the-package-says-so), [0018](#0018-vaults-twenty-local-tokens-settled-one-at-a-time), [0019](#0019-typeface-is-a-form-tier-brand-entry-and-moving-it-is-a-major) |
| Typography        | [0026](#0026-a-type-role-binds-all-four-of-its-properties-in-figma), [0027](#0027-mono-is-a-ladder-not-a-role)                                                                                                                                                                                                                                                                                                                          |
| Components        | [0008](#0008-toast-stays-presentational), [0011](#0011-select-is-a-native-select), [0013](#0013-a-component-is-promoted-on-evidence-not-on-taste), [0017](#0017-the-nineteenth-component-is-a-busy-indicator), [0020](#0020-listbox-and-select-both-stay), [0021](#0021-a-products-domain-states-spend-badges-tones), [0025](#0025-select-is-the-themed-control-and-the-native-select-is-retired)                                       |
| Component API     | [0005](#0005-variant-and-tone-are-separate-props), [0009](#0009-classname-lands-on-the-root-element), [0012](#0012-a-tone-rule-declares-custom-properties-only), [0022](#0022-ownership-is-stated-in-both-directions), [0023](#0023-a-union-prop-type-exports-its-halves)                                                                                                                                                               |
| Styling and focus | [0001](#0001-focus-is-a-double-ring), [0006](#0006-the-component-stylesheet-declares-its-own-cascade-layer), [0010](#0010-components-are-written-in-logical-properties)                                                                                                                                                                                                                                                                 |
| Packaging         | [0004](#0004-versioning-goes-to-1x), [0007](#0007-no-meta-package), [0024](#0024-the-rsc-path-is-guarded-by-its-rule-not-by-a-harness)                                                                                                                                                                                                                                                                                                  |

A choice worth recording, one a reviewer would otherwise reopen, gets the next number here.

### 0001 Focus is a double ring

_2026-09-01. Implemented._

The focus indicator is `0 0 0 2px <surface>, 0 0 0 4px <focus>` everywhere: a band of the element's
own backdrop, then the accent at full strength. Three treatments existed across the products, and
only this one met WCAG 1.4.11: core's 2px outline at 32% alpha measured 1.60:1 against its page, and
a soft halo's strongest pixel is not its measured contrast. Forced-colours mode drops box shadows, so
every ring has an `outline` fallback in `Highlight`. The cost is room: a 4px ring crowds a full-width
input, which is why the text controls change their border instead.

### 0002 Surface polarity is fixed by the contract

_2026-09-01. Implemented._

White cards on a subtle page, and a brand cannot invert it. Every surface role is paired with the ink
that is safe on it, which is what makes contrast decidable once at the token layer; a brand that
inverted polarity would invert the pairings consumers rely on. core inverted it, so its adoption
included a visual re-tune. The cost, stated plainly: there is no dark mode through the brand map. A
dark theme would be a second contract, or this decision reopened.

### 0003 The brand and the role system are separate layers

_2026-09-01. Implemented._

The brand map is its own cascade layer, every property is prefixed `--haus-`, a brand is scoped by
`data-haus-theme`, and a generated `BrandMap` type says what a brand must supply. Before this, every
token sat unprefixed on a bare `:root` and collided with a consumer's Tailwind. vault declared 159
properties of its own and core 56, but the roles were not what they rejected: of vault's 40 differing
values, about thirty were palette swaps. The brand was the part that could not move. Breaking, so it
landed with the 1.x cut.

### 0004 Versioning goes to 1.x

_2026-09-01. Implemented at 1.0.0._

Every package is 1.x so the caret works: under 0.x a minor is treated as breaking, and
`haus-colour-utils` 0.3.0 sat unshipped because both consumers were pinned to `^0.2.1`. Two rules
carry the weight: a token rename is a major at an identical value, and a contrast change is a major
however little the hex moves. A token's name and its measured contrast are both contract.

### 0005 `variant` and `tone` are separate props

_2026-09-01. Implemented._

`variant` is visual weight only. `tone` is `neutral | info | success | warning | error` everywhere,
with `danger` renamed `error`. `appearance` is `subtle | solid`, Button's `external` is its own prop,
and sizes converge on `sm | md | lg`, with Avatar's `xs` and `xl` a documented extension. `variant`
had meant weight on Button, elevation on Card and semantics on Badge. It renamed props across most of
the library, so it shipped in the same major as the token split.

### 0006 The component stylesheet declares its own cascade layer

_2026-09-01. Implemented._

`haus-components/styles.css` declares its own cascade layer, so a consumer's CSS wins without a
specificity fight instead of depending on import order. A function consumers call and a shipped
Stylelint config were the alternatives; only the layer makes the package state its own precedence.
It was breaking for anyone relying on source order, and was done while drift was the only consumer of
the component tier, when it cost least.

### 0007 No meta-package

_2026-09-01. Implemented by doing nothing._

No `haus` package bundling the others at exact versions. The convenience was mostly the caret problem
that 0004 already fixed, and a meta-package would add a sixth package to release and a second place
each version is stated. One bundled version would also claim the tiers cannot release independently,
which is not true of the architecture.

### 0008 Toast stays presentational

_2026-09-01. Implemented._

Toast ships the surface. The provider, queue, positioning, auto-dismiss and stacking are the
consumer's, and `Toast.tsx` says so in its own documentation. A toast system owns global state, a
portal and a policy about how many notices stack for how long, which is an application's opinion.
Re-measured on 2026-09-08, only core has toasts at all, so a provider would have one consumer and fail 0013. core keeps sonner and renders haus's surface through `toast.custom`.

### 0009 `className` lands on the root element

_2026-09-01. Implemented._

`className` goes on the root element of every component, and a component that needs a second target
gets a named prop for it. It had landed on six different nodes, and Checkbox's outer div was
unreachable by any means. Documenting the existing placement was rejected on that case: a convention
that has to describe a defect is not worth writing down. `api-surface.test.tsx` holds it.

### 0010 Components are written in logical properties

_2026-09-01. Implemented._

Inline-axis declarations use logical properties, so a right-to-left document flips them; 27
declarations across ten components had pointed the wrong way. `translateX` has no logical form, so a
sliding element carries its travel and direction as variables and a `[dir='rtl']` rule flips the sign.
No public name changed. `logical-properties.test.ts` asserts the source, because the component tests
run without CSS; a right-to-left visual test is still open.

### 0011 `Select` is a native select

_2026-09-02. Superseded by 0025._

`Select` rendered a real `<select>` with a themed closed state and the operating system's popup. The
platform gives correct keyboard handling, a wheel picker on iOS and assistive-technology behaviour for
free. The cost was the whole finding: both consumers needed a themed list, built their own, and the
system shipped the one picker neither used. The reasoning survives as guidance for when a raw
`<select>` is the better answer: touch, forms that must work without JavaScript, very long lists.

### 0012 A tone rule declares custom properties only

_2026-09-03. Implemented on Button and Toast; Badge pending._

A tone rule may remap custom properties and declare nothing else, and a variant rule reads the subset
its weight needs. Button's tone rules had set colours outright, so `variant="ghost" tone="error"`
rendered solid. Neutral is a tone, and a component narrows `Tone` only where the roles genuinely do
not exist. `stylesheet.test.ts` fails any tone rule that declares a non-custom property. The cost is
indirection: `.primary` no longer says what colour it is.

### 0013 A component is promoted on evidence, not on taste

_2026-09-05. Implemented as Callout, Divider, EmptyState, Popover, Tabs and Tooltip._

A component joins haus when products that consume it have built it more than once, independently,
not because other systems ship it. The three products were measured for tablists, popups, listboxes,
tooltips, empty states and callouts. Reading the implementations found an accessibility defect in four
of six cases, none flagged by axe, and each became a prop: `live`, `triggerRef`, the panel `Tabs`
renders. One product's answer to one product's problem, such as `Drawer` or `CommandPalette`, stays
out.

### 0014 The brand contract is tiered

_2026-09-08. Implemented._

The base tier, 28 entries for surfaces, ink, borders, primary and the backdrop, is required. The
feedback tier, 26 entries across `info`, `success`, `warning` and `error`, is optional, all or nothing
per ramp. core's statuses are decision states, not notification severities, so it could supply 14 of
54 honestly and could not be a brand at all. The cascade already handled an omitted ramp; only the
type and the test demanded all 54. Half a ramp renders an error state in two unrelated colours with
every `var()` resolving, so it fails.

### 0015 A brand states form as well as colour

_2026-09-08. Implemented._

The form tier is radius and elevation, optional and all or nothing per group. What makes two products
look different is colour, typeface, shadow and corner radius, not spacing or stacking. drift appeared
to re-decide nineteen non-colour roles; measured against the version it installs, twelve were the
literal haus already gives and two were version skew, leaving five real departures. z-index, opacity,
border width and the space ladder stay out. `radius-pill` stays out because "as round as the box
allows" is not a step.

### 0016 A restated value is a copy, and the package says so

_2026-09-08. Implemented as `findRestatedTokens` in `haus-tokens/guard`._

A consumer declaring a property haus already declares, at the value haus gives, has a copy that is
wrong the day either side moves. The guard reports each one as `identical`, the same text, or
`resolved`, different text and the same value, which is how a consumer opts out of a scale while
appearing to be on it. Run against drift it found the 89 counted by hand, 77 and 12. vault had written
a text-only version of the rule by hand; a guard that lives in one consumer is a habit.

### 0017 The nineteenth component is a busy indicator

_2026-09-08. Implemented as Spinner._

Swept by behaviour rather than filename, a busy indicator was built three times at seven call sites:
core's announced nothing deliberately, drift hid it outright, vault's was correct. Building `Spinner`
found that a loading Button never set `aria-busy`, though its test name claimed it did. A disclosure
also appeared in all three products and was not promoted: what they share is a rule, not a component.

### 0018 vault's twenty local tokens, settled one at a time

_2026-09-08. Implemented on both sides._

vault kept 20 local properties after adopting the token layer, the clearest evidence of what haus
lacked. Thirteen stay vault's, each with a reason. Modal widths became a form-tier brand group, since
two products disagree and both are right. Widening the hardcoded-value rule to `width` and `height`
found ten literals inside haus, each now named. vault's `--type-title-*` was `heading-lg` with two
properties changed, so it became a fork. `--control-height-xs` later came into haus with IconButton.

### 0019 Typeface is a form-tier brand entry, and moving it is a major

_2026-09-08. Implemented in haus-tokens 3.0.0._

`--haus-brand-font-sans` and `-mono` join the form tier, and `--haus-font-sans` becomes a role reading
them, so no component read moved. vault uses Manrope, drift `system-ui` and core Gabarito. For a
consumer importing `primitives.css` alone the move is a removal, so under 0004 it was a major.

### 0020 Listbox and Select both stay

_2026-09-08. Superseded by 0025._

`Listbox` shipped for themed popups and options with more than a label, and the native `Select` stayed
for the cases 0011 named, with its lack of consumers recorded rather than left implicit. Two releases
later it still had none.

### 0021 A product's domain states spend Badge's tones

_2026-09-08. Implemented; core adopted it._

core's six decision states map onto Badge's tones with no new token: draft neutral, proposed info,
accepted success, rejected error, deprecated warning, superseded primary. Superseded is replaced but
still valid, so it takes a slot that is distinct without alarm. The earlier ruling counted six states
against five tones and missed that tone and appearance make twelve slots. A product with a seventh
state gets a local component, not a seventh tone.

### 0022 Ownership is stated, in both directions

_2026-09-09. Implemented on Button, IconButton, Card and Tabs._

A component owns its box, never its element: one that renders an interactive element ships `asChild`
rather than a closed `as` union. A component owns a subtree only if it owns every part, so `Tabs`
takes a `panelId` when the panel lives elsewhere. A consumer owns the cascade, the layout and the
router's element, and a reset must be layered too. Every case was found by a consumer. `asChild` goes
where a consumer needs it, not on every component, since each one widens the Server Component surface.

### 0023 A union prop type exports its halves

_2026-09-09. Implemented on Button, IconButton, Card and Tabs._

A union prop type exports each half by name, `<Component>OwnProps` and `<Component>AsChildProps`, and
the union is written from them. `ButtonProps` as a union broke every wrapper, and core reached for
`Extract<ButtonProps, { asChild?: false }>`, a type every consumer would otherwise rewrite. Widening
`children` on the `asChild` half was rejected: it deletes the constraint the union expresses.

### 0024 The RSC path is guarded by its rule, not by a harness

_2026-09-09. Implemented as `rsc-rules.test.tsx`._

haus ships no `use client`, so a Server Component can render a component directly, and `<Button
asChild>` threw because `mergeRefs` attached a ref nobody passed. The test asserts the rule: render
each `asChild` component with no ref and fail if one arrives. A real Server Component harness would
catch more, at the cost of a dependency and a build wrinkle, and the whole known failure surface was
one mechanism. A third defect it misses is the evidence for the harness.

### 0025 Select is the themed control, and the native select is retired

_2026-09-10. Supersedes 0011 and 0020._

The native `<select>` component is retired and `Listbox` is renamed `Select`, the one picker haus
ships. Nothing had imported the native one in two releases, and the thing a consumer imports to choose
one of a set is called a select. A major version; haus is twenty components.

### 0026 A type role binds all four of its properties in Figma

_2026-09-11. Implemented in the Figma file._

Each type role has four Figma variables, size, weight, line height and letter spacing, and each text
style binds all four. Line height and letter spacing hold pixels for that role, because a Figma number
has no unit and a shared ratio means something different in px and percent. Typed values were
unchecked, which is how a component took two of a role's properties and invented the other two.

### 0027 Mono is a ladder, not a role

_2026-09-13. Implemented in haus-tokens 5.2.0._

Mono is three roles, `mono-xs`, `mono-sm` and `mono-md`, at 11, 12 and 13px, with leading that loosens
as size grows. vault read the mono font in 21 places at those three sizes and took none of the single
13px role, because the sizes do different jobs. `--haus-type-mono-*` stays as `mono-md`'s alias, so
nothing moves on screen.

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
