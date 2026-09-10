# 0020 · Listbox and Select both stay

> ⏳ **Superseded by [0025](0025-select-is-the-themed-control.md), 2026-09-10.** Both
> did not stay. The native `Select` still had no consumer two releases on, so it was
> retired and `Listbox` took the name `Select`. This entry is the record of why they
> stood together for a while, and of the measurement that ended it.

**Accepted**, 2026-09-08. `haus#61`.

## Context

`Select` renders a native `<select>`, on decision 0011. Measured across core,
drift, vault and loom on 2026-09-08, **no consumer imports it**: every `Select`
import in the portfolio resolves to a product-local component.

Two products built a replacement instead, and both wrote down the same reason.
core, on `Dropdown`: *"a styled listbox standing in for `<select>`, whose native
popup can't be themed."* vault, on `molecules/Select`: *"a custom dropdown
replacing native `<select>`."* core's option carries a `hint`, a second line
under the label, which an `<option>` cannot hold because the operating system
draws it.

That is decision 0013's bar met by behaviour rather than by name, so `Listbox`
ships. The question this entry answers is what happens to `Select`.

## Decision

Both stay, and the pairing is stated rather than left to be inferred.

- **`Listbox`** where the popup must be themed, or where an option carries more
  than a label.
- **`Select`** where the operating system's own popup is acceptable, which is
  most of touch, any form that must work without JavaScript, and any list long
  enough that a drawn panel is worse than the platform's.

**`Select` has no consumers today, and that is recorded here rather than left
implicit.** It is the one fact about it that a reader would otherwise have to
discover.

## Consequences

Easier: neither answer has to pretend to be the only one. A design system with
one picker is claiming that every context is the same context, and 0011 already
argued convincingly that a native select is genuinely better at some of them.

Harder: two components to keep, and only one of them earning its keep in the
portfolio right now. Keeping an unused component is defensible; keeping one
*silently* is not, because an absence of consumers reads as proof of fitness
until somebody checks. If `Select` still has none when a fourth product lands,
that is the moment to ask again rather than now, when removing it would be a
major version for nobody's benefit.

**This does not weaken 0011.** 0011 is about what a native select is and is not,
and every sentence of it is still true. It was read as *the* answer to picking
an option, and it was only ever the answer for one half of the cases.
