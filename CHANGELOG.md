# Changelog

Five packages, released independently. Entries are grouped by package, newest
first, and only cover what a consumer sees: an internal refactor with no
observable effect does not appear here.

This file starts at Unreleased. **The releases before it have no entries, and
that is the honest position.** `haus-components` went 0.2.0 to 0.4.0 with a
breaking change in between and nothing recorded it, so reconstructing those
notes now would mean inventing them from commit messages written for a different
purpose. Everything from here is written as it lands.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [decision 0004](docs/decisions/0004-versioning-is-1-x.md): a
token rename is a major at an identical value, and a contrast change is a major
even when the hex barely moves.

## haus-tokens 5.1.0

*2026-09-11. Two spacing steps below the 4px grid.*

**Added** · **`--haus-space-px`** (1px) and **`--haus-space-0-5`** (2px). Optical padding
inside a small control, where the smallest step, 4px, is visibly too much: vault's Badge
pads 1px top and bottom, and its inline-edit field 2px. Both were literals with no step to
land on. drift made the same call for itself, as
`--space-hairline` and `--space-tight`. Additive: no role reads them and nothing moves.

## haus-components 3.1.0

*2026-09-10. IconButton gains a large size, level with a default Button.*

**Added** · **`IconButton` `size="lg"`**, 36px (`--haus-control-height-md`), the
height of a default `Button`. An icon-only action beside a labelled one, core's
settings gear next to its New decision button, had no size that stood level with
it: `md` tops out at 28px. The glyph is `icon-lg`, which keeps the 6px clearance
the smaller sizes have. Additive: `sm` and `md` do not move.

## haus-components 3.0.0

*2026-09-10. The native Select is retired, and Listbox becomes Select.*

**Removed** · **The native `<select>` `Select`.** Measured across every consumer in
the portfolio, nothing imported it, two releases after decision 0020 recorded the
same gap ([decision 0025](docs/decisions/0025-select-is-the-themed-control.md)). A raw
`<select>` is still the right answer on touch and in a form that must work without
JavaScript; write the element rather than importing a component for it.

**Changed** · **`Listbox` is renamed to `Select`.** The themed control two products
built takes the name a consumer reaches for. `Listbox`, `ListboxProps`,
`ListboxOption` and `ListboxSize` become `Select`, `SelectProps`, `SelectOption` and
`SelectSize`; the native select's own props are gone. Migrate a `Listbox` import to
`Select`.

**Changed** · **Requires `haus-tokens@^5.0.0`**, for the renamed `label-*` type roles.

## haus-tokens 5.0.0

*2026-09-10. The label roles become one `label-*` family.*

**Changed** · **The three label type roles are renamed** so every label role reads
`label-<x>`: `--haus-type-label-*` (the default label) becomes
`--haus-type-label-md-*`, `--haus-type-field-label-*` becomes
`--haus-type-label-field-*`, and `--haus-type-caption-*` becomes
`--haus-type-label-caption-*`. `label-xs`, `label-sm` and `label-eyebrow` keep their
names. The values do not change: a token rename is a major at an identical value
([decision 0004](docs/decisions/0004-versioning-is-1-x.md)).

## haus-tokens 4.2.0

*2026-09-09. A 28px step, where the type ladder skipped from 24 to 30.*

**Added** · **`--haus-text-28` (28px / 1.75rem)**, between `--haus-text-24` and
`--haus-text-30`. The ladder jumped 6px there against 1-to-2px steps lower down, and a
second product's largest specimen sample landed in the gap and carried a local for it.
Additive: no role reads it yet, and nothing moves.

## haus-components 2.7.0

*2026-09-09. Modal gains an xl size; Popover reads width tokens and gains xl.*

**Added** · **`ModalSize` gains `'xl'`**, 896px through `--haus-modal-width-xl`, for
wide dashboards and side-by-side previews.

**Added** · **`PopoverWidth` gains `'xl'`**, 420px, the width the two-line option
rows a Listbox draws want.

**Changed** · **Popover's three fixed widths read `--haus-popover-width-*`** rather
than the 180/260/340 they had hardcoded, so a brand can restate them the way it
already can restate a modal's. No visual change at the default brand. Needs
`haus-tokens` 4.1.0.

## haus-tokens 4.1.0

*2026-09-09. A fourth modal width, and popover widths become tokens.*

**Added** · **`--haus-overlay-width-xl` (896px) and `--haus-modal-width-xl`**, so
Modal is four sizes not three. A second consumer shipped a four-step modal scale
against haus's three; rather than leave the fourth as a consumer's local, a group
the brand contract cannot hold as an optional member, haus took it. The values
stay haus's web-app proportions and a denser product restates all four through
`--haus-brand-modal-width-*`.

**Added** · **the `--haus-popover-width-*` roles (180 / 260 / 340 / 420)**, with
their `--haus-panel-width-*` primitives and `--haus-brand-popover-width-*` brand
entries. Popover's widths were literals in the component; they are the
popover-scale sibling of modal width now, themeable through the brand tier the
same way. `popover` is a fifth optional form group in the brand contract.

## haus-components 2.6.0

*2026-09-09. A clickable card can be a router link.*

**Added** · **`asChild` on `Card`**, plus `CardOwnProps` and `CardAsChildProps`.
The third and last component decision
[0022](docs/decisions/0022-ownership-is-stated-in-both-directions.md) names, and
the one it reopened rather than filed.

