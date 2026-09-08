# Changelog

Five packages, released independently. Entries are grouped by package, newest
first, and only cover what a consumer sees: an internal refactor with no
observable effect does not appear here.

This file starts at Unreleased. **The releases before it have no entries, and
that is the honest position.** `haus-components` went 0.2.0 to 0.4.0 with a
breaking change in between and nothing recorded it, so reconstructing those
notes now would mean inventing them from commit messages written for a different
purpose. Everything from here is written as it lands.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [decision 0004](docs/decisions/0004-versioning-is-1-x.md): a
token rename is a major at an identical value, and a contrast change is a major
even when the hex barely moves.

## Unreleased

### haus-components

Held back deliberately. `Spinner` and the `Button` `aria-busy` fix are on `main`
and unpublished, because `Modal` now reads `--haus-modal-width-*` and so this
package requires `haus-tokens@^2.1.0` where the published 1.0.0 requires
`^1.0.0`. Raising a dependency across a major is breaking for a consumer, so the
next `haus-components` is a **2.0.0** rather than a 1.1.0, and that is a decision
rather than a side effect of shipping tokens.

#### What is waiting

**Added** · `Spinner`, the nineteenth component, `haus#55`,
[decision 0017](docs/decisions/0017-the-nineteenth-component-is-a-busy-indicator.md).
Promoted on evidence: all three products built one and haus's own Button held a
fourth, and the four gave three different answers to whether the wait is
announced.

`label` announces by default. **`announcedBy` takes the text that speaks instead
of a boolean**, so silencing the spinner requires naming what covers it: every
product that got this wrong got it wrong by hiding the ring and putting nothing
in its place.

**Fixed** · **A loading `Button` never set `aria-busy`**, so it was announced
exactly as a permanently disabled one: *"Saving, dimmed"*, with nothing to say
the wait was temporary. Its own test had been named *"disables and marks itself
busy while loading"* since it was written and asserted only `disabled` and
`aria-disabled`. Button now sets `aria-busy` and draws with `Spinner` rather than
its own copy.

The 1.0 cut. Everything below is breaking, deliberately, and lands in one major
rather than two so a consumer migrates once.

---

## haus-tokens 2.1.0

*2026-09-08. Additive throughout: every 54-entry brand still satisfies the
contract, no value moved, and nothing renders differently.*

**Added** · The brand contract is tiered, `haus#52`, [decision 0014](docs/decisions/0014-the-brand-contract-is-tiered.md).
`brand.css`'s 54 entries split into a required base of 28 (surfaces, ink, borders,
primary, backdrop) and an optional feedback tier of 26 (`info`, `success`,
`warning`, `error`). A brand may now supply the base alone and inherit the rest
from `:root`, which the cascade already did and the contract previously forbade.
`BrandMap` becomes `BrandMapBase & Partial<BrandMapFeedback>`, and
`brandRolesBase` and `brandRolesFeedback` are exported beside `brandRoles`.

`brand.test.ts` gains the rule the types cannot express: a brand supplying any
entry of a status ramp supplies all of that ramp, because a half-supplied ramp
renders in two hues with every `var()` resolving and no check firing.

**Not breaking.** Every 54-entry brand still satisfies the contract, so `vault`
and any consumer brand keep working unchanged. No value moved.

**Added** · A brand states form as well as colour, `haus#53`, [decision 0015](docs/decisions/0015-a-brand-states-form-not-only-colour.md).
A third tier of 7 optional entries: `radius` (control, surface, overlay, marker)
and `elevation` (raised, floating, overlay). `BrandMap` gains
`Partial<BrandMapForm>` and `brandRolesForm` is exported.

Short on purpose. drift appeared to carry 19 non-colour departures; measured
against the version it installs, 12 hardcode the literal a haus primitive already
resolves to and 2 were version skew, leaving 5. So z-index, opacity, border-width
and the space ladder are deliberately not brandable: nobody re-decides them.

**Not breaking, and nothing renders differently.** All seven roles resolve through
the new entries to the primitives they read before, checked by walking the chain.
`vault.css` supplies none of the tier and passes, because none is a legal amount.

**Added** · `findRestatedTokens` in `haus-tokens/guard`, `haus#53`,
[decision 0016](docs/decisions/0016-a-restated-value-is-a-copy-and-the-package-says-so.md).
Reports every declaration a consumer makes that this package already ships,
tagged `identical` (the same text) or `resolved` (different text, same value once
`var()` chains are followed).

