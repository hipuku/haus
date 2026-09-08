# 0008 · Toast stays presentational

**Accepted**, 2026-09-01. **Completed 2026-09-08**, `haus#63`: the documentation this
entry was waiting on now exists.

## Context

Toast ships a surface and nothing else: no provider, no queue, no positioning, no
auto-dismiss timer, no z-index. Every consumer builds the difficult part, and two
of them have built it differently.

**Re-measured 2026-09-08, and the sentence above is no longer true.** Toast usage
across the portfolio is core 17 files on sonner, drift none, vault none. **Only
one consumer has toasts at all.** That strengthens this decision rather than
weakening it: a provider shipped now would have exactly one consumer and would
fail decision 0013. The original count is left above rather than edited away,
because what a decision was reasoned from is worth more than a tidy record.

Either answer is defensible. Silence is not: an absence in a component library
reads as an oversight unless it is written down as a boundary.

## Decision

Toast stays presentational. haus ships the surface; the provider, the queue,
positioning, auto-dismiss and stacking are the consumer's.

## Consequences

Easier: the component stays a component. A toast system is an application
concern. It owns global state, a portal, and a policy about how many notices can
stack and for how long, and a design system that ships one is shipping an opinion
most consumers will fight.

Harder: every consumer writes the queue. That is the accepted cost, and the
boundary has to be stated **in the component's own documentation** rather than
left as a gap, along with what a consumer is expected to supply.

~~Until that documentation exists this decision is only half made, which is why
this entry says so rather than claiming the work is finished.~~

**Done.** `Toast.tsx` now carries the boundary in the component's own
documentation, naming what a consumer owns: where toasts appear, how many, in
what order, how long, and the `aria-live` handling. This decision is fully made.

**The adoption this implies**, recorded here because core is about to do it: a
consumer keeps its queue and renders haus's surface inside it. sonner exposes
`toast.custom(jsx)`, which is the seam. haus owns the look, the consumer owns
positioning, stacking and dismissal, which is exactly the split above.
