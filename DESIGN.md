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
[decision 0014](#0014-brand-contract-tiers). Figma holds the same tokens as four variable collections, counted from the committed snapshot:
`haus/primitives` (140), `haus/semantics` (175) with one mode per shipped brand, `haus/theme` (54)
for light and dark, and `haus/motion` (27) in its three modes.

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
separate brand layer in [decision 0003](#0003-brand-and-role-layers),
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
[0003](#0003-brand-and-role-layers) (the brand layer),
[0014](#0014-brand-contract-tiers) (the tiers),
[0015](#0015-brand-form-tier) (form) and
[0019](#0019-typeface-in-the-brand) (typeface).
[0016](#0016-restated-values) covers a consumer
that overrides a role to the value haus already gives.

### Theme

**Decision.** Light and dark. `brand-dark.css` restates haus's colour roles for dark, applied by
`data-theme="dark"` on the root or by `prefers-color-scheme: dark` when the root has no
`data-theme`. The product brands, vault and core, stay light. [Decision 0028](#0028-dark-theme).

**Reason.** A dark theme inverts surface polarity, so it cannot arrive as a brand
([0002](#0002-surface-polarity)). It arrives as a second colour map of the same roles instead, and
every surface and ink pair `contrast.test.ts` checks is measured in both maps.

**Alternatives.** A `light-dark()` value in each role. Not taken: it changes every line of
`brand.css`, which `BrandMap` and `tokens.json` are generated from, and a custom property holding
`light-dark()` resolves where it is used, so a light-only brand inside a dark page would need its
own `color-scheme` on every element.

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
[decision 0027](#0027-mono-ladder). In Figma a text style that bound
only size and weight drifted the same way, settled in
[decision 0026](#0026-type-roles-in-figma).

## Components

Avatar, Badge, Button, Callout, Card, Checkbox, Divider, EmptyState, IconButton, Input, Modal,
Popover, RadioGroup, Select, Spinner, Tabs, Textarea, Toast, Toggle and Tooltip. Each has a story in
the [live Storybook](https://haus.hipuku.dev) and a page in the Figma file.

### Scope

**Decision.** Twenty components, and a component joins only when products that consume haus have
each built it independently.

**Reason.** Promotion on evidence keeps haus to what more than one product needed, rather than to the
list other design systems carry. [Decision 0013](#0013-component-promotion)
sets the rule and [0017](#0017-busy-indicator) applies
it to Spinner.

### Styling

**Decision.** Component styles are CSS Modules, compiled into one stylesheet that declares its own
cascade layer, `haus.components`, and written in logical properties.

**Reason.** The token layer is plain custom properties, so a consumer can use Tailwind, plain CSS or
CSS-in-JS against it; CSS Modules keep the component styles off any consumer's build tooling and
readable without a utility vocabulary. The layer lets a consumer's unlayered CSS win without a
specificity fight ([0006](#0006-component-stylesheet-layer)), and logical
properties make the components correct right to left
([0010](#0010-logical-properties)).

**Alternatives.** Tailwind for the components. Not taken: it would couple haus to one consumer
toolchain and make each component's styles depend on Tailwind's class names.

### Props

**Decision.** The props follow one set of rules across the package:

- `variant` is visual weight, `tone` is meaning, `appearance` is fill
  ([0005](#0005-variant-and-tone)), and a tone rule only remaps
  custom properties ([0012](#0012-tone-rules)).
- `className` lands on the root element; a second target is a named prop
  ([0009](#0009-where-classname-lands)).
- A component owns its box, never the caller's element, and says so
  ([0022](#0022-ownership)).
- A union prop type exports each half by name
  ([0023](#0023-union-prop-type-halves)).

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
([0001](#0001-focus-indicator)), and every ring has a
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

| Subject           | Decisions                                                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens and brands | [0002](#0002-surface-polarity), [0003](#0003-brand-and-role-layers), [0014](#0014-brand-contract-tiers), [0015](#0015-brand-form-tier), [0016](#0016-restated-values), [0018](#0018-vaults-local-tokens), [0019](#0019-typeface-in-the-brand), [0028](#0028-dark-theme) |
| Typography        | [0026](#0026-type-roles-in-figma), [0027](#0027-mono-ladder)                                                                                                                                                                                                            |
| Components        | [0008](#0008-toast-scope), [0011](#0011-native-select), [0013](#0013-component-promotion), [0017](#0017-busy-indicator), [0020](#0020-listbox-and-select), [0021](#0021-domain-states-as-badge-tones), [0025](#0025-themed-select)                                      |
| Component API     | [0005](#0005-variant-and-tone), [0009](#0009-where-classname-lands), [0012](#0012-tone-rules), [0022](#0022-ownership), [0023](#0023-union-prop-type-halves)                                                                                                            |
| Styling and focus | [0001](#0001-focus-indicator), [0006](#0006-component-stylesheet-layer), [0010](#0010-logical-properties), [0029](#0029-first-line-control-alignment)                                                                                                                   |
| Packaging         | [0004](#0004-versioning), [0007](#0007-meta-package), [0024](#0024-server-component-guard)                                                                                                                                                                              |

A choice worth recording, one a reviewer would otherwise reopen, gets the next number here.

### 0001 Focus indicator

_2026-09-01. Implemented._

The focus indicator is `0 0 0 2px <surface>, 0 0 0 4px <focus>` everywhere: a band of the element's
own backdrop, then the accent at full strength. Three treatments existed across the products, and
only this one met WCAG 1.4.11: core's 2px outline at 32% alpha measured 1.60:1 against its page, and
a soft halo's strongest pixel is not its measured contrast. Forced-colours mode drops box shadows, so
every ring has an `outline` fallback in `Highlight`. The cost is room: a 4px ring crowds a full-width
input, which is why the text controls change their border instead.

### 0002 Surface polarity

_2026-09-01. Implemented._

White cards on a subtle page, and a brand cannot invert it. Every surface role is paired with the ink
that is safe on it, which is what makes contrast decidable once at the token layer; a brand that
inverted polarity would invert the pairings consumers rely on. core inverted it, so its adoption
included a visual re-tune. The cost, stated plainly: there is no dark mode through the brand map. A
dark theme would be a second contract, or this decision reopened. It became a second map of the same
roles in [0028](#0028-dark-theme); polarity inside each mode is unchanged.

### 0003 Brand and role layers

_2026-09-01. Implemented._

The brand map is its own cascade layer, every property is prefixed `--haus-`, a brand is scoped by
`data-haus-theme`, and a generated `BrandMap` type says what a brand must supply. Before this, every
token sat unprefixed on a bare `:root` and collided with a consumer's Tailwind. vault declared 159
properties of its own and core 56, but the roles were not what they rejected: of vault's 40 differing
values, about thirty were palette swaps. The brand was the part that could not move. Breaking, so it
landed with the 1.x cut.

### 0004 Versioning

_2026-09-01. Implemented at 1.0.0._

Every package is 1.x so the caret works: under 0.x a minor is treated as breaking, and
`haus-colour-utils` 0.3.0 sat unshipped because both consumers were pinned to `^0.2.1`. Two rules
carry the weight: a token rename is a major at an identical value, and a contrast change is a major
however little the hex moves. A token's name and its measured contrast are both contract.

### 0005 Variant and tone

_2026-09-01. Implemented._

`variant` is visual weight only. `tone` is `neutral | info | success | warning | error` everywhere,
with `danger` renamed `error`. `appearance` is `subtle | solid`, Button's `external` is its own prop,
and sizes converge on `sm | md | lg`, with Avatar's `xs` and `xl` a documented extension. Badge also
takes `primary`, which 0021 spends on the superseded state. `variant`
had meant weight on Button, elevation on Card and semantics on Badge. It renamed props across most of
the library, so it shipped in the same major as the token split.

### 0006 Component stylesheet layer

_2026-09-01. Implemented._

`haus-components/styles.css` declares its own cascade layer, so a consumer's CSS wins without a
specificity fight instead of depending on import order. A function consumers call and a shipped
Stylelint config were the alternatives; only the layer makes the package state its own precedence.
It was breaking for anyone relying on source order, and was done while drift was the only consumer of
the component tier, when it cost least.

### 0007 Meta-package

_2026-09-01. Implemented by doing nothing._

No `haus` package bundling the others at exact versions. The convenience was mostly the caret problem
that 0004 already fixed, and a meta-package would add a sixth package to release and a second place
each version is stated. One bundled version would also claim the tiers cannot release independently,
which is not true of the architecture.

### 0008 Toast scope

_2026-09-01. Implemented._

Toast ships the surface. The provider, queue, positioning, auto-dismiss and stacking are the
consumer's, and `Toast.tsx` says so in its own documentation. A toast system owns global state, a
portal and a policy about how many notices stack for how long, which is an application's opinion.
Re-measured on 2026-09-08, only core has toasts at all, so a provider would have one consumer and fail 0013. core keeps sonner and renders haus's surface through `toast.custom`.

### 0009 Where className lands

_2026-09-01. Implemented._

`className` goes on the root element of every component, and a component that needs a second target
gets a named prop for it. It had landed on six different nodes, and Checkbox's outer div was
unreachable by any means. Documenting the existing placement was rejected on that case: a convention
that has to describe a defect is not worth writing down. `api-surface.test.tsx` holds it.

### 0010 Logical properties

_2026-09-01. Implemented._

Inline-axis declarations use logical properties, so a right-to-left document flips them; 27
declarations across ten components had pointed the wrong way. `translateX` has no logical form, so a
sliding element carries its travel and direction as variables and a `[dir='rtl']` rule flips the sign.
No public name changed. `logical-properties.test.ts` asserts the source, because the component tests
run without CSS; a right-to-left visual test is still open.

### 0011 Native Select

_2026-09-02. Superseded by 0025._

`Select` rendered a real `<select>` with a themed closed state and the operating system's popup. The
platform gives correct keyboard handling, a wheel picker on iOS and assistive-technology behaviour for
free. The cost was the whole finding: both consumers needed a themed list, built their own, and the
system shipped the one picker neither used. The reasoning survives as guidance for when a raw
`<select>` is the better answer: touch, forms that must work without JavaScript, very long lists.

### 0012 Tone rules

_2026-09-03. Implemented on Button, Toast and Badge._

A tone rule may remap custom properties and declare nothing else, and a variant rule reads the subset
its weight needs. Button's tone rules had set colours outright, so `variant="ghost" tone="error"`
rendered solid. Neutral is a tone, and a component narrows `Tone` only where the roles genuinely do
not exist. `stylesheet.test.ts` fails any tone rule that declares a non-custom property. The cost is
indirection: `.primary` no longer says what colour it is.

Badge reached it last, in the release-debt pass. Its twelve `.tone.appearance` compounds were not
caught by the test, which skips a compound because it already names both things and cannot be
outvoted on source order, and that is why they survived: the rule was enforced and the shape was
still wrong. Six tone rules remap four properties and the two appearance rules read the pair their
weight needs, so a new weight is one rule rather than six.

### 0013 Component promotion

_2026-09-05. Implemented as Callout, Divider, EmptyState, Popover, Tabs and Tooltip._

A component joins haus when products that consume it have built it more than once, independently,
not because other systems ship it. The three products were measured for tablists, popups, listboxes,
tooltips, empty states and callouts. Reading the implementations found an accessibility defect in four
of six cases, none flagged by axe, and each became a prop: `live`, `triggerRef`, the panel `Tabs`
renders. One product's answer to one product's problem, such as `Drawer` or `CommandPalette`, stays
out.

### 0014 Brand contract tiers

_2026-09-08. Implemented._

The base tier, 28 entries for surfaces, ink, borders, primary and the backdrop, is required. The
feedback tier, 26 entries across `info`, `success`, `warning` and `error`, is optional, all or nothing
per ramp. core's statuses are decision states, not notification severities, so it could supply 14 of
54 honestly and could not be a brand at all. The cascade already handled an omitted ramp; only the
type and the test demanded all 54. Half a ramp renders an error state in two unrelated colours with
every `var()` resolving, so it fails.

### 0015 Brand form tier

_2026-09-08. Implemented._

The form tier is radius and elevation, optional and all or nothing per group. What makes two products
look different is colour, typeface, shadow and corner radius, not spacing or stacking. drift appeared
to re-decide nineteen non-colour roles; measured against the version it installs, twelve were the
literal haus already gives and two were version skew, leaving five real departures. z-index, opacity,
border width and the space ladder stay out. `radius-pill` stays out because "as round as the box
allows" is not a step.

### 0016 Restated values

_2026-09-08. Implemented as `findRestatedTokens` in `haus-tokens/guard`._

A consumer declaring a property haus already declares, at the value haus gives, has a copy that is
wrong the day either side moves. The guard reports each one as `identical`, the same text, or
`resolved`, different text and the same value, which is how a consumer opts out of a scale while
appearing to be on it. Run against drift it found the 89 counted by hand, 77 and 12. vault had written
a text-only version of the rule by hand; a guard that lives in one consumer is a habit.

### 0017 Busy indicator

_2026-09-08. Implemented as Spinner._

Swept by behaviour rather than filename, a busy indicator was built three times at seven call sites:
core's announced nothing deliberately, drift hid it outright, vault's was correct. Building `Spinner`
found that a loading Button never set `aria-busy`, though its test name claimed it did. A disclosure
also appeared in all three products and was not promoted: what they share is a rule, not a component.

### 0018 vault's local tokens

_2026-09-08. Implemented on both sides._

vault kept 20 local properties after adopting the token layer, the clearest evidence of what haus
lacked. Thirteen stay vault's, each with a reason. Modal widths became a form-tier brand group, since
two products disagree and both are right. Widening the hardcoded-value rule to `width` and `height`
found ten literals inside haus, each now named. vault's `--type-title-*` was `heading-lg` with two
properties changed, so it became a fork. `--control-height-xs` later came into haus with IconButton.

### 0019 Typeface in the brand

_2026-09-08. Implemented in haus-tokens 3.0.0._

`--haus-brand-font-sans` and `-mono` join the form tier, and `--haus-font-sans` becomes a role reading
them, so no component read moved. vault uses Manrope, drift `system-ui` and core Gabarito. For a
consumer importing `primitives.css` alone the move is a removal, so under 0004 it was a major.

### 0020 Listbox and Select

_2026-09-08. Superseded by 0025._

`Listbox` shipped for themed popups and options with more than a label, and the native `Select` stayed
for the cases 0011 named, with its lack of consumers recorded rather than left implicit. Two releases
later it still had none.

### 0021 Domain states as Badge tones

_2026-09-08. Implemented; core adopted it._

core's six decision states map onto Badge's tones with no new token: draft neutral, proposed info,
accepted success, rejected error, deprecated warning, superseded primary. Superseded is replaced but
still valid, so it takes a slot that is distinct without alarm. The earlier ruling counted six states
against five tones and missed that tone and appearance make twelve slots. A product with a seventh
state gets a local component, not a seventh tone.

### 0022 Ownership

_2026-09-09. Implemented on Button, IconButton, Card and Tabs._

A component owns its box, never its element: one that renders an interactive element ships `asChild`
rather than a closed `as` union. A component owns a subtree only if it owns every part, so `Tabs`
takes a `panelId` when the panel lives elsewhere. A consumer owns the cascade, the layout and the
router's element, and a reset must be layered too. Every case was found by a consumer. `asChild` goes
where a consumer needs it, not on every component, since each one widens the Server Component surface.

### 0023 Union prop type halves

_2026-09-09. Implemented on Button, IconButton, Card and Tabs._

A union prop type exports each half by name, and the union is written from them. For an `asChild`
union the halves are `<Component>OwnProps` and `<Component>AsChildProps`; Tabs names its panel union
`TabsOwnPanelProps` and `TabsRemotePanelProps`. `ButtonProps` as a union broke every wrapper, and core reached for
`Extract<ButtonProps, { asChild?: false }>`, a type every consumer would otherwise rewrite. Widening
`children` on the `asChild` half was rejected: it deletes the constraint the union expresses.

### 0024 Server Component guard

_2026-09-09. Implemented as `rsc-rules.test.tsx`._

haus ships no `use client`, so a Server Component can render a component directly, and `<Button
asChild>` threw because `mergeRefs` attached a ref nobody passed. The test asserts the rule: render
each `asChild` component with no ref and fail if one arrives. A real Server Component harness would
catch more, at the cost of a dependency and a build wrinkle, and the whole known failure surface was
one mechanism. A third defect it misses is the evidence for the harness.

### 0025 Themed Select

_2026-09-10. Supersedes 0011 and 0020._

The native `<select>` component is retired and `Listbox` is renamed `Select`, the one picker haus
ships. Nothing had imported the native one in two releases, and the thing a consumer imports to choose
one of a set is called a select. A major version; haus is twenty components.

### 0026 Type roles in Figma

_2026-09-11. Implemented in the Figma file._

Each type role has four Figma variables, size, weight, line height and letter spacing, and each text
style binds all four. Line height and letter spacing hold pixels for that role, because a Figma number
has no unit and a shared ratio means something different in px and percent. Typed values were
unchecked, which is how a component took two of a role's properties and invented the other two.

### 0027 Mono ladder

_2026-09-13. Implemented in haus-tokens 5.2.0._

Mono is three roles, `mono-xs`, `mono-sm` and `mono-md`, at 11, 12 and 13px, with leading that loosens
as size grows. vault read the mono font in 21 places at those three sizes and took none of the single
13px role, because the sizes do different jobs. `--haus-type-mono-*` stays as `mono-md`'s alias, so
nothing moves on screen.

### 0028 Dark theme

_2026-11-23. Implemented in the tokens; components not yet checked one by one._

haus has a dark mode: `brand-dark.css` gives every colour role a dark value, and form roles (radius,
elevation, widths, type) are the same in both modes. `data-theme="dark"` or `"light"` on the root
forces a mode; without it, `prefers-color-scheme` decides. In dark, the status ramps run the other
way: subtle fills from 900, their text from 200, emphasis from 200 under dark ink. Dark ink on
elderberry-500 measured 4.04:1 and on cherry-500 4.32:1, so each status ramp gained a 400 step for
the dark default fill, all four for the same ramp shape. The page is damson-900 rather than the
darker 950, so sunken stays below the page as it does in light. vault and core stay light: the dark
rules skip a root naming a brand, and `brand.css` sets haus's light values at zero specificity on
every `[data-haus-theme]` element, so core, which supplies only the base tier, cannot inherit dark
status colours. The cost is a second map to keep in step, held by `brand.test.ts` (every colour role,
both selectors identical) and by `contrast.test.ts` running every pair in both modes.

### 0029 First-line control alignment

_2026-11-24. Implemented._

A control that sits beside text is centred on the first line of that text, from the type role's
size and leading, rather than nudged by a literal. Five components did it with a `margin-block-start`
of 1px, 2px or -2px: Checkbox, Radio, Toggle, Callout and Modal. Each was measured against Manrope
at one size, so it was wrong at any other size, on any other typeface, and at any other density,
and nothing in the repository would have reported it. The offset is now the line box less the box
it centres, both read from tokens.

The cost is that the box can no longer be a step of the space ladder, because a margin may not read
that ladder (`tokens.test.ts`): Checkbox and Radio took `--haus-marker-box` and Toggle
`--haus-toggle-track-height`, which is the more honest name anyway. Alternatives rejected: `1lh`,
which is the same arithmetic but resolves against whatever font the element itself inherited, and
which is wrong wherever the label sets the type and the box does not; and aligning on cap height,
which is the more accurate centre and needs a typeface metric no token holds.

### 0030 The DM typeface

_2026-11-24. Implemented in the tokens; the Figma file follows in the same pull request._

The default brand sets **DM Sans** for the interface and **DM Mono** for monospace, replacing
Manrope and Fira Code. Chosen by the owner from the family's own specimen. DM Sans is variable on
two axes, weight 100 to 1000 and optical size 9 to 40, so the whole ladder is one file and the
optical axis follows the size each role sets, which Manrope's single axis could not do. DM Mono
ships 300, 400 and 500 as static files and all three mono roles are regular, so one is loaded.

**No serif role.** The specimen also holds DM Serif Display and DM Serif Text. No product here has
a use for a serif, and a role nothing reads is a role that drifts out of true without anything
reporting it. A serif belongs to a marketing surface, which is not this contract.

Only `--haus-brand-font-sans` and `--haus-brand-font-mono` change, so `--haus-font-sans` and
`--haus-font-mono` keep their names and no component read moved; it is breaking because a consumer
loading Manrope gets a fallback until it loads the new faces. vault keeps Manrope in its own brand
file, which is decision 0019 working as intended.

The cost is that the two faces do not share metrics, so text at the same size and leading does not
occupy the same room, and anything tuned to the old face has to be read again at its real size.
The five optical nudges came out first for exactly this reason (decision 0029): they were Manrope's
measurements written into five components. The Typography section above still describes the old
pair and is corrected in the documentation pass.

### 0031 Control edge contrast

_2026-11-24. Implemented._

A control whose boundary is its only edge draws that edge with `--haus-color-border-control`, which
measures at least 3:1 against both the default surface and the subtle one, in light and in dark.
WCAG 1.4.11 asks for 3:1 from the parts of a component that say where it is, and Input, Textarea
and Select drew theirs with `border-default` at 1.23:1 while Checkbox, Radio and the Toggle track
used `border-strong` at 1.53:1. `contrast.test.ts` measured no border at all, so nothing reported
it; `DESIGN.md` listed it as a known gap instead.

It is a new role rather than a change to `border-default`, because 1.4.11 is about controls and
not about every line in the system: moving `border-default` would darken cards, dividers and table
rules to make a checkbox legible. Both brand maps take damson-500 for it, which is the first rung
that clears 3:1 from either direction, and the shipped brands take their own: vault damson-500,
core paper-600 at 3.93:1, where core's own `--border-strong` is 1.57:1.

**`--haus-color-ink-placeholder` came out of the same measurement.** `ink-tertiary` is 3.97:1 on
the default surface: sound for the glyphs and the hover fill it carries, and never safe for the
words in an empty field, which are text and want 4.5:1. The two jobs are two roles now. A
placeholder takes damson-600 at 6.55:1 and stays lighter than a real value, which is the thing the
colour exists to say. Select's option hint moved to `ink-secondary`, because a hint is text and
was never a glyph. Both roles are base-tier brand entries, so the base tier is 30 rather than 28
and a brand file that omits one fails `brand.test.ts`.

The cost is visible: every field, checkbox, radio and toggle has a darker edge than it did, and a
placeholder is darker than it was. That is the point, and it is the kind of change the screenshot
suite exists to show, which it did, in 43 stories across both modes.

## Known gaps

- **Dark mode is not checked component by component.** The token pairs are measured in both modes;
  a component that pairs roles outside those pairs is not, and nothing runs axe against a rendered
  dark story in CI. The Storybook toolbar switches mode for a manual check.
- **No screen reader run.** The accessibility checks are automated; they cover the markup, not the
  experience of using it.
- **No right-to-left visual test.** The components are written in logical properties and a source
  test holds them there, but nothing renders one right to left under a visual diff.
- **Scope stops at tokens, components and Storybook.** There is no MCP server and no Figma Code
  Connect integration.