The second tag is the one a text comparison cannot see: `--haus-z-modal: 400`
against `var(--haus-z-400)`, where `--haus-z-400` is `400`. That is how a
consumer opts out of a scale while appearing to be on it.

vault wrote this rule by hand after `vault#25` and drift never got it, so it
ships from the package now. Run against drift it reproduces, independently, the
89 arrived at by hand: 77 identical, 12 resolved.

Pure, like the rest of the guard: it takes CSS as strings and reads no files.

**Added** · Modal widths become a form-tier brand group, `haus#53`,
[decision 0018](docs/decisions/0018-vaults-twenty-are-settled-one-at-a-time.md).
`--haus-brand-modal-width-sm|md|lg`, taking the form tier from 7 entries to 10,
plus the `overlayWidth` and `size` primitive groups and the roles
`--haus-toast-width`, `--haus-toggle-track-width` and `--haus-marker-dot`.

**Fixed** · `width`, `height`, `max-width`, `min-width` and `max-height` join the
hardcoded-value rule, which listed `min-height` and not `width`: the blind spot
`haus#43` named for icon sizes. It found ten literals, including Modal's three
widths sitting inside a design system whose CI fails on a hardcoded value.

**Nothing renders differently.** Every converted value was checked rather than
assumed: `25rem` is `400px`, `22.5rem` is `360px`, `0.375rem` is `6px`.

### `haus-tokens`, breaking

- **Every custom property carries `--haus-`.** `--space-4` is
  `--haus-space-4`, at every layer including primitives. Unprefixed they sat in
  the global namespace, where a consumer running Tailwind collides with them.
- **The brand is a separate layer.** `brand.css` holds which primitive each role
  takes and nothing else; `semantics.css` keeps the role vocabulary and names no
  palette. Replacing `brand.css` is how you theme.
- **Roles are declared on `:root, [data-haus-theme]`.** A named brand applies at
  `[data-haus-theme="<name>"]` and nests.
- Added: `index.css`, the four files in the right order; `layers.css`, the
  cascade order declared once; `brands/vault.css`, a complete second brand;
  `BrandMap` and `brandRoles`, generated from `brand.css`.
- **`--haus-color-ink-on-aronia` is `--haus-color-ink-on-primary`**, and so is
  the `--haus-brand-` entry behind it. A role named the palette it sat on, which
  is the one thing `semantics.css` is not allowed to do. The test that enforces
  that rule carried an exemption for this property; the exemption is gone.
- **The second brand's ramp is `--haus-ruby-*`, not `--ruby-*`.** Ten steps, the
  only unprefixed custom properties left in the system. An unprefixed
  `--ruby-500` collides with a consumer running Tailwind, which is why the
  prefix exists at all.
- **The theme is `vault`, not `ruby`**, and the file is `brands/vault.css`.
  `<div data-haus-theme="vault">`. The brand is a shipped product's rather than
  an invention, and the attribute now says so. The **ramp keeps the name
  `ruby`**: brand answers whose, ramp answers which colour, and vault ships six
  gemstone ramps, so `--haus-vault-500` would claim it has one.
- **`--haus-shadow-focus` is `--haus-focus-ring`**, and `-error` with it. A role
  named its mechanism rather than its job: it is a focus ring, and box-shadow is
  merely how it is drawn, the way `--haus-elevation-floating` is not called
  `shadow-lg`. Ten components read it.
- **Stacking, border width and opacity have a role layer** (`haus#27`).
  `primitives.css` holds the ladders and nothing else: `--haus-z-0` through
  `--haus-z-600`, `--haus-border-width-1` and `-2`, `--haus-opacity-40` and
  `-60`. `semantics.css` holds the names, unchanged: `--haus-z-modal`,
  `--haus-border-width-default`, `--haus-opacity-disabled` and the rest.
  **A consumer reading a role name needs no change**: the same twelve names
  resolve, one layer higher. Breaking only if you read the *primitive*, which
  until now was the only way to get the stacking order at all, and is why drift
  and vault each settled one themselves. The JS export's keys move with it:
  `tokens.zIndex.modal` is `tokens.zIndex['400']`, and the role is CSS-side.