`as` stays, and the two are not the same tool twice. `as` covers what it was
built for, where the right element is a plain intrinsic one and the reason is the
document outline: `article`, `li`, `section`, `aside`. The argument in
`CardElement`'s comment against a *generic polymorphic* `as` is still right and
is not overturned.

**`asChild` covers what `as` cannot reach**: a clickable card that is a router
link. `as="a"` renders haus's anchor, and the whole point is that the router's
`Link` is the thing that must render. Widening `CardElement` to every element
name would not help, because the element was never the problem.

They are mutually exclusive: the child supplies the element and `as` names one.

**The child keeps its own children**, which is the opposite of `IconButton` in
2.4.0. A Card is a wrapper around content and the content is the caller's; an
icon button's only child is the icon the component was given. The two answer the
same question differently on purpose, and each has a test saying so.

**Both guards fired on this change before it was finished.** `barrel.test.ts`
reported the two new type names missing from `src/index.ts`, and
`rsc-rules.test.tsx` reported `Card` gaining `asChild` with no entry in its props
map. Neither was noticed by reading the diff. That is two components running
(`IconButton`, `Card`) where the guards caught the omission first, one commit
apart.

## haus-components 2.5.0

*2026-09-09. Two of every three tabs pointed at nothing.*

**Fixed** · **`aria-controls` referenced panels that were not in the document.**
Only the active panel is ever rendered, and every tab pointed at its own
generated panel id, so a three-tab group shipped one panel and **two dangling
IDREFs**.

In the component whose stated reason for owning both ends is that *"the wiring
between a tab and its panel is precisely what all three products got wrong"*.

**Nothing caught it.** The suite runs axe and passes, because
`aria-valid-attr-value` does not resolve `aria-controls` against the document
here, and the component's own tests asserted the attribute was *present* rather
than that it *resolved*. Present and correct are different assertions and only
one was being made. Found while building `panelId`, by writing the assertion the
other way round.

An omitted `aria-controls` is valid and a broken IDREF is not, so it is set on
the selected tab and left off the rest. If you assert on that attribute for
inactive tabs, that assertion was testing a bug.

**Added** · **`panelId`, for a consumer whose two halves are not adjacent.**
`haus#67`, and the second thing built on decision
[0022](docs/decisions/0022-ownership-is-stated-in-both-directions.md).

core's decision editor puts the Write / Preview switch in a sticky toolbar and
the content it controls in the document sheet, with the whole editor form in
between. Adopting `Tabs` meant moving the entire editor body inside the
toolbar's wrapper, so core kept a hand-rolled tablist and none of the contract.

With `panelId`, `Tabs` renders no panel and the selected tab points at the
element the caller renders. **The roving tabindex, the arrow keys, Home and End
are unchanged**, which is the part worth having and the part every product gets
wrong: owning your own panel must not cost you the contract.

**The generated panel stays the default.** A consumer who has not thought about
it still gets a correct one, which is the whole argument for this component.

**Added** · **`tabIdFor(id, value)`**, exported, for wiring `aria-labelledby` on
a caller's panel. A published function rather than a documented string template,
because a template in prose is a contract nothing checks: the caller writes it
once, `Tabs` changes its scheme, and the panel silently stops being labelled.
`id` is required alongside `panelId` for the same reason, since tab ids are
otherwise `useId`-generated and uncomputable.

**Added** · `TabsOwnPanelProps` and `TabsRemotePanelProps`, per decision
[0023](docs/decisions/0023-a-union-prop-type-exports-its-halves.md).

## haus-components 2.4.0

*2026-09-09. An icon-only link can be one.*

**Added** · **`asChild` on `IconButton`**, plus `IconButtonOwnProps` and
`IconButtonAsChildProps`. `haus#70`, the first thing built on decision
[0022](docs/decisions/0022-ownership-is-stated-in-both-directions.md).

core's workspace-settings gear is a 36px square, icon only, inside a Next
`<Link>`. It was the last element keeping `.btn` and `.btn--icon` alive in core's
`globals.css`, because both workarounds were worse: `Button asChild` plus a class
to square it is a consumer overriding haus's geometry, which is exactly what that
migration existed to delete, and it silently disagrees with `IconButton` about
what an icon button's box is.

**The glyph replaces the child's children rather than being appended to them.**
That is the question `haus#70` raised and `Button` never had to answer. Button's
children are the caller's, so it appends; here they are not. `icon` is the
content and this component's contract is that it is the *only* content, which the
other half of the union already states by omitting `children` from the element
attributes. A caller who puts text in the child wants a `Button`.

`label` still lands as `aria-label`: the child supplies the element, not the
name, and an anchor wrapping an SVG announces as a link and nothing else without
it. `loading` is absent from the `asChild` half for the same reason it is absent
from Button's.

**Changed (internal)** · `mergeRefs` moved to `internal/asChild.ts` and both
components call it. Copying it per component would have restated the exact
function `haus#71` shipped a defect in, with nothing keeping the copies in step,
which is the defect this design system exists to detect. `childRefOf` moved with
it, since reading a ref from props or from the element depending on the React
version is the same knowledge.

**The guard added in 2.3.1 earned itself on the first change after it.**
`rsc-rules.test.tsx` reads the `asChild` components from the directory, so
`IconButton` was covered the moment it gained the prop, and its props map failed
by name until an entry was added. That is the list-beside-a-directory defect not
happening, for once.

