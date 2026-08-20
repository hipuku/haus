# haus

An opinionated, open-source design system. Token-first, light-mode only, OKLCH throughout.

## Scope

- **Light mode only.** There is no dark theme and no `light-dark()` layer.
- **12 React components** (CSS Modules): Avatar, Badge, Button, Card, Checkbox, Input, Modal, Radio, Select, Textarea, Toast, Toggle.
- **No MCP server and no Figma Code Connect** — out of scope for this system.

## Packages

| Package | Description |
|---|---|
| `haus-tokens` | Design tokens as CSS custom properties and W3C Design Tokens JSON |
| `haus-components` | React component library (12 components) built on the token layer |
| `haus-colour-utils` | Colour science utilities — OKLCH analysis, perceptual clustering, CIEDE2000 distance |

## Token architecture

Three layers, strict separation:

```
primitives.css   Raw values. No meaning. No component should reference these.
semantics.css    Role aliases. No raw values. What components consume.
motion.css       Easing curves and duration tokens.
```

Theming (brand and role swaps) lives entirely in `semantics.css`; components never change. haus is light-mode only — dark mode is explicitly out of scope, not a deferred layer.

## Links

- **Live Storybook:** [haus.hipuku.dev](https://haus.hipuku.dev)
- **npm:** [`haus-colour-utils`](https://www.npmjs.com/package/haus-colour-utils)

```bash
npm install haus-colour-utils
```

## Status

Active development. `haus-colour-utils` is published to npm; `haus-tokens` and `haus-components` are internal-only.
