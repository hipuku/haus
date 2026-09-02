# 0001 · Focus is a double ring

**Accepted**, 2026-09-01. Implemented.

## Context

Three focus treatments existed across the projects built on this system. haus
and Drift drew a double ring: a 2px band of the element's own backdrop, then a
4px band of the accent. Vault drew a soft halo. Core drew a 2px outline of the
accent at 32% alpha.

Only one of the three is contrast-safe. Core's, measured against its own
surfaces, composites to 1.63:1 on a card and 1.60:1 on the page, where WCAG 2.2
SC 1.4.11 asks for 3:1, so the app that used it had no conforming focus
indicator anywhere. A soft halo has the same problem in a milder form: its
strongest pixel is not its measured contrast.

## Decision

The double ring, `0 0 0 2px <surface>, 0 0 0 4px <focus>`, everywhere.

The inner band is the element's own backdrop rather than white, so the ring
reads on a card and on the page without a second variant. The outer band is the
accent at full strength; alpha is what made the other treatments fail.

Every ring in this system is a `box-shadow`, and forced-colors mode drops
box-shadows entirely, so the pattern is incomplete without a
`@media (forced-colors: active)` block restoring a real `outline` in the
system's own `Highlight` colour.

## Consequences

Easier: one treatment to test, and a contrast claim that can be computed rather
than eyeballed. The value is derived with `haus-colour-utils` and asserted.

Harder: a 4px ring needs room. A component packed tightly against a neighbour
will need spacing it did not need before, and a full-width input is the one
place the ring genuinely crowds its surroundings, which is why the text controls
change their border instead and say so.

This ruling is dated by the next product built on the system, which writes a
focus style on day one. Whatever it writes becomes a fourth entry in a list that
just got down to one.
