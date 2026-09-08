# 0018 · vault's twenty local tokens, settled one at a time

**Accepted**, 2026-09-08. **Implemented in haus for the four that were haus's
gap.** `haus#53`. The vault-side edits are `V2`.

## Context

vault adopted haus's token layer in full on 2026-09-07 and **twenty properties
remained** in its own `tokens.css`. Each is a place haus has no name, or a place
vault deliberately resolves a shared role differently.

That list is the best evidence in the portfolio of what a design system is missing,
because it is what survived a real adoption rather than what anyone guessed.

*The count was recorded as 22 in three places and is 20. The earlier figure came
from a grep that counted comment lines.*

## Settled: vault's, and staying vault's

Thirteen, each with the reason on the record rather than a blanket "product
specific":

| Token | Why it stays |
|---|---|
| `--font-serif` | A serif sample beside the sans UI on the specimen sheet. Not a UI face, and haus has no business shipping one it never renders |
| `--text-28` | The specimen sheet's largest sample. One step above haus's scale, for a screen whose subject is type |
| `--control-height-xs` | 24px, an icon button, below haus's `sm` and pointer-only by design. `IconButton` is vault-only, so the height is too |
| `--dot-xs` `-sm` `-md` `-lg` | Colour swatch chips at four sizes. vault's subject is colour; no other product has a swatch |
| `--popover-width-sm` `-md` `-lg` | **One product is not evidence.** haus's Popover deliberately sets no width, documented as *content width is not a useful measure for a panel holding a form*. If a second product invents a popover width, this changes |
| `--haus-font-sans` `--haus-type-heading-weight` `--haus-type-label-xs-tracking` | The three forks `vault#32` argued and kept. Adopting a token layer is not licence to restyle a shipped product |

## Settled: haus's gap, and now haus's

**Modal widths become a form-tier brand group.** Three products had three answers:
haus's Modal carried `400px`, `560px` and `720px` **as literals inside the
component**, vault ships four narrower steps for a dense desktop app, and core
hardcodes `26rem` in its own Modal.

A brand entry rather than a primitive, because two products disagree and **both are
right**: a modal width is a proportion of the product's own layout, which is what
makes it brand rather than scale. It reuses [0015](0015-a-brand-states-form-not-only-colour.md)'s
mechanism rather than inventing another, and vault's fourth step stays vault's,
because a contract cannot have an optional member.

Nothing is restyled. haus keeps its three values, vault keeps its four.

## The gate could not see any of it, which is the finding

Modal's three widths were hardcoded in a design system whose CI fails on a
hardcoded value. **The rule listed `min-height` and not `width`**, which is the
blind spot `haus#43` named for icon sizes and nobody widened.

`width`, `height`, `max-width`, `min-width` and `max-height` are in the rule now,
and it found **ten** literals. None was swept aside:

| Found | Settled as |
|---|---|
| Modal `400/560/720px` | the brand group above |
| Toast `max-width: 360px` | `--haus-overlay-width-xs` and the role `--haus-toast-width`. A plain role, not a brand entry, because no consumer has disagreed with it yet. Promote it if one does |
| Toggle `width: 36px` | `--haus-size-toggle-track`. It reads as `control-height-md` by coincidence and is not one: it is two thumbs and the travel between them |
| Badge and Radio `6px` twice | `--haus-size-marker-dot`. The same value written twice with no name, which is `haus#34`'s signal exactly |
| Avatar `35%`, Button `1em` | Exempt by category, not by value: a percentage is a proportion and an em is text-relative, and neither is a size a scale could hold |

**Every converted value is identical at render**, checked rather than assumed:
`25rem` is `400px`, `22.5rem` is `360px`, `0.375rem` is `6px`.

## The one that dissolved

vault's file calls `--type-title-*` **"the one role haus has no name for"**. haus
has it.

`--type-title-size` is `--haus-text-24`, which is exactly `heading-lg`'s size. The
role differs from `heading-lg` in two properties: bold against semibold, and
`tight` against `tighter`.

So it is not a missing role, it is `heading-lg` with a weight and a tracking
changed, and **vault already forks `--haus-type-heading-weight` for the same
reason.** `V2` deletes the invented role and forks `heading-lg`'s two properties
instead, which renders identically and moves the departure to where vault's other
three already sit, rather than leaving it disguised as a gap in haus.

**A private role that duplicates a public one is worse than a fork**, because a
fork is visible and argued and this was neither.

## Consequences

haus gains three primitive groups (`overlayWidth`, `size`), one brand group
(`modal-width`, three entries, form tier), and three roles. The form tier goes
from 7 entries to 10.

`V2` applies the vault side: delete `--type-title-*`, fork `heading-lg`, and keep
the other thirteen with this record as the reason.
