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
value rather than a role. They are the avatar sizes, the checkbox and radio
boxes, the toggle track and thumb, and a few min/max bounds. And 61 read a primitive that has no semantic alias
because the primitive's own name already is the role: `--haus-font-sans`,
`--weight-*`, `--border-width-*`, `--haus-opacity-disabled`, `--haus-icon-sm`,
`--haus-z-modal`. No component reads a colour, radius, shadow or motion primitive,
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

Stating the same tokens more than once invites exactly the drift this design
system exists to prevent, so most of the restatements are not stated at all.
`scripts/build-tokens.ts` writes five files: `primitives.css` and `motion.css`
from `tokens.json`, `index.ts` as the typed export, `brand.ts` as the `BrandMap`
type from `brand.css`, and `tokens.json`'s own `semantic.color` block from
`brand.css` as well.

`pnpm run tokens:check` regenerates all five in memory and fails if what is
committed differs, which is the first step CI runs. Change a source and
`pnpm run tokens` writes the derived files; change a derived file by hand and CI
says so, which has already caught someone editing a comment inside one.

Two token files are written by hand. `brand.css` says which primitive each role
takes, and `semantics.css` says what each role means, because a role is a
decision rather than a derivation. `semantics.test.ts` holds it to the rules
this package states: every token it reads is declared in the layers below, no
declaration carries a raw value, every subtle and default surface has its
paired `on-*` text token, every interactive scale has a disabled state, no
colour role names a palette, and a spacing step is the same size whichever of
the three roles reads it.

## Licence

MIT
