# Changelog

Five packages, released independently. Entries are grouped by package, newest
first, and only cover what a consumer sees: an internal refactor with no
observable effect does not appear here.

This file starts at Unreleased. **The releases before it have no entries, and
that is the honest position** — `haus-components` went 0.2.0 → 0.4.0 with a
breaking change in between and nothing recorded it, so reconstructing those
notes now would mean inventing them from commit messages written for a different
purpose. Everything from here is written as it lands.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [decision 0004](docs/decisions/0004-versioning-is-1-x.md): a
token rename is a major at an identical value, and a contrast change is a major
even when the hex barely moves.

## Unreleased

The 1.0 cut. Everything below is breaking, deliberately, and lands in one major
rather than two so a consumer migrates once.

### `haus-tokens` — breaking

- **Every custom property carries `--haus-`.** `--space-4` is
  `--haus-space-4`, at every layer including primitives. Unprefixed they sat in
  the global namespace, where a consumer running Tailwind collides with them.
- **The brand is a separate layer.** `brand.css` holds which primitive each role
  takes and nothing else; `semantics.css` keeps the role vocabulary and names no
  palette. Replacing `brand.css` is how you theme.
- **Roles are declared on `:root, [data-haus-theme]`.** A named brand applies at
  `[data-haus-theme="<name>"]` and nests.
- Added: `index.css`, the four files in the right order; `layers.css`, the
  cascade order declared once; `brands/ruby.css`, a complete second brand;
  `BrandMap` and `brandRoles`, generated from `brand.css`.
- Added: a `require` condition and a `./package.json` export.
- Fixed: `controlHeight` reaches the JS export, which it never did.

### `haus-components` — breaking

- **`variant` is visual weight only.** Badge and Toast take `tone`; Button takes
  `variant` for weight, `tone` for meaning, and `external` as its own prop.
  `danger` is `tone="error"`. The old type names remain as deprecated aliases.
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

### `haus-components` — fixed

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
