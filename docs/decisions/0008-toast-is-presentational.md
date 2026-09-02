# 0008 · Toast stays presentational

**Accepted**, 2026-09-01. The code needs no change; the documentation does.

## Context

Toast ships a surface and nothing else: no provider, no queue, no positioning, no
auto-dismiss timer, no z-index. Every consumer builds the difficult part, and two
of them have built it differently.

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

Until that documentation exists this decision is only half made, which is why
this entry says so rather than claiming the work is finished.