## haus-components 2.3.1

*2026-09-09. The RSC row is not blank any more.*

**Added** · **`rsc-rules.test.tsx`**, which asserts that no component attaches a
ref it was not given. `haus#72`. No runtime change; this release is a test and a
decision.

`haus#71` shipped because nothing here could see it. The 30 component suites
render on a client, where a stray ref is legal, and `ssr.test.tsx` renders
through `renderToString`, which is server *rendering* and not React Server
Components: it accepts a ref happily and an RSC render rejects it. **The RSC row
of that table was blank, and the blank row was the finding.**

The guard renders each `asChild` component with no ref on either side and fails
if one arrives, and a second case gives a ref and requires it to arrive, because
the way to get the `haus#71` fix wrong in the other direction is to drop the
merge entirely. The component list is **read from the directory** rather than
typed, so a component that gains `asChild` is covered the day it gains it, and
the props map is checked in both directions so it cannot silently go stale.

It was proved able to fail: deleting the `real.length === 0` guard from
`mergeRefs` fails it with *"Button attached a ref nobody asked for"*.

**The limit is stated rather than implied.** This catches a ref attached unasked
and nothing else. A real RSC harness would also catch a hook where none is
allowed or an event handler in a server tree, and it is a dependency this package
has refused before; decision
[0024](docs/decisions/0024-the-rsc-path-is-guarded-by-its-rule.md) records why
the narrow option was taken and what would justify revisiting it. What tips it is
that `asChild` is the only path here that can attach a ref unasked, and
[0022](docs/decisions/0022-ownership-is-stated-in-both-directions.md) is about to
put `asChild` on two more components.

## haus-components 2.3.0

*2026-09-09. The two halves of `ButtonProps` have names.*

**Added** · **`ButtonOwnProps` and `ButtonAsChildProps`**, exported beside
`ButtonProps` from the component barrel and the package root. `haus#66`.

`ButtonProps` has been a discriminated union since 2.1.0, so that `asChild` could
forbid `loading`, `href` and `target`. That works for callers and **breaks
wrappers**: a component that accepts the whole union and spreads it does not
compile, because the compiler cannot rule out the `asChild` branch, whose
`children` is a single element. A wrapper rendering an icon beside a label is
rejected even though it never passes `asChild` and could not.

Both of core's wrappers hit this on 2.1.1 and got out with
`Extract<ButtonProps, { asChild?: false }>`. That is the right meaning and the
wrong place for it: every consumer writing a wrapper would rediscover the same
`Extract` and keep it in step by hand. **`ButtonOwnProps` is that type with a
name**, and the union is now written from the halves rather than the halves being
extracted back out of it.

Purely additive; `ButtonProps` is unchanged and no existing code needs editing.
Decision [0023](docs/decisions/0023-a-union-prop-type-exports-its-halves.md).

**Added** · A self-test on `barrel.test.ts`, which had none. The check that every
exported type reaches both barrels is the one thing standing between a new type
and the gap `haus#65` describes, and **it had never been seen to fail.** Its two
helpers now take source strings rather than paths, so the self-test drives the
real code rather than a copy of its regexes, and a renaming re-export
(`export type { A as B }`) is covered because the filter keys on the local name.

The check earned itself on this change: the two new type names passed it without
it being edited, and removing either from `src/index.ts` fails it by component
name.

## haus-tokens 4.0.0

*2026-09-09. The drift brand is gone, because drift is gone.*

**Removed** · **`brands/drift.css`.** drift took its whole token layer in-house
on 2026-09-09 and no longer installs this package, so the file was a brand for a
consumer that does not exist. Its reasoning is drift's and it is a good one: a
tool whose subject is reading a product's shipped CSS and reporting what its
token layer actually does should not be wearing the design system it sits beside.

**This is a breaking change for anyone importing `haus-tokens/brands/drift.css`,
and the honest position is that nobody was.** It shipped from 2.3.0 with exactly
one consumer, and that consumer left. It is a major under decision 0004 anyway,
because a removed export is a removed export whether or not the removal is
observed.

**What is not removed, and why.** The form tier stays at seven entries. drift is
the measurement that produced it: 19 apparent non-colour departures, of which 12
hardcoded a literal a haus primitive already resolves to and 2 were version skew,
leaving five real ones. That measurement does not become wrong because the
consumer left, and `docs/decisions/0015` still rests on it. Likewise `guard.ts`
and `brand.ts` still cite drift's 89 restatements, which happened.

**The contract still has two implementations.** `brands/core.css` and
`brands/vault.css` remain, so the claim a second brand exists to prove, that the
base and feedback tiers hold across more than one palette, is still proven.
`brand.test.ts` and the build both read `src/brands` as a directory rather than a
list, so nothing needed editing to drop the file: **the fix for haus#53 is what
made this a one-line removal instead of a fifth instance of the same defect.**

## haus-components 2.2.2

*2026-09-09. A portalled Popover was behind the thing it escaped.*

**Fixed** · **`Popover portal` rendered the panel underneath its own Modal.**
`haus#73`. Portalling is what a caller reaches for when something clips, and the
thing that clips is usually a `Modal`, whose backdrop sits at `z-modal` (400).
An un-portalled panel is a descendant of that backdrop and stacks inside it; a
portalled one is a sibling, so `z-dropdown` (100) put it **behind the dialog it
was opened from**. 2.2.0 traded a clipping bug for a stacking one.

