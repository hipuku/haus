# 0025 · Select is the themed control, and the native select is retired

**Accepted**, 2026-09-10. `haus#61`. Supersedes [0011](0011-select-is-a-native-select.md)
and [0020](0020-listbox-and-select-both-stay.md).

## Context

Decision 0011 made `Select` a native `<select>`. Decision 0020 kept both it and
`Listbox`, the themed control two products had built, and recorded that **no
consumer imported the native one**: measured across core, drift, vault and loom,
every `Select` import resolved to a product-local component.

Re-measured on 2026-09-10, that is still true. Nothing imports the native
`Select`, and nothing has in the two releases since 0020. A component that exists
on a decision rather than on a consumer is the exact shape decision 0013 rules
against, and the exact shape the portfolio keeps catching elsewhere: a role no
component reads, a check that never runs. Keeping the native `Select` on the
promise that someone might want it is that promise again.

Meanwhile `Listbox` is the control every product actually built, and the name it
carries is not the one a consumer reaches for. The thing you import to choose one
of a set is called a select.

## Decision

The native `<select>` component is retired, and `Listbox` is renamed to `Select`.
The themed control is the one and only `Select` haus ships.

- The public API `Listbox`, `ListboxProps`, `ListboxOption`, `ListboxSize` becomes
  `Select`, `SelectProps`, `SelectOption`, `SelectSize`. The internal
  `useListbox` hook keeps its name: it implements the WAI-ARIA *listbox* keyboard
  pattern, which is the ARIA role the panel carries (`role="listbox"`), not the
  component.
- The native select's props, the ones that came from `<select>` itself, are gone.
  A consumer that genuinely wants a raw `<select>`, still the better answer on
  touch, in a form that must work without JavaScript, and for a list long enough
  that the operating system's own popup beats a drawn panel, writes the element
  directly rather than importing a haus component for it. That was 0011's reason
  and it survives as guidance, not as a component.

## Cost

- **A major version.** `Listbox` is gone from the barrel and `Select` means
  something new, so every consumer on either name migrates. core imports `Listbox`
  at three sites and updates to `Select` when it takes the new major; nothing else
  in the portfolio imports either.
- haus is **twenty components, not twenty-one**.
- A Figma prompt is owed: the library's `Select` frames become the themed control
  and the old native ones retire.
