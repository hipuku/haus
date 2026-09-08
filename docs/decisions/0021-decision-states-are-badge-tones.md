# 0021 · A product's domain states spend Badge's tones

**Accepted**, 2026-09-08. `haus#62`. **Supersedes `C1`'s product-local ruling
on core's decision states.**

## Context

core has six decision states: draft, proposed, accepted, rejected, deprecated
and superseded. `C1` recorded them as product-local, on the reasoning that they
are a domain vocabulary haus has no opinion on, and core kept `.pill` with six
`--st-*` tokens behind it.

The reasoning was sound and the arithmetic behind it was not. `C1` counted six
states against five tones and concluded haus could not carry them. But
`BadgeTone` and `BadgeAppearance` are two axes: five tones plus `primary`,
across `subtle` and `solid`, is **twelve slots**. The constraint was measured on
one axis of a two-axis component.

## Decision

The six states map onto Badge's existing tones. No new variable, no new token.

| state | tone |
|---|---|
| draft | `neutral` |
| proposed | `info` |
| accepted | `success` |
| rejected | `error` |
| deprecated | `warning` |
| superseded | `primary` |

`superseded` is the only judgement call, and it is recorded here because it will
look arbitrary otherwise. It is not a failure, which is `rejected` and takes
`error`. It is not inactive, which is `draft` and takes `neutral`. It is
*replaced, and still historically valid*, so it takes a slot that is distinct
without being alarming.

## Consequences

Easier: core deletes `.pill`, its six modifiers and all six `--st-*` tokens, and
`StatusBadge` becomes a thin wrapper over `Badge`. One misuse comes out with
them: core's settings page paints a **member role** with `pill--accepted` and
`pill--proposed`, spending decision-state colour on something that is not a
decision state. A domain vocabulary that has its own colours invites exactly
that.

Harder: a product with a *seventh* state, or with two that mean the same
temperature, will run out. When that happens the answer is a product-local
component again, not a seventh tone: haus's tones are a semantic scale and
stretching them to fit one product's taxonomy is how a design system acquires
colours nobody else can use.

## What this says about C1

`C1` is superseded on its conclusion and not on its method. It asked the right
question, "is this haus's vocabulary or the product's", and it answered from a
count that was wrong. **The lesson is that a constraint should be measured
against the whole API, not the first axis of it**, which is the same shape as
`13.5` recording a component as absent because a filename search could not see
a CSS class.
