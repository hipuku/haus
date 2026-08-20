# haus-tokens

The haus design tokens — OKLCH colour, type, spacing, radius, shadow, motion —
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
semantics.css    --primary-default: var(--aronia-500)
                        ↓
your component   background: var(--primary-default)
```

**Components must never reference a primitive directly.** A primitive is a raw
value with no opinion; a semantic token carries the decision. Reaching past the
semantic layer is what makes a theme swap impossible later.

## Typed constants

Custom properties cannot be used inside `@media` conditions, and build tools
can't read CSS. The JS export covers that:

```ts
import { tokens } from 'haus-tokens'

tokens.color.aronia[500]  // 'oklch(52% 0.138 300)'
tokens.breakpoint.lg      // '1024px'  — breakpoints are JS-only, by necessity
tokens.motion['fade-in']  // '200ms cubic-bezier(0.00, 0.00, 0.20, 1.00)'
```

This is the **primitive** layer only. Semantic tokens live in `semantics.css`
and in `tokens.json`, because their whole job is to be swappable at runtime —
freezing them into a JS constant would defeat the point.

## The DTCG JSON

`tokens.json` conforms to the [W3C Design Tokens](https://tr.designtokens.org/format/)
format, so it round-trips through design tooling. It stores *typed* values
rather than CSS strings — a font family is an array, a cubic-bezier is four
numbers, a composite is an alias:

```jsonc
"font":   { "family": { "sans": { "$type": "fontFamily", "$value": ["Manrope", "system-ui", "sans-serif"] } } },
"easing": { "enter":  { "$type": "cubicBezier", "$value": [0.0, 0.0, 0.2, 1.0] } },
"motion": { "fade-in": { "$type": "string", "$value": "{duration.normal} {easing.enter}" } }
```

## Three copies, one truth

Stating the same tokens three times invites exactly the drift this design
system exists to prevent — so `tokens.test.ts` checks it mechanically on every
run. It compares all three forms *after* resolving DTCG's typed values and
aliases, so a real value change fails the build while a formatting difference
does not, and it fails if any form declares a token the others don't.

That covers 133 tokens against the JSON and 112 against the CSS. Change a value
in one place and the suite tells you about the other two.

## Licence

MIT
