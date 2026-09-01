# 0009 · `className` lands on the root element

**Accepted**, 2026-09-01. **Not yet implemented.**

## Context

`className` landed on a different node in almost every component. The root on
Badge, Button, Card, Radio, Toast and Toggle. An inner label on Checkbox, so its
outer div was unreachable. `.inputWrap` rather than `.wrapper` on Input. The
dialog rather than the backdrop on Modal. The `<select>` itself, two wrappers
deep. No documented rule, so a consumer had to read the source of each one.

## Decision

The root, everywhere. Where a component genuinely needs a second target, it gets
a named prop for it rather than redirecting the one everybody expects.

## Consequences

Easier: one rule, guessable without reading source.

Harder: it moves where styles land on six components, so it is breaking for
anyone currently relying on the old node — another entry for the 1.x guide.

Documenting the current placement instead was the alternative, and it was
rejected on one case: Checkbox's outer div is currently unreachable by any means.
That is a defect, not a convention, and a convention that has to describe a
defect is not worth writing down.
