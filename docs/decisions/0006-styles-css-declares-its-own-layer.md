# 0006 · The component stylesheet declares its own cascade layer

**Accepted**, 2026-09-01. **Not yet implemented.**

## Context

The token layers are layered — `haus.primitives`, `haus.semantics`,
`haus.motion` — and `haus-components/styles.css` is not. So it competes with a
consumer's own module CSS by source order, which means whether a component's
style or a consumer's override wins depends on import order rather than on
anything either of them declared.

The related problem is that the package boundary has no guard. `var(--x)` for an
undefined `--x` drops the declaration silently: no console warning, no build
error, and a focus ring that is simply absent. Drift wrote a test that reads
`styles.css` and asserts every role it references resolves, and it found five
undefined roles before they reached a screen — then found a sixth defect in a
published package within an hour of upgrading.

Three shapes were considered: export a function consumers call from their own
suite; ship a stylelint config; or wrap the stylesheet in a cascade layer.

## Decision

The cascade layer.

It is the only one of the three that makes the package declare its own
precedence rather than relying on how a consumer arranges their CSS, and it is
the only one that also fixes the unlayered-stylesheet problem, which the other
two leave standing.

## Consequences

Easier: a consumer's own CSS wins without a specificity fight, and says so.

Harder: it is breaking for anyone relying on current source order.

**The timing is the argument.** It costs nothing while Drift is the only consumer
of the component tier. Every consumer added before it lands makes it more
expensive, and there are two more planned.
