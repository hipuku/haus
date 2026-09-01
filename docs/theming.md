# The haus theming contract

Decided 2026-09-01, before implementation, because the Figma Variables structure
has to mirror it and that reaches further than the code. Nothing in Wave B starts
until this document is agreed.

`docs/tokens.md` describes the three layers as they are today. This describes
what they become, and what a consumer is promised.

## What is wrong today

`README.md:36` says theming lives entirely in `semantics.css`. `DESIGN.md:40`
says a theme swap is a single-file change with zero component edits. Neither is
true, in three separate ways.

**The brand and the role system are the same file.** `semantics.css` is 242
lines. Lines 37 to 121 are colour roles that alias palette ramps directly:
`--color-surface-default` is `var(--damson-0)`, `--color-primary-default` is an
aronia step, and the four feedback families are elderberry, greengage, mango and
cherry by name. Lines 122 to 242 are type, spacing, radius, elevation and motion
roles, which are brand-independent. Swapping a brand means editing the same file
that defines what a role *is*.

**Every token is global and unprefixed.** `--space-4`, `--radius-md` and
`--text-14` sit on a bare `:root` in the global custom-property namespace. A
consumer running Tailwind, or any other system with a numeric space ladder, will
collide with them silently, because a colliding custom property does not error.

**There is no scoping selector.** A search for `data-theme` or `:root[` returns
nothing. The cascade layers exist and are correct, `@layer haus.semantics` among
them, but a layer controls precedence, not scope. There is no way to theme a
subtree, which means no way to preview two brands on one page, and no way for a
Figma mode to have a code equivalent.

There is also no exported theme-contract type, so a wrong brand file fails at
runtime as an unresolved `var()` rather than at the build.

**Two products already answered this.** vault declared 164 properties of its own.
core declared 348 lines and took no haus dependency at all, with its first commit
on 2026-08-23, after all five packages were on npm. Both by the same author, both
with the alternative available.

The role layer is not what they rejected. Of vault's 45 differing values, six
differ only by decimal padding, about thirty are palette-name swaps, and roughly
eight are structural. **The roles work. The brand is the part that cannot move.**

## The contract

### Four files, not three

```
@layer haus.primitives  →  primitives.css   Raw values. No meaning.
@layer haus.brand       →  brand.css        Which primitive each role takes.
@layer haus.semantics   →  semantics.css    What each role means. No palette names.
@layer haus.motion      →  motion.css       Durations, easings, motion pairs.
```

`brand.css` is the only file a consumer replaces. It maps role to primitive and
contains nothing else: no new names, no raw values, no structure. `semantics.css`
keeps the role vocabulary and stops naming palettes.

Concretely, today's

```css
--color-surface-default: var(--damson-0);
```

becomes a brand-map entry naming the ramp, and a role in `semantics.css` reading
that entry. A brand author sees a flat list of ramp choices. A component author
sees an unchanged role name.

### The prefix

**Every custom property haus defines carries `--haus-`.** No exceptions, at any
layer, including primitives.

```
--space-4      →  --haus-space-4
--text-14      →  --haus-text-14
--radius-md    →  --haus-radius-md
--color-*      →  --haus-color-*
```

This is the breaking part, and it is the reason 1.0 exists. It is not
negotiable: the whole point is that a consumer can adopt haus without auditing
their own namespace first, and today they cannot.

### The scoping selector

Tokens are defined on `:root, [data-haus-theme]` rather than a bare `:root`. A
consumer themes a subtree by attribute:

```html
<div data-haus-theme="ruby">…</div>
```

The default brand applies at `:root` so the common case needs no attribute. A
named brand applies at `[data-haus-theme="<name>"]`, and nesting works because
custom properties inherit.

This is what makes the Figma decision expressible in code. A Figma mode and a
`data-haus-theme` value are the same object.

### The exported map type

`haus-tokens` exports a TypeScript type describing the brand map, so a brand file
that omits a role or misnames one fails the consumer's build rather than
rendering an unresolved `var()`. The type is generated from the same source as
the CSS, not hand-maintained beside it, because three hand-maintained copies
inside this package is already a filed issue.

### One worked example brand

The default brand ships with a second, complete brand beside it. **A contract
with one implementation is not a contract**, and the second one is what proves
the split holds. vault's ruby is the obvious candidate: it is a real brand, it
already exists, and Wave F migrates vault anyway, so writing it here is
rehearsal rather than invention.