The portalled panel takes `z-modal` now, not something above it: it is rendered
into `document.body` after the modal, and equal z-indexes are decided by
document order, so it clears the dialog while still sitting under `z-toast` and
`z-tooltip`. A toast about what just happened belongs over an open menu.

Asserted in `stylesheet.test.ts` against the built artefact rather than in
Popover's own suite, because jsdom does not compute CSS modules: a component
test can only see that the class was applied, and the class is not the claim.

## haus-components 2.2.1

*2026-09-09. `asChild` no longer throws in a Server Component.*

**Fixed** · **`<Button asChild>` rendered from a React Server Component threw**
*"Refs cannot be used in Server Components, nor passed to Client Components."*
`haus#71`. The ref merge always returned a callback, even when neither Button
nor the child had a ref, so every cloned child got one it never asked for. On
the client that is wasteful; in a Server Component a ref is illegal, and
`asChild` is the one path in this package that can attach one without the caller
doing anything. It returns `undefined` when there is nothing to merge now.

**Worth knowing:** this package ships no `"use client"` directive, so a Server
Component can render a haus component directly, and for the ones holding no
state that is a feature rather than an oversight. It also means the
presentational components are on the RSC path and nothing was testing that. No
unit test here can reproduce the throw, because neither jsdom nor
`renderToString` enforces the RSC rules, so the new tests assert the cause: that
`cloneElement` is given no `ref` key when neither side has one, and is given one
when a ref genuinely exists.

## haus-components 2.2.0

*2026-09-09. A Popover can escape what clips it.*

**Added** · **`Popover` takes `portal`**, and `Listbox` passes it through.
`haus#68`. A Popover inside a Modal was clipped at the dialog's edge: `Modal`'s
body is `overflow-y: auto`, which is a clipping context, and the panel is
`position: absolute` against the caller's ancestor inside it.

**`placement` could not answer this one.** The stylesheet already declines
collision detection and says `placement` is the caller's answer to it, which is
right, but clipping is not collision: flipping to `top` clips at the other edge
instead. A consumer cannot remove the modal's `overflow-y` either, because long
dialogs need it.

**Off by default**, so nothing existing moves and the package still ships no
positioning engine. When on, the panel goes through `createPortal` and is placed
from the trigger's rect, remeasured on scroll and resize **while open only**.
There is still no collision detection: nothing flips and nothing shifts, and the
panel goes exactly where `placement` and `align` say. It is the same placement
in viewport coordinates rather than the ancestor's.

`portal` is a caller's decision for the same reason `placement` is: the consumer
knows whether it sits inside a scrolling container, and the panel cannot.

## haus-components 2.1.1

*2026-09-08. A glyph two steps too large, and a type nobody could import.*

**Fixed** · **`IconButton` drew its glyph from the wrong rung.** `md` took
`icon-md` (20px) inside a 28px box and `sm` took `icon-sm` (16px) inside 24px.
The scale's own documentation pairs `icon-md` with *"body-lg and heading-sm"*
and `icon-sm` with *"label and body-sm"*, and this control's type role is label,
so both were one step high. Measurement agrees: core draws **13px and 14px**
glyphs in its 28px icon button, so 20px was larger than any consumer had asked
for. Now `icon-sm` at `md` and `icon-xs` at `sm`, which also gives both sizes the
same 6px of clearance.

**Fixed** · **`ToastAppearance` was not exported from either barrel**, so it
could not be imported by name. Found by the new check below, on its first run,
and it predates 2.1.0.

**Added** · **A check that every exported type is reachable from the package
root**, `haus#65`. `TabsAppearance` shipped in 2.1.0 unreachable, past build,
typecheck, lint and 373 tests. `api-surface.test.tsx` could not see it, because
that asserts over values and a type has no runtime presence. The new test reads
the components directory rather than a list, so it cannot become the next list
beside a directory, which is the shape this defect belongs to.

## haus-components 2.1.0

*2026-09-08. Two new components, `asChild`, a segmented Tabs, and a Modal fix.*

A minor: everything is additive, and no existing call site renders differently.
Requires `haus-tokens@^3.2.0`, which `IconButton` needs for its smaller size.

**Added** · **`IconButton`**, the twentieth component, `haus#58`. Promoted on
evidence, and the evidence had to be found by behaviour rather than by name:
`PORTFOLIO.md` 13.5 recorded core as having none because core's is a CSS class
and not a component file. Measured properly, core has 7 sites and vault a full
`.icon-btn` set, and both independently grew a size axis and a tone axis.
**Both sizes are measured, and the smaller one is a rule**: `md` is 28px, which
is what both products already draw and is already `--haus-control-height-sm`;
`sm` is 24px, the **WCAG 2.5.8 AA minimum target size**, which makes core's 22px
and vault's 20px both under the floor and not worth porting up. `label` is
required, because an SVG contributes nothing to the accessible name.

**Added** · **`Listbox`**, the twenty-first, `haus#61`,
[decision 0020](docs/decisions/0020-listbox-and-select-both-stay.md). Two
products replaced the native `Select` and wrote down the same reason, and core's
hook already said it was written to stay diffable with vault's *"until one of
them moves to haus"*. An option carries a `hint`, a second line the platform's
own popup cannot draw, and that field is the whole argument for the component.
It composes `Popover`, keeps focus on the trigger, and announces the active row
through `aria-activedescendant`. **It does not replace `Select`**, and 0020
records that `Select` currently has no consumers rather than leaving that to be
discovered.

