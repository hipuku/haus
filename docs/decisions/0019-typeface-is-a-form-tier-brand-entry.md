# 0019 · Typeface is a form-tier brand entry, and moving it is a major

**Accepted**, 2026-09-08. **Implemented in `haus-tokens`.** `haus#54`, split out
of `haus#53` / decision 0015, which took radius, elevation and modal width into
the form tier and left typeface alone deliberately.

## Context

`--haus-font-sans` and `--haus-font-mono` were **primitives**, read directly by
**32 component sites** under a documented exemption in `tokens.test.ts`:

> Primitives whose own name already is the role, so no alias exists.

That reasoning held for exactly as long as there was one brand. Two consumers
already disagreed with the value:

- **vault** forks sans to Manrope Variable, a fork it kept in its own `tokens.css`
- **drift** keeps `system-ui` for all three of its faces, three of the six names
  it deliberately did not rename at the 1.0 cut, because pointing them at haus's
  Manrope *"would have changed the product's face"*

By decision 0015's own argument, typeface is one of the four things that make two
products look different (colour, shadow, radius, type). It belongs in the form
tier beside the other three.

## Decision

`--haus-brand-font-sans` and `--haus-brand-font-mono` join the form tier in
`brand.css`, optional and all-or-nothing per group like radius and elevation.
`semantics.css` exposes the **unchanged** role name `--haus-font-sans` reading the
brand entry, so **not one component read moved**: what changed is that the read
now lands on a role instead of a primitive.

The value is a raw font stack, not a `var()`, because there is no primitive left
to point at. That is the whole of the change: the declaration moved out of
`primitives.css`.

## Why it is a major

Under [decision 0004](0004-versioning-is-1-x.md) a token that moves is a major at
an identical value. For a consumer importing the whole token stack the move is
invisible; **for one importing `primitives.css` alone it is a removal.** core was
exactly that consumer, which is why `haus#54` was timed to land with `C2`, when
core takes the full stack and the removal has no one left to affect. core does not
read the font primitives anyway, so nothing breaks in practice, but the contract
changed and the version says so: the next `haus-tokens` is **3.0.0**.

## Consequences

- `font.family` leaves `tokens.json` and the generated `primitives.css`; the
  generator no longer emits `--font-*`.
- `font` joins `FORM_GROUPS` in `brand.test.ts` and `FORM` in the generator's tier
  classifier. **Both were hand-maintained lists**, the recurring shape this
  package keeps finding; the form tier now holds twelve entries, not ten.
- `font-` leaves the `NAMED_ROLE` exemption in `haus-components`' `tokens.test.ts`,
  and the deliberate primitive-read count falls 54 to 22. Uncovered a stale figure
  while there: the count had read 50 in `semantics.css` since `haus#55` took the
  icon reads from thirteen to seventeen; corrected in the same pass.
- Each brand file states the group: vault Manrope Variable, drift system-ui, core
  Gabarito via its next/font var. The three faces are the proof the tier was real.
