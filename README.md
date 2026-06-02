# haus

An opinionated, open-source design system. Token-first, light-mode, OKLCH throughout.

## Packages

| Package | Description |
|---|---|
| `@haus/tokens` | Design tokens as CSS custom properties and W3C Design Tokens JSON |
| `@haus/components` | React component library built on the token layer |
| `@haus/colour-utils` | Colour science utilities — OKLCH analysis, perceptual clustering, CIEDE2000 distance |

## Token architecture

Three layers, strict separation:

```
primitives.css   Raw values. No meaning. No component should reference these.
semantics.css    Role aliases. No raw values. What components consume.
motion.css       Easing curves and duration tokens.
```

Dark mode, high-contrast, and brand theming live entirely in `semantics.css`. Nothing in components changes.

## Status

Active development. Not yet published to npm.