**Added** · **`Button` takes `asChild`**, `haus#57`. Renders the single child
with Button's classes merged in, so a router's link can be a Button: `href`
renders haus's own anchor, which costs client-side navigation and prefetch.
Deliberately not a polymorphic `as`, which Card's own documentation argues
against. `ButtonProps` is a union, so `loading`, `href` and `target` are
**compile errors** alongside `asChild` rather than silent no-ops. Both refs are
called, Button's and the child's.

**Added** · **`Tabs` takes an appearance**, `haus#60`.
`'underline' | 'segmented'`, defaulting to underline so nothing existing moves.
Its own type rather than the shared `Appearance`, which is `'subtle' | 'solid'`
and means fill weight.

**Fixed** · **`Modal` closed on a press that started inside it**, `haus#56`. A
click's target is the nearest common ancestor of its pointerdown and pointerup,
so selecting text to the edge of a dialog and releasing outside dispatched a
click whose target was the backdrop, and the dialog dismissed. It now requires
both ends of the press on the backdrop. The existing suite could not express
this: `fireEvent.click` synthesises neither the pointerdown nor the ordering.

## haus-tokens 3.2.0

*2026-09-08. A fourth control height.*

**Added** · **`--haus-control-height-xs`, 1.5rem**. The floor for a target that
has no spacing exception, and the size `IconButton` takes for `sm`. It is the
fourth step `PORTFOLIO.md` 13.6 already listed as a gap a consumer had filled
locally: vault declares `--control-height-xs` at exactly this value. Added to
`tokens.json`, which generates `primitives.css`.

## haus-tokens 3.1.0

*2026-09-08. core's brand takes the radius form group.*

A minor: four additive entries in `brands/core.css`, no existing declaration
moved, and no consumer outside the `core` brand mode renders differently.

**Added** · **The radius form group in `brands/core.css`**, taking core off the
base tier alone. `C1` gave core the base tier only, so it inherited
`radius-control` at 8px while its own controls, panels and icon buttons were
drawn at 5px. `C3` slice 2 put haus Buttons beside them and the mismatch became
visible in the product.

**core is not drift's shape**, which is the part worth recording. drift's `D3`
sits one step tighter than haus at all three sizes, and assuming core did the
same would have moved a rung nothing asked to move. Measured against what core
renders: controls at 5px against haus's 8px, one step tighter; `.panel` at 11px,
which is haus's own surface rung; the modal at 11px against haus's 16px, one
step tighter again. **core departs on control and overlay and agrees on
surface**, so a second brand joining a group is not evidence about the shape of
the group.

`radius-marker` is stated at haus's own value because the form tier is all or
nothing per group. core has no checkbox of its own to measure, so it takes
haus's rung rather than inventing one. The guard was checked by breaking it:
deleting that line fails `core.css supplies whole optional groups or none`.

## haus-components 2.0.0

*2026-09-08. The nineteenth component, the `aria-busy` fix, and a `haus-tokens 3.0.0` floor.*

A major because the dependency crossed one. `Modal` reads `--haus-modal-width-*`
and the package reads its typeface through a role, so it now requires
`haus-tokens@^3.0.0` where 1.0.0 required `^1.0.0`. Raising a dependency across a
major is breaking for a consumer, so it is a 2.0.0 and a consumer migrates once
rather than twice. Released for `C2`/`C3`, when core became the consumer ready to
install it.

**Added** · `Spinner`, the nineteenth component, `haus#55`,
[decision 0017](docs/decisions/0017-the-nineteenth-component-is-a-busy-indicator.md).
Promoted on evidence: all three products built one and haus's own Button held a
fourth, and the four gave three different answers to whether the wait is
announced. `label` announces by default. **`announcedBy` takes the text that
speaks instead of a boolean**, so silencing the spinner requires naming what
covers it: every product that got this wrong got it wrong by hiding the ring and
putting nothing in its place.

**Fixed** · **A loading `Button` never set `aria-busy`**, so it was announced
exactly as a permanently disabled one: *"Saving, dimmed"*, with nothing to say
the wait was temporary. Its own test had been named *"disables and marks itself
busy while loading"* since it was written and asserted only `disabled` and
`aria-disabled`. Button now sets `aria-busy` and draws with `Spinner` rather than
its own copy.

---

## haus-tokens 3.0.0

*2026-09-08. Typeface becomes brandable, and core becomes the third brand.*

A major for one reason: a token left `primitives.css`. Everything a consumer
importing the whole token stack sees is additive; the break is only for a
consumer importing `primitives.css` alone, which is core, and core does not read
the font primitives, so nothing breaks in practice. The version says so anyway,
because [decision 0004](docs/decisions/0004-versioning-is-1-x.md) makes a moved
token a major at an identical value.

**Removed** · `--haus-font-sans` and `--haus-font-mono` are no longer in
`primitives.css`. Import the full stack (or `semantics.css`) and the role of the
same name still resolves; import `primitives.css` alone and they are gone. This
is the whole of the major. `haus#54`,
[decision 0019](docs/decisions/0019-typeface-is-a-form-tier-brand-entry.md).

