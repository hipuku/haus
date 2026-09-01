# 0010 · Components are written in logical properties

**Accepted**, 2026-09-01. Implemented.

## Context

Twenty-seven direction-sensitive declarations across ten of the twelve
components, and no logical property anywhere. In a right-to-left document every
one pointed the wrong way: the checkbox hint indented from the left, the select
chevron sat over the text it should sit beside, Toast drew its accent edge on the
trailing side while its compensating padding stayed on the leading side, and the
Toggle thumb slid out of the wrong end of its track.

## Decision

Logical properties throughout: `margin-inline-start`, `padding-inline`,
`border-inline-start-color`, `inset-inline-end`, and the block axis with them.

Scoped to the **inline axis** where it matters. Right-to-left flips inline and
leaves block alone, so `top` and `bottom` remain legal; the block-axis rename is
for consistency rather than correctness.

`translateX` has no logical equivalent, so a sliding element carries its travel
distance and its direction as variables, and a `[dir='rtl']` rule flips the sign.

## Consequences

Easier: the library can ship in a locale it was not written for, which is the
difference between a component library and one component library.

Harder: nothing, in practice — no public name changed, which is why it landed
before the 1.x cut rather than inside it.

**It is guarded rather than trusted.** The component tests run with `css: false`,
so no test in this package reads a computed style and a rendered right-to-left
assertion is not available here. `logical-properties.test.ts` asserts the source
instead: no physical inline-axis property, no `text-align: left | right`, and no
`translateX` in a file with no `[dir='rtl']` rule to flip it. The visual half
belongs to a right-to-left Storybook story under a visual diff, and is still open.
