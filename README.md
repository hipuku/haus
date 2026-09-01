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

Three layers, strict separation:

```
primitives.css   Raw values. No meaning. No component should reference these.
semantics.css    Role aliases. No raw values. What components consume.
motion.css       Easing curves and duration tokens.
```

Theming (brand and role swaps) lives entirely in `semantics.css`; components never change. haus is light-mode only, and dark mode is out of scope rather than a deferred layer.

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