**Added** · `brands/core.css`, the third brand, `C1`. Base tier only: core's
statuses are the states of a decision, not the four semantics of a notification,
so it omits the feedback tier and inherits it. It brings its own warm-paper and
cobalt ramps rather than borrow damson.

**Added** · Typeface joins the form tier: `--haus-brand-font-sans` and
`--haus-brand-font-mono`, optional and all-or-nothing per group like radius and
elevation. `BrandMapForm` gains the two, so a brand supplying one supplies both or
fails the consumer's build. vault states Manrope Variable, drift system-ui, core
Gabarito.

**Changed** · The `--haus-font-sans` and `--haus-font-mono` *roles* now live in
`semantics.css` and read the brand entry. The role name is unchanged, so no
component that reads it moved, and a full-stack consumer renders identically.

## haus-tokens 2.4.0

*2026-09-08. drift's brand grows its radius group.*

**Added** · Four `radius` entries in `brands/drift.css`, taking it to 58. drift
sits one step tighter than haus at all three sizes, and states `radius-marker` at
haus's own value because the form tier is all or nothing per group.

**`elevation` is deliberately absent, and that is a limitation worth naming.**
drift's two elevation roles point at its own `--shadow-*` ramp, which haus does
not ship, and **a brand may only reference what haus ships**. So the form tier
carries drift's radius and cannot carry its shadows: those two stay in the
product. A brand file living inside the design system can only express the parts
of a product's identity the system already has vocabulary for.

---

## haus-tokens 2.3.1

*2026-09-08. 2.3.0 announced a brand the package did not contain.*

**Fixed** · `brands/drift.css` is actually shipped. `tsup.config.ts` carried a
hardcoded `BRANDS = ['vault.css']` beside the directory, so the new brand was
added, contract-tested and published while the build copied only vault's. **A
consumer installing 2.3.0 and importing `haus-tokens/brands/drift.css` got
nothing.**

`brand.test.ts` reads `src/brands` with `readdirSync` and passed on all of it. The
build read the list. **Every assertion in the package was about the source and
none was about the artefact**, which is the same gap that let 2.1.0 ship three
generated exports the root never re-exported.

The list is read from the directory now, and a new assertion compares
`dist/brands` against `src/brands` when a build is present. Verified by removing
the file from `dist` and watching it fail.

---

## haus-tokens 2.3.0

*2026-09-08. A third brand, and nothing else.*

**Added** · `brands/drift.css`, drift's palette as brand inputs. Fifty-four
entries, the base tier and the whole feedback tier, because drift has all four
notification semantics and uses them on the audit screen.

Until now these lived in drift's own `semantics.css` as **role overrides resolved
through cascade order**, a shape that had already produced one defect on the
record: Badge and Input rendered in haus's aronia purple inside a cool blue
product, because the two sides named different properties and the cascade order
decided nothing.

It invents no colour. Every value is a step of a haus ramp, which is what makes it
a brand rather than a second palette. `backdrop` reads `--haus-opacity-60` where
drift read the `--haus-opacity-overlay` role: **a brand supplies inputs and may
not read the layer it feeds.** Same value, correct layer.

**Purely additive.** The file applies at `[data-haus-theme='drift']`, which
nothing set before this release. `brand.test.ts` now runs its per-brand contract
over two brands instead of one, which is what makes a contract a contract.

---

## haus-tokens 2.2.1

*2026-09-08. 2.2.0's tag went red and never published.*

**Fixed** · An empty `src/index.test.ts`, left behind by a stray shell redirect,
which vitest fails on because a test file with no suite in it is more likely a
mistake than an intention. The publish workflow runs the suite before it
publishes, so nothing reached npm and 2.2.0 does not exist.

Worth recording because the local gate had already run and reported green. It
grepped for `Tests N passed` and vitest prints the file-level result on a
separate `Test Files N failed` line, so a whole file failing to load was
invisible to the check that was supposed to catch it. **A gate that reads only
half the summary is a gate with a blind spot**, which is the third one of those
today.

---

## haus-tokens 2.2.0

*Tagged and never published: the run went red before the publish step. Its
contents ship as 2.2.1. The exports 2.1.0's own notes promised and did not ship.*

**Fixed** · `brandRolesBase`, `brandRolesFeedback` and `brandRolesForm` are
re-exported from the package root. 2.1.0 generated all four lists in `./brand`
and re-exported only `brandRoles`, so decision 0014 and 0015 described an API a
consumer could not reach.

**The types hid it.** `BrandMapBase`, `-Feedback` and `-Form` came through
anyway, because `BrandMap` is an intersection that references them, so
`import type { BrandMapForm }` worked while the matching value did not. A gap
that only shows up in one of the two import forms is one nobody trips over until
they need it.

`brand.test.ts` now imports the package root and asserts all four are reachable,
which is a different question from whether they are generated and is the one that
was never asked.

---

## haus-tokens 2.1.0

*2026-09-08. Additive throughout: every 54-entry brand still satisfies the
contract, no value moved, and nothing renders differently.*

