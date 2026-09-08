# 0014 · The brand contract is tiered: a base every product has, and a feedback tier only some do

**Accepted**, 2026-09-08. **Implemented in `brand.css`, `brand.test.ts` and the
generated `brand.ts`.** `haus#47`.

## Context

`brand.css` held 54 entries and every one was required. `brand.test.ts` asserted
the contract in both directions and once per brand file: every role reads an
entry, every entry is read, and every brand supplies all 54. `BrandMap` was
generated as a flat interface with 54 required keys.

That was written when haus had one brand and then two, and both were haus's own.
The 2026-09-08 assessment measured all three products against it and found the
contract describes exactly one shape of product.

**26 of the 54 entries are `info`, `success`, `warning` and `error`.** Those are
the four semantics of a notification. They are not universal:

- **core's statuses are the states of a decision**: proposed, accepted, rejected,
  superseded, deprecated. Five things, and not one of them is a notification
  severity. Mapping them onto the four is not a translation, it is an invention
- Measured, core can supply **14 of the 54 honestly**. The other 40 would be
  values chosen to satisfy a type, which is the thing `types.ts` already refuses
  in another context

So core could not be a brand. Not being a brand, it declared no roles. Declaring
no roles, it could import no component, because every component reads roles and
an unresolved `var()` drops the declaration silently. **A design system with an
adoption problem had a consumer it structurally could not accept**, and the
reason was 26 entries about notifications.

## Decision

**Two tiers.**

**The base tier is required**, 28 entries: surfaces, ink, borders, primary and
the backdrop. Every product has these whatever it is for, and nothing upstream is
a sensible substitute for a product's own surface or ink colour.

**The feedback tier is optional**, 26 entries across four ramps. A brand may omit
it.

**One rule holds the optional half honest, and it is the part worth arguing
about: all or nothing per ramp.** A brand supplies every entry of `warning` or
none of them.

## The mechanism already existed

**No CSS machinery was added, and that is the finding inside the finding.**

The default brand applies at `:root` and a named brand at
`[data-haus-theme="<name>"]`. Custom properties inherit. So a brand declaring only
the base tier has always inherited the feedback entries from `:root`, and has
always rendered correctly.

**The cascade did the right thing and the contract around it did not.** `BrandMap`
demanded all 54, and `brand.test.ts` failed a brand that supplied 28. Nothing was
broken except the two things asserting that it would be.

This is the fourth instance of the portfolio's recurring shape and the first
where the unread signal was a *rule* rather than a check: a constraint that had
been asserted rather than measured, holding for a case nobody had tried.

## Why all-or-nothing per ramp

Half a ramp is worse than no ramp, and the failure is invisible.

A brand that declares `error-default` in its own red and forgets `error-subtle`
gets its own hue for one and haus's cherry for the other. **Every `var()`
resolves perfectly well.** No check fires, no build breaks, nothing renders
unstyled. The result is an error state in two unrelated colours, and the only way
to notice is to look at it.

That is the same shape as `vault#32`, where an override was load-bearing for a
defect, and as the drift rename, where two vocabularies each resolved fine on
their own. A rule that only fires on a partial ramp is cheap and catches the one
case the type system cannot see.

## Verified by reverting

Three cases were run against the new contract rather than reasoned about:

| Probe brand | Expected | Result |
|---|---|---|
| 28 base entries, no feedback tier | passes | passes |
| 28 base entries plus `error-default` alone | fails on the ramp rule | fails, naming `error` at 1 of 6 |
| 27 base entries, `ink-primary` missing | fails on the base rule | fails, naming `ink-primary` |

`vault.css` supplies all 54 and does not move.

## Consequences

**Additive.** Both existing brands satisfy the stricter and the looser contract,
so `drift` and `vault` cannot break. It ships as a minor.

`BrandMap` is now `BrandMapBase & Partial<BrandMapFeedback>`, and
`brandRolesBase` and `brandRolesFeedback` are exported beside `brandRoles` for
anyone generating a brand rather than writing one.

**core can be a brand**, which is the point. `brands/core.css` supplies 28 base
entries and its five decision states stay core's own vocabulary rather than being
bent into four that do not fit.

**In Figma this is a mode.** A brand is a set of inputs and a mode is a set of
inputs, so the semantics collection grows a mode per brand. Figma modes do not
inherit the way the cascade does, so a partial brand in Figma aliases the same
primitives the default mode uses. That difference is recorded here because it is
the one place the two sides do not match by construction.

## What this does not do

It does not make the brand cover anything but colour. drift carries 19 deliberate
non-colour departures, in radius, elevation, z-index, opacity, border-width and
type, and none of them has an input to supply. That is `haus#48`, and it is the
other half of the same problem.
