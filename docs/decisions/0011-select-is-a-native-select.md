# 0011 · Select is a native `<select>`

**Accepted**, 2026-09-02. Implemented. The listbox that answers its limitation is
scheduled for Wave F.

## Context

`Select` renders a real `<select>`. `appearance: none` removes the platform
chrome and the component draws haus's own border, radius, padding, chevron and
focus ring over the top, so the **closed** control is fully themed.

The **open** control is not. The popup is drawn by the operating system, no CSS
reaches inside it, and it will look like macOS or Windows or Android rather than
like haus. Opening the Select story is enough to see it, and it reads as an
unfinished component rather than a decision, because nothing said otherwise.

Both consumers of this system reached the same conclusion independently and each
recorded it in their own source. core's `Dropdown` is "a styled listbox standing
in for `<select>`, whose native popup can't be themed". vault's `Select` is "a
custom dropdown replacing native `<select>`". As of 2026-09-01 the replacement
exists twice, as `core/lib/use-listbox.ts` and
`vault/src/renderer/src/hooks/useListbox.ts`, kept deliberately diffable against
the day one of them moves here.

So the system ships the one component neither consumer uses.

## Decision

`Select` stays native, and the boundary is stated rather than left to be
discovered: in this file, and in the component's own docstring where someone
choosing it will actually read it.

## Consequences

What the platform gives back is the reason: keyboard handling that is correct on
every platform without being written, a wheel picker on iOS rather than a list
squeezed into a phone viewport, and assistive-technology behaviour that a custom
listbox has to reimplement and then keep correct through every future change.
The `useListbox` implementations are 160 lines each, and that is the floor rather
than the finished cost: arrow keys, Home, End, typeahead, `aria-activedescendant`
and the rule that `role="option"` must be a direct child of the listbox.

What it costs is real and is the whole finding: a consumer who needs the list
styled cannot use this component, and both of them needed exactly that.

**The listbox is not refused, it is scheduled.** Wave F migrates vault and core
onto haus, which is the moment the duplication becomes concrete: two identical
hooks in two repositories both adopting this system. That is the point to promote
one of them, designed against two migrations that have actually happened rather
than two that have not. Building it now would mean designing for consumers whose
adoption has not yet tested the contract, and would widen the twelve-component
scope on a guess.