**Added** · The brand contract is tiered, `haus#52`, [decision 0014](docs/decisions/0014-the-brand-contract-is-tiered.md).
`brand.css`'s 54 entries split into a required base of 28 (surfaces, ink, borders,
primary, backdrop) and an optional feedback tier of 26 (`info`, `success`,
`warning`, `error`). A brand may now supply the base alone and inherit the rest
from `:root`, which the cascade already did and the contract previously forbade.
`BrandMap` becomes `BrandMapBase & Partial<BrandMapFeedback>`, and
`brandRolesBase` and `brandRolesFeedback` are exported beside `brandRoles`.

`brand.test.ts` gains the rule the types cannot express: a brand supplying any
entry of a status ramp supplies all of that ramp, because a half-supplied ramp
renders in two hues with every `var()` resolving and no check firing.

**Not breaking.** Every 54-entry brand still satisfies the contract, so `vault`
and any consumer brand keep working unchanged. No value moved.

**Added** · A brand states form as well as colour, `haus#53`, [decision 0015](docs/decisions/0015-a-brand-states-form-not-only-colour.md).
A third tier of 7 optional entries: `radius` (control, surface, overlay, marker)
and `elevation` (raised, floating, overlay). `BrandMap` gains
`Partial<BrandMapForm>` and `brandRolesForm` is exported.

Short on purpose. drift appeared to carry 19 non-colour departures; measured
against the version it installs, 12 hardcode the literal a haus primitive already
resolves to and 2 were version skew, leaving 5. So z-index, opacity, border-width
and the space ladder are deliberately not brandable: nobody re-decides them.

**Not breaking, and nothing renders differently.** All seven roles resolve through
the new entries to the primitives they read before, checked by walking the chain.
`vault.css` supplies none of the tier and passes, because none is a legal amount.

**Added** · `findRestatedTokens` in `haus-tokens/guard`, `haus#53`,
[decision 0016](docs/decisions/0016-a-restated-value-is-a-copy-and-the-package-says-so.md).
Reports every declaration a consumer makes that this package already ships,
tagged `identical` (the same text) or `resolved` (different text, same value once
`var()` chains are followed).

The second tag is the one a text comparison cannot see: `--haus-z-modal: 400`
against `var(--haus-z-400)`, where `--haus-z-400` is `400`. That is how a
consumer opts out of a scale while appearing to be on it.

vault wrote this rule by hand after `vault#25` and drift never got it, so it
ships from the package now. Run against drift it reproduces, independently, the
89 arrived at by hand: 77 identical, 12 resolved.

Pure, like the rest of the guard: it takes CSS as strings and reads no files.

**Added** · Modal widths become a form-tier brand group, `haus#53`,
[decision 0018](docs/decisions/0018-vaults-twenty-are-settled-one-at-a-time.md).
`--haus-brand-modal-width-sm|md|lg`, taking the form tier from 7 entries to 10,
plus the `overlayWidth` and `size` primitive groups and the roles
`--haus-toast-width`, `--haus-toggle-track-width` and `--haus-marker-dot`.

**Fixed** · `width`, `height`, `max-width`, `min-width` and `max-height` join the
hardcoded-value rule, which listed `min-height` and not `width`: the blind spot
`haus#43` named for icon sizes. It found ten literals, including Modal's three
widths sitting inside a design system whose CI fails on a hardcoded value.

**Nothing renders differently.** Every converted value was checked rather than
assumed: `25rem` is `400px`, `22.5rem` is `360px`, `0.375rem` is `6px`.

### `haus-tokens`, breaking

- **Every custom property carries `--haus-`.** `--space-4` is
  `--haus-space-4`, at every layer including primitives. Unprefixed they sat in
  the global namespace, where a consumer running Tailwind collides with them.
- **The brand is a separate layer.** `brand.css` holds which primitive each role
  takes and nothing else; `semantics.css` keeps the role vocabulary and names no
  palette. Replacing `brand.css` is how you theme.
- **Roles are declared on `:root, [data-haus-theme]`.** A named brand applies at
  `[data-haus-theme="<name>"]` and nests.
- Added: `index.css`, the four files in the right order; `layers.css`, the
  cascade order declared once; `brands/vault.css`, a complete second brand;
  `BrandMap` and `brandRoles`, generated from `brand.css`.
- **`--haus-color-ink-on-aronia` is `--haus-color-ink-on-primary`**, and so is
  the `--haus-brand-` entry behind it. A role named the palette it sat on, which
  is the one thing `semantics.css` is not allowed to do. The test that enforces
  that rule carried an exemption for this property; the exemption is gone.
- **The second brand's ramp is `--haus-ruby-*`, not `--ruby-*`.** Ten steps, the
  only unprefixed custom properties left in the system. An unprefixed
  `--ruby-500` collides with a consumer running Tailwind, which is why the
  prefix exists at all.
- **The theme is `vault`, not `ruby`**, and the file is `brands/vault.css`.
  `<div data-haus-theme="vault">`. The brand is a shipped product's rather than
  an invention, and the attribute now says so. The **ramp keeps the name
  `ruby`**: brand answers whose, ramp answers which colour, and vault ships six
  gemstone ramps, so `--haus-vault-500` would claim it has one.
- **`--haus-shadow-focus` is `--haus-focus-ring`**, and `-error` with it. A role
  named its mechanism rather than its job: it is a focus ring, and box-shadow is
  merely how it is drawn, the way `--haus-elevation-floating` is not called
  `shadow-lg`. Ten components read it.
