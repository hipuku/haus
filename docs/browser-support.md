# Browser support

## The floor

**Chrome 119, Edge 119, Safari 16.4, Firefox 128.** Anything older will render
some part of this system wrong, and mostly it will do so silently.

That floor is set by one feature rather than by a survey, and the feature is
named below so the decision can be argued with rather than taken on trust.

## What sets it, and what it costs

| Feature | Chrome | Safari | Firefox | Used by |
|---|---|---|---|---|
| Relative colour syntax, `oklch(from …)` | 119 | 16.4 | **128** | 4 brand entries, 1 component rule |
| `:has()` | 105 | 15.4 | 121 | `Input`'s focus ring |
| OKLCH colours | 111 | 15.4 | 113 | every colour in the system |
| Cascade layers, `@layer` | 99 | 15.4 | 97 | all five token layers and the component sheet |
| Logical properties | 87 | 14.1 | 66 | every component |

**Firefox 128 is the floor, and relative colour syntax is why.** It shipped there
in July 2024, which is more recent than everything else on the list by three
years. Five uses hold the whole floor up:

- three `--haus-brand-border-inverse*` and `--haus-brand-surface-inverse-hover`
  entries, which take white at three alpha levels
- `--haus-brand-backdrop`, damson-950 at the overlay opacity
- Button's `text-decoration-color`, currentColor at 35%

**Widening the floor is possible and has a cost.** Those five could be static
values, which would take the floor back to Firefox 121 and `:has()`, and then to
113 and OKLCH. What it would cost is the thing relative colour syntax buys: an
alpha derived from a brand's own colour rather than restated per brand. A brand
map that has to spell out every translucent variant is a longer file and a place
for a brand to disagree with itself.

That trade has not been taken. It is recorded here so it is a decision rather
than an accident.

## How it fails

Mostly **silently**, which is the part worth knowing. An unsupported
`oklch(from …)` is an invalid declaration, and an invalid declaration is dropped:
no console warning, no build error, and a border that is simply absent. The same
is true of an unsupported `@layer`: the whole block is skipped, so every token
disappears at once and components render unstyled rather than badly.

There is no fallback layer and no `@supports` guard. Adding either would mean
maintaining two colour systems, and a design system with two colour systems has
the drift problem it exists to solve.

## Not supported

- **Internet Explorer**, at all.
- **Print.** Nothing here has a print stylesheet, and the token layer assumes a
  screen: the surfaces are near-white rather than white, and shadows carry
  elevation that print cannot show.
- **Forced colours** is supported. Every focus ring has a fallback, and that is
  the only mode-level accommodation here. See [accessibility.md](accessibility.md).
