# 0015 · A brand states form as well as colour, and form is four things

**Accepted**, 2026-09-08. **Implemented as the form tier in `brand.css`.**
`haus#53`. Follows [0014](0014-the-brand-contract-is-tiered.md).

## Context

`brand.css` covered colour and nothing else. A product wanting a tighter corner
radius or its own shadow ramp had **no input to supply** and could only override
the resolved role, which is what drift does through cascade order.

The obvious fix was to make everything brandable: radius, elevation, z-index,
opacity, border-width, and the type and space ladders. That was the first draft
of this decision and it was wrong, for a reason worth recording.

## The measurement, and the correction inside it

drift overrides 148 of haus's roles. The first pass counted **19 non-colour
departures** and proposed a brand group for each family. Redone against
`haus-tokens@1.0.0`, **which is the version drift actually installs**, rather than
against haus's working tree at 2.x:

| | Count | What it is |
|---|---|---|
| Hardcodes the literal a haus primitive resolves to | **12** | eight `z-index` roles at `0` to `600`, `border-width` at `1px` and `2px`, `opacity` at `0.4` and `0.6` |
| Version skew | **2** | `display-tracking` and `heading-lg-tracking`, byte-identical to haus 1.0.0 and different only from 2.x, because `haus#37` retightened them after drift's file was written |
| **Genuine departures** | **5** | three `radius` roles one step tighter, two `elevation` roles on drift's own `--shadow-*` ramp |

**Comparing a consumer against a version it does not install manufactures
departures that are really version skew, and it does so in the flattering
direction: it makes a copy look like a decision.** Twelve hardcodes and two skews
were about to become ninety brand entries nobody needed.

## Decision

**The form tier is radius and elevation. Seven entries, optional, all or nothing
per group.**

`radius-pill` stays out. It is `var(--haus-radius-full)`, which is not a step on a
scale but "as round as the box allows". A brand setting it to something else would
not have a rounder pill, it would have a Badge that is no longer a pill.

**Not in the brand, deliberately: z-index, opacity, border-width and the space
ladder.** Nobody re-decides them. drift appeared to override twelve and every one
resolved to the value haus's own primitive already gives.

## The claim this bought

**What makes two products look different is colour, typeface, shadow and corner
radius. Not the spacing rhythm, not the stacking order.**

Those are structural. Both consumers took haus's unchanged, and the appearance of
re-deciding them was typing rather than choice. That claim is worth more than the
tier it justifies, and it was only available because the twelve hardcodes were
separated from the five decisions.

The evidence for the shadow half is on the record already and was not read as
evidence at the time: **six names were deliberately not renamed** in drift's 1.0
migration, `--font-sans`, `--font-mono` and the four `--shadow-*` steps, because
pointing them at haus's "would have changed the product's face and its shadow ramp
while every test stayed green." That sentence is a list of what a brand should
own, written a release before anyone asked the question.

## Typeface is deferred, and the reason is versioning

Typeface belongs in this tier by the same argument, and it is not here.

`--haus-font-sans` and `-mono` are **primitives**, read directly by 32 component
sites under a documented exemption: *"primitives whose own name already is the
role, so no alias exists."* That reasoning holds exactly as long as there is one
brand.

Making them brandable means the role and the primitive stop sharing a name, so the
declaration moves out of `primitives.css`. For anyone importing the whole token
stack that is invisible. **For a consumer importing `primitives.css` alone it is a
removal**, and core is exactly that consumer today. Under
[0004](0004-versioning-is-1-x.md) that is a major, and this decision is a minor.

Filed separately rather than smuggled in. A tier that is right and a version that
is wrong is still wrong.

## Half of this tier cannot exist in Figma, and that is structural

Recorded here rather than discovered later. In code the seven form entries behave
identically. In Figma they split exactly down the middle:

| Form tier | In Figma | Can a mode change it? |
|---|---|---|
| 4 radius roles | semantic variables, aliasing primitives | **yes** |
| 3 elevation roles | effect styles | **no** |

**Figma has no shadow variable type at all**, which is why shadows are styles, and
`figma/STYLES.md` already measures the consequence: effect styles cannot reference
one another, where variables carry 184 aliases. Styles have no modes either.

So when `brands/drift.css` states its own shadow ramp, the Figma file cannot
express that as a fourth mode. It needs separate effect styles, or the difference
stays code-only and documented. The question is open in
`FIGMA-CHANGES-haus53.md` and is worth answering before `D2`, because it decides
what a brand *is* in the Figma file as against in the package.

This is the second asymmetry of its kind, after 0014's, and both point the same
way: **a Figma mode and a `data-haus-theme` value are the same object only for
variables.** The claim in `theming.md` that they are simply the same object is
true of colour and radius and false of elevation.

## Consequences

**Additive, and nothing renders differently.** All seven roles resolve through the
new brand entries to the same primitives they read before, checked by walking the
chain rather than assumed. `vault.css` supplies none of the form tier and passes,
because the tier is optional and none is a legal amount.

`BrandMap` is now `BrandMapBase & Partial<BrandMapFeedback> & Partial<BrandMapForm>`,
with `brandRolesForm` exported beside the other two.

**`D3` gets smaller.** drift's five real departures become a `brands/drift.css`
that states them, and the twelve hardcodes are deleted rather than migrated, which
moves them from this issue to `D1`.
