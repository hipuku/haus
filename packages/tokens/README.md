# haus-tokens

The haus design tokens: OKLCH colour, type, spacing, radius, shadow and motion,
in three forms, from one source of truth.

| Form | Import | For |
|---|---|---|
| CSS custom properties | `haus-tokens/primitives.css`, `/semantics.css`, `/motion.css` | styling components |
| Typed JS constants | `import { tokens } from 'haus-tokens'` | build config, style-in-JS, media queries |
| W3C-DTCG JSON | `haus-tokens/tokens.json` | design-tool sync, external tooling |

## Install

```bash
npm install haus-tokens
```

```ts
import 'haus-tokens/primitives.css'
import 'haus-tokens/semantics.css'
import 'haus-tokens/motion.css'
```

Load them in that order: `primitives` declares raw values, `semantics` gives
them meaning, `motion` adds duration and easing. All three are wrapped in
`@layer haus.*`, so your own styles win without a specificity fight.

## The two layers

```
primitives.css   --aronia-500: oklch(52% 0.138 300)
                        ↓
semantics.css    --color-primary-default: var(--aronia-500)
                        ↓
your component   background: var(--color-primary-default)
```

A primitive is a raw value with no opinion; a semantic token carries the
decision. Components read the semantic layer for colour, type, spacing, radius,
elevation and motion, and reaching past it is what makes a theme swap
impossible later.

Two kinds of primitive read are documented rather than hidden. Sizes: 31
declarations across the haus components take a size off the space ladder, on
`height`, `width`, `min-*`/`max-*` and `transform` offsets, because a size is a
value rather than a role. And 56 read a primitive that has no semantic alias
because the primitive's own name already is the role: `--font-sans`,
`--weight-*`, `--border-width-*`, `--opacity-disabled`, `--icon-sm`,
`--z-modal`. No component reads a colour, radius, shadow or motion primitive,
and a test in `haus-components` holds that line.

## Typed constants

Custom properties cannot be used inside `@media` conditions, and build tools
can't read CSS. The JS export covers that:

```ts
import { tokens } from 'haus-tokens'

tokens.color.aronia[500]  // 'oklch(52% 0.138 300)'
tokens.breakpoint.lg      // '1024px', breakpoints are JS-only by necessity
tokens.motion['fade-in']  // '200ms cubic-bezier(0.00, 0.00, 0.20, 1.00)'
```

This is the **primitive** layer only. Semantic tokens live in `semantics.css`
and in `tokens.json`, because their whole job is to be swappable at runtime.
Freezing them into a JS constant would defeat the point.

## The DTCG JSON

`tokens.json` conforms to the [W3C Design Tokens](https://tr.designtokens.org/format/)
format, so it round-trips through design tooling. It stores *typed* values
rather than CSS strings: a font family is an array, a cubic-bezier is four
numbers, a composite is an alias:

```jsonc
"font":   { "family": { "sans": { "$type": "fontFamily", "$value": ["Manrope", "system-ui", "sans-serif"] } } },
"easing": { "enter":  { "$type": "cubicBezier", "$value": [0.0, 0.0, 0.2, 1.0] } },
"motion": { "fade-in": { "$type": "string", "$value": "{duration.normal} {easing.enter}" } }
```

## Three copies, one truth

Stating the same tokens three times invites exactly the drift this design
system exists to prevent. So two of the three are not stated at all:
`tokens.json` is the source, and `primitives.css` and `index.ts` are generated
from it by `scripts/build-tokens.ts`. `pnpm run tokens:check` regenerates them
in memory and fails if what is committed differs, which is the first step CI
runs. Change a value in `tokens.json` and `pnpm run tokens` writes the other
two; change one of the other two by hand and CI says so.

`semantics.css` is the one token file still written by hand, because a role is a
decision rather than a derivation. `semantics.test.ts` holds it to the rules
this package states: every token it reads is declared in the layers below, no
declaration carries a raw value, every subtle and default surface has its
paired `on-*` text token, every interactive scale has a disabled state, no
colour role names a palette, and a spacing step is the same size whichever of
the three roles reads it.

## Licence

MIT
