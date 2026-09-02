# haus

An opinionated, open-source design system. Token-first, light-mode only, OKLCH throughout.

## Scope

- **Light mode only.** There is no dark theme and no `light-dark()` layer.
- **12 React components** (CSS Modules): Avatar, Badge, Button, Card, Checkbox, Input, Modal, Radio, Select, Textarea, Toast, Toggle.
- **Scope stops at the tokens and the components.** No MCP server, no Figma Code Connect.

## Packages

Two tracks share this workspace. `haus-tokens` and `haus-components` are the design
system. `haus-colour-utils` and `haus-style-probe` are the colour and measurement libraries
the auditing tools were written against, and they are the two with consumers outside this
repo.

| Package | Description | Used by |
|---|---|---|
| `haus-tokens` | Design tokens as CSS custom properties and W3C Design Tokens JSON | `haus-components`, drift |
| `haus-components` | React component library (12 components) built on the token layer | this repo's Storybook, drift |
| `haus-colour-utils` | Colour science: OKLCH analysis, perceptual clustering, CIEDE2000 distance, WCAG contrast | drift, vault, hexicon |
| `haus-style-probe` | Reads what a browser actually computed for an element, normalised into one shape | drift |
| `haus-colour-names` | 31,900 named colours as data, for pairing with the matcher in `haus-colour-utils` | vault, and `haus-colour-utils` for the hue-family test; hexicon still carries its own copy |

## Token architecture

Four layers, strict separation:

```
primitives.css   Raw values. No meaning. No component should reference these.
brand.css        Which primitive each role takes. The one file a consumer replaces.
semantics.css    What each role means. No palette names.
motion.css       Easing curves and duration tokens.
```

Every property carries `--haus-`, and roles are declared on `:root, [data-haus-theme]`, so a brand applies to a subtree and nests. Replacing `brand.css` is how you theme; `brands/ruby.css` is a complete second brand, and `BrandMap` is generated from `brand.css` so an omission is a type error rather than an unresolved `var()`. See [decision 0003](docs/decisions/0003-brand-and-roles-are-separate-layers.md).

haus is light-mode only. That is a consequence of [decision 0002](docs/decisions/0002-surface-polarity-is-fixed.md) rather than a deferred layer: surface polarity is fixed by the contract, so a dark theme cannot arrive as a brand map.

## Decisions

The rulings this system is built on are recorded one file each in
[`docs/decisions/`](docs/decisions/README.md): what was chosen, what it was
chosen over, and what it costs. Several are settled and not yet implemented, and
say so.

Start with [0003, the brand and role split](docs/decisions/0003-brand-and-roles-are-separate-layers.md),
which is the one the rest of the roadmap hangs off.

## Documents

- [**Decisions**](docs/decisions/README.md). The rulings this system is built
  on, one file each, including the ones that are settled and not yet implemented.
- [**Accessibility**](docs/accessibility.md). What is checked and by what, two
  known failures disclosed, and what is not covered.
- [**Browser support**](docs/browser-support.md). The floor, the one feature
  that sets it, and what widening it would cost.
- [**Tokens**](docs/tokens.md). The layers as they are.
- [**Contributing**](CONTRIBUTING.md) · [**Changelog**](CHANGELOG.md) ·
  [**Releasing**](RELEASING.md) · [**Security**](SECURITY.md)

## Links

- **Live Storybook:** [haus.hipuku.dev](https://haus.hipuku.dev)
- **npm:** [`haus-tokens`](https://www.npmjs.com/package/haus-tokens) ·
  [`haus-components`](https://www.npmjs.com/package/haus-components) ·
  [`haus-colour-utils`](https://www.npmjs.com/package/haus-colour-utils) ·
  [`haus-style-probe`](https://www.npmjs.com/package/haus-style-probe) ·
  [`haus-colour-names`](https://www.npmjs.com/package/haus-colour-names)

```bash
npm install haus-tokens haus-components
```

## Status

Active development. All five packages are published to npm. `haus-colour-utils` and
`haus-style-probe` have consumers outside this repo; `haus-tokens` and `haus-components`
are released and the Storybook is the way to look at them. Releasing is documented in
[RELEASING.md](./RELEASING.md).