- **Stacking, border width and opacity have a role layer** (`haus#27`).
  `primitives.css` holds the ladders and nothing else: `--haus-z-0` through
  `--haus-z-600`, `--haus-border-width-1` and `-2`, `--haus-opacity-40` and
  `-60`. `semantics.css` holds the names, unchanged: `--haus-z-modal`,
  `--haus-border-width-default`, `--haus-opacity-disabled` and the rest.
  **A consumer reading a role name needs no change**: the same twelve names
  resolve, one layer higher. Breaking only if you read the *primitive*, which
  until now was the only way to get the stacking order at all, and is why drift
  and vault each settled one themselves. The JS export's keys move with it:
  `tokens.zIndex.modal` is `tokens.zIndex['400']`, and the role is CSS-side.
- **Removed: the `400` step in all four status ramps** (`haus#35`). cherry,
  mango, greengage and elderberry each declared one, `primitives.css`
  documented every one as "Icon on subtle background", and no role consumed
  any of them. The reason nothing consumed them is that the documented use
  fails: measured against its own `100` background, `400` clears 2.20:1,
  2.01:1, 1.95:1 and 2.20:1, and WCAG 1.4.11 wants 3:1 for non-text UI.
  `Callout` draws exactly that, a tone icon on a subtle background, and it
  reaches for `-on-subtle`, the `700`, which lands between 6.31:1 and 8.01:1.
  The component was right and the comment was wrong. Status ramps are
  `100 · 200 · 500 · 700 · 900` now, and every step has a consumer.
- Added: `--haus-aronia-850`, `oklch(22% 0.066 300)`. It existed in the Figma
  library and in neither `tokens.json` nor `primitives.css`. Promoted rather
  than deleted, at the ramp's own convention rather than Figma's float noise.
- Added: a `require` condition and a `./package.json` export.
- **Button takes all five tones.** `ButtonTone` was `neutral | error`; it is the
  whole `Tone` union now, and every tone composes with every weight. Widening a
  union is not itself breaking, but it is listed here because the colours a
  toned Button paints are new and Chromatic will treat them as such.
- Fixed: `controlHeight` reaches the JS export, which it never did.

### `haus-components`, breaking

- **`variant` is visual weight only.** Badge and Toast take `tone`; Button takes
  `variant` for weight, `tone` for meaning, and `external` as its own prop.
  `danger` is `tone="error"`. The old type names remain as deprecated aliases.
- **Toast takes `appearance`, and `tone="neutral"` is now tinted.** It always had
  two appearances and no word for them: `neutral` painted a dark solid surface
  while the other four painted tinted ones, so which you got was decided by the
  tone you happened to pick. `appearance` is `subtle | solid`, defaulting to
  `subtle` as it does on Badge — so **the dark neutral toast is
  `appearance="solid"` now**, and a plain `<Toast>` is tinted where it used to be
  dark. Every tone has both. A solid toast's description also takes full-strength
  ink instead of the old 0.8 opacity, which was tuned against one dark surface
  and would have dropped white text under AA over two of the five.
- **`className` lands on the root, everywhere.** The five components that put it
  elsewhere gained a named second target: `controlClassName` on the text
  controls and Checkbox, `dialogClassName` on Modal.
- **`onChange` hands back `(value, event)`** on Checkbox, Toggle and RadioGroup.
- **`styles.css` is wrapped in `@layer haus.components`.** Your own unlayered CSS
  now beats it without a specificity fight; anything relying on source order
  will change.
- Sizes converge on `sm md lg`. Avatar keeps `xs` and `xl`.
- Added: `forwardRef` and prop spreading on all twelve, which the README already
  claimed. `as` on Card and Badge. `initialFocus` and `dismissOnBackdrop` on
  Modal.
- Added: a `require` condition and a `./package.json` export.
- **Button takes all five tones.** `ButtonTone` was `neutral | error`; it is the
  whole `Tone` union now, and every tone composes with every weight. Widening a
  union is not itself breaking, but it is listed here because the colours a
  toned Button paints are new and Chromatic will treat them as such.

### `haus-components`, fixed

- **Tabs had no forced-colors fallback**, so its focus ring, on both the tab and
  the panel, disappeared entirely in Windows High Contrast: the ring is a
  box-shadow and forced-colors drops those. Found by repairing the assertion
  that was supposed to prevent exactly this, which had been matching the wrong
  string and passing on an empty set.

- RadioGroup never moved its drawn selection when uncontrolled: the dot stayed on
  `defaultValue` while the native input flipped.
- A disabled `<Button href>` was focusable and still navigated.
- Button dropped `ref` on its anchor branch.
- Avatar threw on an empty name.
- Checkbox's hint and Toggle's description were read as part of the accessible
  name rather than as descriptions.
- `Input` rang its focus ring for a pointer as well as a keyboard.
- `Select` had an error state with no error-focus ring.
- Every focus ring is a `box-shadow`, and forced-colors mode drops those: nine
  components gained an outline fallback, so a Windows High Contrast user has a
  focus indicator at all.
- Components are written in logical properties, so the library works in a
  right-to-left document.
- `<Button variant="ghost" tone="error">` rendered as a solid button, and so did
  the `secondary` and `text` weights: the tone set background, border and colour
  outright and won on source order whatever the variant asked for. Tone is a
  palette of custom properties now, per
  [decision 0012](docs/decisions/0012-a-tone-declares-custom-properties-only.md),
  so weight and meaning compose. An untoned Button is unchanged.
