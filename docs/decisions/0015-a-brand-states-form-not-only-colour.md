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

## Half of this tier looked inexpressible in Figma, and is not

**The first version of this section was wrong and is withdrawn.** It said elevation
cannot follow a Figma mode, so a second brand would need its own effect styles or
the difference would stay code-only.

**Tested against the live file on 2026-09-08 by the user's Figma agent: every field
of a drop shadow binds to a variable, and the binding works on an effect style, not
only on a node.** Colour, blur, spread, offsetX and offsetY. A node using the style
inherits the bindings and resolves them per mode. Confirmed on `elevation/raised`,
then reverted.

**So a mode changes a shadow the same way it changes a colour**, and the three
styles stay three.

### How the wrong claim was reached, because that is the useful part

`figma/STYLES.md` states two true things:

> Can one reference another? **no, none**

> Figma has no shadow variable type at all [...] collection 1 holds `FLOAT`,
> `STRING` and `COLOR` and nothing else.

Both are correct. **The inference from them was not.** Style-to-style aliasing is
one axis; binding a style's individual fields to variables is a different one, and
nothing in that document speaks to it.

**The answer was inside the sentence used to reach the wrong conclusion.** A drop
shadow is five numbers and a colour. `FLOAT` and `COLOR` are exactly the two types
that sentence says collection 1 holds. Reading "there is no shadow variable type"
as "shadows cannot be variable-driven" skipped the step where a shadow is made of
things that do have types.

**A claim reasoned from a document rather than run.** That is the same shape as the
drift measurement earlier the same day, which compared a consumer against a version
it does not install, and the same shape as every finding in section 10 of
`PORTFOLIO.md`, only inverted: the usual defect is a check nobody has watched fail,
and this is an assertion nobody has watched run.

### The asymmetry that does survive, smaller than claimed

Code and Figma still brand elevation at different granularities, and this part was
not wrong:

| | What a brand states |
|---|---|
| **Code** | one alias per role, `--haus-brand-elevation-raised: var(--haus-shadow-sm)` |
| **Figma** | five bound values per shadow layer, because there is no shadow variable to alias |

Same result, different shape, and it is a mechanism difference rather than a
meaning one. The claim that a Figma mode and a `data-haus-theme` value are the
same object holds.

### Not built yet, deliberately

Binding the three styles costs roughly 25 variables, and **there is no second
shadow ramp in the file to use them.** drift's is the first, and it arrives with
`D2`. Building the bindings before a second brand exists is a speculative 25
variables, so this is recorded as the chosen approach and scheduled with `D2`
rather than done now.

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
