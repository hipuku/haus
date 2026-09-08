# 0017 · The nineteenth component is a busy indicator, and nothing else qualifies

**Accepted**, 2026-09-08. **Measured, not proposed. Built the same day.**
`haus#55`. Applies [0013](0013-a-component-is-promoted-on-evidence.md).

**Building it found a fourth implementation and a defect, both inside haus.**
`Button` held its own spinner, which makes the count four products rather than
three. And **a loading `Button` never set `aria-busy`**: it was announced exactly
as a permanently disabled one, *"Saving, dimmed"*, with nothing to say the wait
was temporary. The spinner could not fill the gap because it is `aria-hidden`,
correctly, so the button was the only thing that could speak and did not.

Its own test had been called *"disables and marks itself busy while loading"*
since it was written, and asserted `disabled` and `aria-disabled` and nothing
else. **A test name that claims more than its body is the same defect as
`brand.test.ts`'s `startsWith('--haus-')` and the forced-colors filter that
matched nothing**, and this one had been read as coverage for as long as it
existed. Both halves are asserted now, and the new one was verified by reverting
the fix.

## Context

The 2026-09-08 assessment found haus's components barely adopted: eighteen
shipped and two in use anywhere. **The instinct when adoption is low is to add
components**, and this decision existed to record that the measurement said not
to.

It said something else.

## The first measurement was a filename grep, and it was wrong

The first pass listed vault's components with no haus counterpart and grepped
core and drift for those names. Every one came back zero, so the conclusion was
*haus stays at eighteen*.

**A filename grep asks whether another product used the same word.** 0013 asks
whether it solved the same problem. Redone as a sweep over ARIA roles and
behaviour, the way section 12 did it originally, one candidate appears in all
three products and had been invisible because each product calls it something
different or nothing at all.

## The nineteenth: a busy indicator

Built independently three times, at seven call sites, with **four separate
`.spinner` rules** across core and drift.

| | How | Sites | What it tells assistive technology |
|---|---|---|---|
| **core** | `<Loader2 size={15} className={styles.spinner} />`, a lucide SVG, its own `.spinner` rule in each of two CSS modules | 2 | **Nothing deliberate.** No `role`, no label, no `aria-hidden` |
| **drift** | `<span className={styles.spinner} aria-hidden="true" />`, its own `.spinner` rule in each of two CSS modules | 2 | **Nothing, deliberately.** Hidden outright |
| **vault** | a real `Spinner` atom, 17 lines, `size` prop | 3 | `role="status"` and `aria-label="Loading"` |

**Three answers to one question, and the two wrong ones are wrong in opposite
directions.** core says nothing at all, so an unnamed graphic may be announced or
may not. drift says *ignore this*, so a screen reader user waiting on a crawl is
told nothing is happening. vault is correct.

That is the `haus#28` Callout argument exactly: *they disagree on the only hard
part.* A spinner's CSS is a keyframe. **Its contract is whether the busy state is
announced, and whether it is announced twice when adjacent text already says
"Extracting…"**, which is the case vault's own call site has and no rule covers.

The defect becomes a prop rather than a fix, per 0013: the component takes the
label, and `aria-hidden` is expressible only by saying what announces instead.

## What does not qualify, and the closest miss

**A disclosure**, a button toggling a region, appears in all three: core's
`DecisionMeta`, drift's `overviewSection` and `DevHarness`, vault's
`StepEditControl`, `FontPreviewControl` and `UnitsControl`.

**One of the three wires `aria-controls`.** core's does; drift's and vault's do
not. So the pattern has a real defect and the same shape as the Tabs finding.

**It is still not promoted**, because what the three share is a rule rather than a
component. The regions differ completely: a metadata dossier, an audit section, a
font preview. A component that owned the button and left the region to the caller
would be a `<button>` with one attribute, and 0013's exclusion list already holds
things that are one product's answer to one product's problem. **Recorded as a
candidate rather than closed**: a second product wiring it wrongly *in the same
shape* would change the answer.

The rest of vault's set is confirmed vault-only, now by behaviour rather than by
name: `BrandWordmark`, `EditableName`, `IconButton`, `MenuOption`, `Panel`,
`Pill`, `SegmentedControl`, `TriggerPill`, `ConfirmDialog`, `ContrastChip`,
`CopyButton`, `Drawer`, `FavouriteToggle`, `FontPreviewControl`, `SectionGrid`,
`StepEditControl`, `TagGroup`, `TagSelect`, `Toolbar`, `UnitsControl`.
`role="toolbar"` and `role="menu"` appear in core once each and nowhere else;
`role="progressbar"` in drift once. One product is not evidence.

## Consequences

**haus goes to nineteen, not eighteen**, and the decision this record was written
to defend is reversed by its own method. That is the intended behaviour of a rule
that promotes on evidence: it has to be able to say yes.

**The adoption argument is unchanged.** Nineteen components with two in use is the
same problem as eighteen with two. This is not a response to the adoption number,
and it is worth keeping the two apart: the component was promoted because three
products built it and disagreed about accessibility, not because haus needed
something to ship.

Building it is `haus#55` and is not part of this record. **A decision to promote
and a promoted component are different things, and conflating them is how a
register comes to assert work that never happened**, which this repository has
already corrected once.
