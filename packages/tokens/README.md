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
import 'haus-tokens/index.css'
```

`index.css` loads the layer order, then `primitives`, `brand`, `semantics` and
`motion`, in the order they have to load. They are exported individually too,
and replacing `brand.css` is the documented case, but leave one out and every
role that reads it drops silently. All of them are wrapped in `@layer haus.*`,
so your own styles win without a specificity fight.

## The layers

```
primitives.css   --haus-aronia-500: oklch(52% 0.138 300)
                        ↓
brand.css        --haus-brand-primary-default: var(--haus-aronia-500)
                        ↓
semantics.css    --haus-color-primary-default: var(--haus-brand-primary-default)
                        ↓
your component   background: var(--haus-color-primary-default)
```

A primitive is a raw value with no opinion; the brand says which primitive each
role takes; a semantic token carries the decision. Components read the semantic layer for colour, type, spacing, radius,
elevation and motion, and reaching past it is what makes a theme swap
impossible later.

Two kinds of primitive read are documented rather than hidden. Sizes: 28
declarations across the haus components take a size off the space ladder, on
`height`, `width`, `min-*`/`max-*` and `transform` offsets, because a size is a
value rather than a role. They are the avatar sizes, the checkbox and radio
boxes, the toggle track and thumb, and a few min/max bounds. And 31 read a
primitive that has no semantic alias because the primitive's own name already is
the role: thirteen control heights and eighteen icon sizes. No component reads a
colour, radius, shadow, stacking or motion primitive, and a test in
`haus-components` holds that line.

That second number went 61 to 77 when the six overlay components landed, then
**77 to 41 at the 1.0 cut**, and the fall is the part worth reading. `Popover`
and `Tooltip` had to reach for `--haus-z-*` directly because eight z-index
primitives had no role between them, and a product wanting the stacking order
had to read `primitives.css` for it, which is why drift and vault each settled
one for themselves. haus#27 put the ladders in `primitives.css` and the names in
`semantics.css`. **No component declaration changed**: the same reads resolve
one layer higher. It fell again when typeface became a brand entry and the 32
`--haus-font-sans` reads became role reads, and rose with IconButton and the
themed Select. `tokens.test.ts` in `haus-components` carries the whole ledger.

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

## The guard

`var(--x)` for an undefined `--x` is invalid at computed-value time: the
declaration is dropped and the property inherits. No console warning, no build
error, nothing in review: a focus ring is simply absent, and a missing duration
looks like a design choice.

That makes *have you loaded what my components read* a question worth failing a
build over, and it is a question this package can answer because this package
defines the contract. Import it from your own suite:

```ts
import { readFileSync } from 'node:fs'
import { findUndefinedTokens } from 'haus-tokens/guard'

const read = (p: string) => readFileSync(p, 'utf8')

it('reads no role this app does not load', () => {
  const { missing, read: reads } = findUndefinedTokens({
    reads: [read('node_modules/haus-components/dist/styles.css')],
    defines: [
      read('node_modules/haus-tokens/dist/primitives.css'),
      read('node_modules/haus-tokens/dist/motion.css'),
      read('node_modules/haus-tokens/dist/semantics.css'),
      read('src/tokens/overrides.css'),
    ],
  })

  // Assert the floor as well as the failure: a wrong path makes the check pass
  // by finding nothing.
  expect(reads.length).toBeGreaterThan(50)
  expect(missing).toEqual([])
})
```

It is **pure and does no file reading**, so it runs anywhere and this package
gains no dependency on `node:fs`. You know which files you load; it only knows
what the contract is.

### The second check: values you already have

A property you declare that this package also declares, at the value this package
already gives, is not an override. It is a copy, and it renders perfectly until
one of the two moves.

```ts
import { findRestatedTokens } from 'haus-tokens/guard'

it('restates no value haus already ships', () => {
  const copies = findRestatedTokens({
    defines: [read('src/tokens/semantics.css')],
    upstream: [
      read('node_modules/haus-tokens/dist/primitives.css'),
      read('node_modules/haus-tokens/dist/motion.css'),
      read('node_modules/haus-tokens/dist/semantics.css'),
    ],
  })

  expect(copies.map((c) => `${c.name} (${c.kind})`)).toEqual([])
})
```

Each result is tagged. `identical` is the same declaration text on both sides.
**`resolved` is the one worth having**: the text differs and the value does not,
once `var()` chains are followed. `--haus-z-modal: 400` against our
`var(--haus-z-400)`, where `--haus-z-400` is `400`, is how a consumer opts out of
a scale while still appearing to be on it.

**Which files you pass as `upstream` decides the question.** Include `brand.css`
and you are asking *do I restate anything haus ships, its colour choices
included*. Leave it out and you are asking *do I restate anything structural*,
with your palette treated as your business. Against drift, while it still
consumed haus, the two answers were 143 and 89, and the 54 in the gap were
exactly its brand.

Overriding a role is fine and several consumers should. Overriding it to our
value is the thing this reports.

`alsoDefined` takes properties set outside CSS, a component doing
`style={{ '--haus-avatar-bg': v }}` defines one that no stylesheet will show.

A read carrying a fallback, `var(--x, 0.2s)`, is a real value either way and is
not a failure. `findFallbackTokens` lists those separately, because a fallback
that never loses is a hardcoded value wearing a token's clothes and that is
worth reading occasionally rather than failing a build over.

**Why it exists.** drift wrote this check for itself and it caught five roles
before they reached a screen: `--color-ink-on-primary`, `--elevation-floating`,
`--motion-duration-emphasis`, `--radius-marker` and `--haus-focus-ring-error`.
Every consumer after it would have written the same test or shipped the same
silent hole.

It is also run against this package. `src/guard.test.ts` checks `semantics.css`
and `brands/vault.css` resolve against the layers below them: which is how the
guard's own regex bug was found, a missing `m` flag that reported 41 undefined
roles in a file that has none.

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