## What the rulings decided

Recorded here because they constrain the contract, and because the Figma file has
to carry the same answers.

**A1. One focus treatment: the double ring.** `0 0 0 2px surface, 0 0 0 4px
focus`, as haus and drift already do. It is the only one of the three in the
portfolio that is contrast-safe. vault's single soft halo and core's
`outline: 2px solid var(--ring)` at 32% alpha both change; core's is one token
across fifteen rules.

The ring is a brand-map concern, since its colour comes from the brand, and an
effect style in Figma. It also needs a forced-colors fallback: every ring in haus
is `box-shadow` only, and `box-shadow` is dropped in Windows High Contrast, so
focus currently disappears for the users most dependent on it.

**A2. Surface polarity: white cards on a subtle page.** haus and vault's
direction. core inverts it, with `--bg` a light-grey desk and `--surface`
near-white, so its cards separate by fill rather than elevation. A rename is not
value-preserving, so core needs a visual re-tune when it adopts. Polarity is
**not** a brand-map axis: it is fixed by the contract, and a brand that wants the
other model is a different contract.

**A3. This document.**

**A4. Semver, and 1.0.** Nothing about these APIs is unstable enough to justify
0.x, and `^0.2.0` prevents a minor from reaching a consumer while allowing a
patch, which is the wrong way round. The policy goes into `RELEASING.md` in the
same commit as the cut.

**A5. `variant` and `tone` separate, and `danger` becomes `error`.** Today
`variant` means three different things:

| Component | What `variant` means today |
|---|---|
| Button | visual weight, semantics and behaviour at once: `primary` `secondary` `ghost` `danger` `text` `external` |
| Badge | semantics, with fill split into `appearance` |
| Toast | semantics, with no fill option |
| Card | elevation |

After A5:

- **`variant`** is visual weight only. Button: `primary` `secondary` `ghost`
  `text`. Card keeps `variant`, because elevation genuinely is visual form.
- **`tone`** is semantics, one vocabulary everywhere: `neutral` `info` `success`
  `warning` `error`. Button's `danger` becomes `tone="error"`, which also makes a
  secondary destructive button expressible for the first time.
- **`appearance`** is `subtle` or `solid`. Badge has it; Toast gains it.
- **`external`** stops being a variant. It is behaviour plus an injected glyph,
  not a visual weight, so it becomes its own prop.

Sizes converge on `sm` `md` `lg`. Avatar keeps `xs` and `xl` as a documented
extension. `Input`, `Select` and `Textarea` currently `Omit` the native `size`
attribute and offer no replacement, which is the gap that has to close.

## What breaks, and for whom

Everything below is breaking for anyone reading haus tokens.

| Change | Who it reaches today |
|---|---|
| `--haus-` prefix on every property | drift, which reads tokens directly |
| The roles and brand split | brand authors only; role names do not move |
| `variant` and `tone` split, `danger` to `error` | drift, and any consumer of `haus-components` |

**Today that consumer is drift, and drift is hers.** The new product makes it
two. After 1.0 it is a major with a migration guide. That is why Waves A and B
come first, in a window that closes when the product's first component is
written.

## How Figma mirrors this

Not decorative. The mode structure *is* the brand map, so the file cannot harden
before this document is agreed.

- `primitives`, a collection with **no modes**: the raw ramps, the space ladder,
  radii, sizes, durations.
- `semantics`, aliasing primitives, with **modes as brands**. Two modes from the
  start, the default and the worked example, for the same reason the code ships
  two brand files.
- Variable **scoping** so a colour primitive cannot be applied to a fill
  directly. That is the Figma equivalent of stylelint's strict-value rule.
- Effect styles for the elevation ladder and for the focus ring, which is where
  A1 stops being an opinion and becomes a published object.
- Component properties matching the code props by name and by value, which after
  A5 means `variant`, `tone`, `appearance` and `size`, the same strings in both
  places.

## Acceptance test

The contract works if the new product can be built on `haus-tokens` with nothing
but a brand map. Keep a running note in that repo of every moment you want to
reach past the role layer. **An empty note means the contract holds and there is
a third consumer proving it. A full one names what is still fused.**
