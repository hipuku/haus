# 0022 · Ownership is stated, in both directions

**Accepted**, 2026-09-09. **Implemented**: `asChild` on `Button` (`haus#57`) was the
first instance, then `IconButton` (`haus#70`, `72cf318`) and `Card` (`44c22fa`),
and `Tabs` takes a `panelId` (`haus#67`). `haus#69`.

## Context

Four issues arrived separately, from three different consumers, and nothing in
these records named what they had in common.

| | The component assumes | The consumer already owned it |
|---|---|---|
| `haus#57` | `Button` renders its own `<a>` for `href` | Next's `Link` is the thing that must render |
| `Card` | `as` is a closed union of intrinsic element names | a clickable card is an anchor, or a router link |
| `haus#67` | `Tabs` renders its tablist and panel as adjacent siblings | core's are a sticky toolbar and a document sheet |
| `haus#68` | `Popover`'s panel is absolute against an ancestor that does not clip | `Modal`'s body is `overflow-y: auto` |

**A component assumes it owns an element or a subtree, in a consumer that already
owns it.** Every one was found by a real consumer. None was found by review, and
none by the test suite, because **haus has no consumer inside itself**: every
suite here renders a component into an empty document with nothing above it, and
the assumption only fails when something above it is real.

`haus#70` is the fifth, and it is the one that made this worth writing rather
than fixing again: `IconButton` needs exactly what `Button` was given in 2.1.0,
and deciding it on its own would be the third time the same answer was reached
from scratch.

## The inverse, which is the same boundary

core's unlayered `* { padding: 0 }` beat every haus component style until the
reset moved into a layer.

That is not a different problem politely filed nearby. `layers.css` states that
unlayered declarations win, deliberately, so that a consumer can always override
the system. **A blanket reset turns that escape hatch into an accidental override
of everything**, and it did. The consumer assumed it owned the cascade, in a
system that had layered itself precisely so that ownership could be negotiated.

So the finding is not "haus should own less". Half the instances point the other
way.

## Decision

**Ownership is stated, in both directions, and the default when it is unstated is
that the consumer owns it.**

Three rules follow.

### 1. A component owns its box, never its element

What haus is for is the box: the geometry, the states, the focus treatment, the
contrast. What a consumer's framework is for is the element: which tag, which
router, which ref.

So **a component that renders an interactive element ships `asChild`**, which
clones the caller's single child and merges `className` and both refs, and never
a closed `as` union of element names.

`Card`'s comment argues against *generic polymorphism*, the kind that infers a
whole prop set from `as`, and that argument is right and is not overturned here.
It costs a page of conditional types and makes every error message unreadable.
**`asChild` is not that pattern.** It takes no type parameter and infers nothing;
the child's props are the child's, already typed by whoever wrote it. Card's `as`
stays for the outline cases it was built for (`article`, `li`, `section`), and
Card gains `asChild` for the case `as` cannot reach: a clickable card that is a
router link.

**`asChild` and the component's own element-rendering props are mutually
exclusive**, expressed as a discriminated union, as `Button` does with `loading`,
`href` and `target`. See [0023](0023-a-union-prop-type-exports-its-halves.md) for
what that union owes its consumers.

### 2. A component may own a subtree only when it owns every part of it

`Tabs` renders the panel because the `aria-controls` wiring is the part every
product gets wrong, and that is a real argument: all three products here built a
tablist and none built the contract.

It is also what makes `Tabs` unusable when the two halves are not adjacent, which
is not an exotic layout: a sticky toolbar controlling content further down the
page is a common editor shape, and it is what core has.

**When a subtree can legitimately be split across a consumer's layout, the
component exposes the contract rather than the container.** For `Tabs` that is a
`panelId` prop: the caller renders the panel, `Tabs` renders none, and the roving
tabindex, the arrow keys and the `aria-controls` wiring, which is the part worth
having, are unchanged.

**The generated panel stays the default.** A consumer who has not thought about
it should get a correct one, and this decision is about not forcing the choice on
a consumer who has.

### 3. A consumer owns the cascade, the layout, and the element a router controls

`layers.css` states this for CSS and nothing states it for structure. It is
stated here.

The obligation this puts on a consumer is the one core learned: **a reset is part
of the cascade it is resetting.** An unlayered blanket selector is not a
low-priority default, it outranks every layer in the document, and in a layered
system it must be layered too.

## What this costs

**`asChild` is a real cost, paid per component.** It is a `React.cloneElement`
with merged refs and className, a discriminated union in the prop type, and a
test that the child's own handlers survive. `Button`'s is about forty lines. It
is not free and it should not be reflexive: **a component gets `asChild` when a
consumer has an element it must render, not because the others have it.**

Today that means `Button` (shipped), `IconButton` (`haus#70`, an icon-only link
in core) and `Card` (a clickable card that is a router link). It does not mean
`Badge`, `Divider`, `Callout` or `EmptyState`, none of which a consumer has asked
to render as something else.

**And `asChild` widens the RSC surface.** It is currently the only path in this
package that can attach a ref the caller did not pass, which is how `haus#71`
shipped. Every component that gains it gains that risk, so `haus#72` is not
optional once this decision is acted on.

## What this does not settle

**`haus#68`, the Popover clipping case, is not fixed by stating ownership.** A
panel positioned against a scrolling ancestor is a layout fact, not an ownership
question, and `portal` already exists as the answer. It is in the table above
because it was found the same way, by a consumer rather than by review, and that
is the part worth generalising.

**The test gap stays open.** Every instance here was found by a consumer, and
nothing in this record changes that haus has no consumer inside itself. A
decision record is not a test. `haus#72` is the nearest thing to one and it
covers a different path.

## Alternatives considered

**Generic polymorphic `as` everywhere.** Rejected, on Card's own argument, which
this record adopts rather than overturns.

**Nothing: fix each case as it arrives.** This is what was happening. It produced
four issues with one shape and a fifth that explicitly refused to be decided
alone, which is the evidence that it does not scale.

**Ship `asChild` on all 21 components.** Rejected. Twenty-one discriminated
unions and twenty-one clone paths, for five known cases, is the "variable nothing
reads" defect in another form, and it multiplies the `haus#71` risk by twenty-one
against a test suite that cannot yet see it.
