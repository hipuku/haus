# 0012 · A tone rule declares custom properties only

**Accepted**, 2026-09-03. **Implemented on Button and Toast.**

## Context

Decision 0005 split `variant` from `tone`: weight and meaning became separate
props so that a consumer could say both. It settled the vocabulary and left the
mechanism open, and the mechanism is where it came apart.

Button implemented `tone="error"` as a flat rule that set `background-color`,
`border-color` and `color` outright, alongside the variant rules that set the
same three. Two rules, equal specificity, and the tone one written later — so
the tone won every time regardless of what the variant said, and
`<Button variant="ghost" tone="error">` rendered as a solid button. The two
props were separate in the type and fused in the cascade.

The type carried a second symptom of the same thing. `ButtonTone` was narrowed
to `neutral | error`, justified in a comment as honesty about the three tones
having no design. That was false: `semantics.css` already held the full six-role
set for info, success and warning — including the `solid` roles that exist
because those two 500s fail with white ink, with the measured ratios in the
comments — and Badge already spent all five tones across both appearances. The
design existed. Only Button had not adopted it, and the narrowing had hardened
the omission into a stated principle.

## Decision

**A tone rule may remap custom properties and may declare nothing else.**

A variant rule reads the subset of those properties its weight calls for. No
rule names both a tone and a variant, so the two never compete for a
declaration, and the cascade has nothing left to resolve in the wrong order.

Two corollaries fall out of it:

- **Neutral is a tone**, holding the values the variants used to state
  literally. An untoned component renders exactly as before.
- **A component narrows `Tone` only where the roles genuinely do not exist.**
  Absence of a rule is not absence of a design; check `semantics.css` and the
  components that already spend the roles before writing the narrowing.

## Consequences

Easier: every cell of the weight × tone grid works, and adding a tone is a block
of custom properties rather than a row of rules per variant. A `:hover` or
`:active` state written once serves all five. The rule is mechanically checkable
— Button's suite parses its own stylesheet and fails if any rule selecting a
tone declares a non-custom property, which is the assertion that actually
catches the regression, since components test under `css: false` and the DOM
shows both classes present either way. The check lives in `stylesheet.test.ts`
and runs over every component stylesheet in the package, so a component adopting
this shape is held to it without writing a test of its own.

Harder: the indirection is real. Reading `.primary` no longer tells you what
colour it is, and the answer is one hop away in the palette block. Twelve
properties is more surface than three declarations, and each one is a name that
has to stay meaningful.

It also puts weight on the token layer. A tone can only be expressed if its
roles exist, so the pressure moves from "write another rule" to "the role is
missing, decide it" — which is the right place for it, and is why the contrast
suite grew the `solid`, `emphasis` and `on-subtle`-on-`surface-default` pairs
that the toned weights now depend on.

Applies to Button and Toast. Toast is where the rule paid for itself a second
time: it already had two appearances — `neutral` painting a dark solid surface
while the other four painted tinted ones — and no prop to say which you wanted,
which is the same fusion in a different disguise. `appearance` is that prop, per
decision 0005, and the tone rules stopped deciding it.

Badge is the remaining one. It reads correctly today because it writes compound
selectors, `.neutral.subtle`, which name both things and so cannot be outvoted
by source order — but that is a 5 x 2 grid of rules where this is 5 blocks plus
2, and it will not survive a third axis. Worth converting, not urgent.