- **Removed: the `400` step in all four status ramps** (`haus#35`). cherry,
  mango, greengage and elderberry each declared one, `primitives.css`
  documented every one as "Icon on subtle background", and no role consumed
  any of them. The reason nothing consumed them is that the documented use
  fails: measured against its own `100` background, `400` clears 2.20:1,
  2.01:1, 1.95:1 and 2.20:1, and WCAG 1.4.11 wants 3:1 for non-text UI.
  `Callout` draws exactly that, a tone icon on a subtle background, and it
  reaches for `-on-subtle`, the `700`, which lands between 6.31:1 and 8.01:1.
  The component was right and the comment was wrong. Status ramps are
  `100 · 200 · 500 · 700 · 900` now, and every step has a consumer.
- Added: `--haus-aronia-850`, `oklch(22% 0.066 300)`. It existed in the Figma
  library and in neither `tokens.json` nor `primitives.css`. Promoted rather
  than deleted, at the ramp's own convention rather than Figma's float noise.
- Added: a `require` condition and a `./package.json` export.
- **Button takes all five tones.** `ButtonTone` was `neutral | error`; it is the
  whole `Tone` union now, and every tone composes with every weight. Widening a
  union is not itself breaking, but it is listed here because the colours a
  toned Button paints are new and Chromatic will treat them as such.
- Fixed: `controlHeight` reaches the JS export, which it never did.

### `haus-components`, breaking

- **`variant` is visual weight only.** Badge and Toast take `tone`; Button takes
  `variant` for weight, `tone` for meaning, and `external` as its own prop.
  `danger` is `tone="error"`. The old type names remain as deprecated aliases.
- **Toast takes `appearance`, and `tone="neutral"` is now tinted.** It always had
  two appearances and no word for them: `neutral` painted a dark solid surface
  while the other four painted tinted ones, so which you got was decided by the
  tone you happened to pick. `appearance` is `subtle | solid`, defaulting to
  `subtle` as it does on Badge — so **the dark neutral toast is
  `appearance="solid"` now**, and a plain `<Toast>` is tinted where it used to be
  dark. Every tone has both. A solid toast's description also takes full-strength
  ink instead of the old 0.8 opacity, which was tuned against one dark surface
  and would have dropped white text under AA over two of the five.
- **`className` lands on the root, everywhere.** The five components that put it
  elsewhere gained a named second target: `controlClassName` on the text
  controls and Checkbox, `dialogClassName` on Modal.
- **`onChange` hands back `(value, event)`** on Checkbox, Toggle and RadioGroup.
- **`styles.css` is wrapped in `@layer haus.components`.** Your own unlayered CSS
  now beats it without a specificity fight; anything relying on source order
  will change.
- Sizes converge on `sm md lg`. Avatar keeps `xs` and `xl`.
- Added: `forwardRef` and prop spreading on all twelve, which the README already
  claimed. `as` on Card and Badge. `initialFocus` and `dismissOnBackdrop` on
  Modal.
- Added: a `require` condition and a `./package.json` export.
- **Button takes all five tones.** `ButtonTone` was `neutral | error`; it is the
  whole `Tone` union now, and every tone composes with every weight. Widening a
  union is not itself breaking, but it is listed here because the colours a
  toned Button paints are new and Chromatic will treat them as such.

### `haus-components`, fixed

- **Tabs had no forced-colors fallback**, so its focus ring, on both the tab and
  the panel, disappeared entirely in Windows High Contrast: the ring is a
  box-shadow and forced-colors drops those. Found by repairing the assertion
  that was supposed to prevent exactly this, which had been matching the wrong
  string and passing on an empty set.

- RadioGroup never moved its drawn selection when uncontrolled: the dot stayed on
  `defaultValue` while the native input flipped.
- A disabled `<Button href>` was focusable and still navigated.
- Button dropped `ref` on its anchor branch.
- Avatar threw on an empty name.
- Checkbox's hint and Toggle's description were read as part of the accessible
  name rather than as descriptions.
- `Input` rang its focus ring for a pointer as well as a keyboard.
- `Select` had an error state with no error-focus ring.
- Every focus ring is a `box-shadow`, and forced-colors mode drops those: nine
  components gained an outline fallback, so a Windows High Contrast user has a
  focus indicator at all.
- Components are written in logical properties, so the library works in a
  right-to-left document.
- `<Button variant="ghost" tone="error">` rendered as a solid button, and so did
  the `secondary` and `text` weights: the tone set background, border and colour
  outright and won on source order whatever the variant asked for. Tone is a
  palette of custom properties now, per
  [decision 0012](docs/decisions/0012-a-tone-declares-custom-properties-only.md),
  so weight and meaning compose. An untoned Button is unchanged.
