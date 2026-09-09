# 0024 · The RSC path is guarded by its rule, not by a harness

**Accepted**, 2026-09-09. **Implemented** as
`packages/components/src/rsc-rules.test.tsx`. `haus#72`. Follows
[0022](0022-ownership-is-stated-in-both-directions.md).

## Context

`haus#71` shipped and reached a consumer within minutes. `<Button asChild>`
rendered from a React Server Component threw *"Refs cannot be used in Server
Components, nor passed to Client Components"*, because `mergeRefs` returned a
callback unconditionally: with no ref on the Button and none on the child it
still produced one, and `cloneElement` attached it.

The audit after it found nothing else of its kind. It also found that **nothing
here could have caught it, and nothing could catch the next one.**

| Path | Covered by |
|---|---|
| client render | 30 component suites |
| `renderToString` | `ssr.test.tsx` |
| **React Server Component render** | **nothing** |

That third row is a real path, not a hypothetical. This package ships **no
`use client` directive**, so a Server Component can import and render a haus
component directly. For `Button`, `Badge`, `Card`, `Divider` and the other
stateless ones that is a feature, and core relies on it in two pages.

`ssr.test.tsx` does not cover it. `renderToString` is server *rendering*, not
React Server Components, and the two enforce different rules: `renderToString`
accepts a ref happily and an RSC render rejects it.

## Decision

**Assert the rule, not the render.** No component attaches a ref it was not
given, checked by rendering each `asChild` component with no ref on either side
and failing if one arrives.

`haus#72` set out two options and this takes the second, so the first deserves
its reasons.

**A real RSC harness**, `react-server-dom-webpack` or equivalent, would catch
violations this cannot see: a hook where none is allowed, an event handler in a
server tree. It is also a dependency and a build wrinkle in a package that
declares almost nothing beyond React itself, and this package has refused that
trade before for good reasons. The value is real and the cost is real, and what
tips it is that **the whole known failure surface is one mechanism.**

**This guard is narrow and its limit is stated rather than implied.** It catches
a ref attached unasked, which is exactly `haus#71`, and nothing else. That is
worth having because it is not an arbitrary slice: `asChild` is the only path in
this package that can attach a ref the caller did not pass, and
[0022](0022-ownership-is-stated-in-both-directions.md) puts `asChild` on
`IconButton` and `Card` next. **The surface this guards is about to triple**,
which is the argument for guarding it now and the argument for revisiting the
harness later.

## How it is built, and why that way

**A recording `forwardRef` child.** The peer range is React 18 and 19; in 19 a
ref arrives as an ordinary prop and in 18 it sits on the element, and
`forwardRef` receives it in the same argument under both. It is the one
observation that holds across the range.

**The component list is read from the directory**, by looking for `asChild` in
each component's source. A component that gains `asChild` is covered the day it
gains it. This package has produced the list-beside-a-directory defect four
times, and a guard written *because* the surface is about to grow is the last
place to reintroduce it.

**Both directions are asserted.** The fix for `haus#71` was "return undefined
when there is nothing to merge", and the way to get that wrong in the other
direction is to drop the merge entirely, so a second case gives a ref and
requires it to arrive.

**It was proved able to fail.** Deleting the `real.length === 0` guard from
`mergeRefs` fails it by component name with *"Button attached a ref nobody asked
for"*. Checked, not assumed, because this package has shipped green checks over
broken things before.

## What stays open

**The RSC row is narrower now, not full.** A hook in a stateless component, or an
event handler reaching a server tree, would still ship. If a third RSC defect
arrives that this does not catch, that is the evidence for paying for the
harness, and this record is where to say so.

**haus still has no consumer inside itself**, which is the deeper finding behind
`haus#71` and all four cases in 0022. Every one was found by a consumer. A guard
on one mechanism does not change that.
