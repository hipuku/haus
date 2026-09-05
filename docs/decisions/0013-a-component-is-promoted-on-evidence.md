# 0013 · A component is promoted on evidence, not on taste

**Accepted**, 2026-09-05. **Implemented as `Callout`, `Divider`, `EmptyState`,
`Popover`, `Tabs` and `Tooltip`.**

## Context

haus shipped twelve components and every one was a form control, a text
primitive or `Modal`. That was not a plan. It was the order things happened to
get built in, and it left the library complete for forms and empty for
overlays: which is the half a product cannot avoid writing itself, and the
half carrying the accessibility contracts worth centralising.

The usual way out is to look at what other design systems ship and copy the
list. That produces a plausible library and a case study with nothing in it.

The alternative was available and nobody had used it: haus has three consumers,
and all three are in this portfolio. What they built for themselves is a record
of what the system did not give them.

So the three products were measured rather than surveyed, on 2026-09-05:

```
                    core   drift  vault   haus
role="tablist"        1      2      1      0
aria-haspopup         2      0      5      0
role="listbox"        1      0      2      0
role="tooltip"        0      0      1      0
empty-state refs      7      6     12      0
Callout component     ✓      ✓      ✓      0
```

## Decision

**A component earns promotion into haus by having been built more than once,
independently, in a product that consumes haus.** Not by being a component
other systems have.

The rule cuts both ways, and the half that does the work is the second one.
These were **not** promoted, and each is one product's answer to one product's
problem: `Drawer`, `CommandPalette`, `SegmentedControl`, `FontPreviewControl`,
`ContrastChip`, `EditableName`, `StepEditControl`. `EditableName` in particular
deliberately removes its focus ring, which is a decision a system must not
carry.

Where the evidence is thin the component still has to earn its place on the
argument rather than on the count. `Tooltip` exists in one product; it is here
because the WCAG 1.4.13 contract is re-derived per implementation and three
parts of it are silently absent from most hand-rolled tooltips. `Divider`
exists in one product; it is here because the other two draw the same rule
inline, and a rule is where the width, colour and spacing decisions become
visible. Both reasons are written on their issues.

## Consequences

**The promotion argument turned into an audit.** Reading three implementations
before writing one found a real accessibility defect in a shipped product in
four of the six cases, and **axe flags none of them**, every one is markup
that is valid and wrong in context:

- Three tablists across three products, and **zero** `role="tabpanel"`, **zero**
  `aria-controls`, **zero** arrow-key handling. Each announces itself as a
  tablist and delivers none of what the word promises.
- drift puts `role="alert"` on every `Callout`, so a static notice interrupts a
  screen reader on every render. vault puts `role="note"` on every one, so a
  validation message is never announced.
- vault's `Popover` leaves focus return to the caller and none of its six call
  sites does it, so <kbd>Escape</kbd> drops focus onto `<body>`. WCAG 2.4.3.
- vault's `EmptyState` renders load failures: "Couldn't open your library"
  reads as *there is nothing here* when the truth is *we could not look*, and
  reaches assistive technology as nothing at all. Its title is a `<p>`, so
  heading navigation skips the only sentence explaining the absence.

**Each defect became a prop rather than a fix.** `live` on `Callout` and
`EmptyState`, `triggerRef` on `Popover`, the panel rendered by `Tabs` rather
than left to the caller. The component owns the decision the products each got
wrong, because a component that emitted only the easy half would let the same
defect straight back in.

**The role layer got a bill.** The deliberate primitive reads counted by
`tokens.test.ts` went from 61 to 77 across the six, and `Popover` and `Tooltip`
both had to read `--haus-z-*` directly because there is no z role to ask for.
That is haus#27, and the system hitting its own gap is better evidence for
fixing it than the consumers hitting it was.

**Twelve components became eighteen, and there is a rule for the nineteenth.**
Somebody has to build it twice first.
