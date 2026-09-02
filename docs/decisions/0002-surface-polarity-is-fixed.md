# 0002 · Surface polarity is fixed by the contract

**Accepted**, 2026-09-01. Implemented.

## Context

Two polarities were in use. haus and Vault put white cards on a subtly tinted
page. Core inverted it, tinting the cards and leaving the page white.

Both look deliberate. The question was whether polarity is something a brand map
gets to choose, like a hue, or something the contract fixes, like the meaning of
`--color-ink-primary`.

## Decision

Polarity is fixed: **white cards on a subtle page**. It is not a brand-map axis.

Every surface role is paired with the ink that is safe on it, and that pairing is
what makes contrast decidable once at the token layer instead of at every call
site. A brand that could invert polarity would invert the ink pairings with it,
and the pairing is the part consumers rely on.

## Consequences

Easier: a consumer supplies hues and gets a set of surfaces whose contrast is
already decided.

Harder: Core inverts this today, so its adoption includes a visual re-tune
rather than a swap.

And the cost worth naming plainly: **this rules out a dark mode built on the
brand map.** A dark theme is a polarity inversion, so under this decision it
cannot be a brand. It would have to be a second contract, or this decision has
to be reopened. It is the most common question asked of a design system, and the
answer here is "not through theming", which is a choice rather than an oversight.
