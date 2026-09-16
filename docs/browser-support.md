# Browser support

## The floor

**Chrome 119, Edge 119, Safari 16.4, Firefox 128.** Anything older will render
some part of this system wrong, and mostly it will do so silently.

One feature sets that floor, not a usage survey. It is named below.

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
113 and OKLCH. The cost is what relative colour syntax provides: each alpha is
derived from the brand's own colour, so a brand map does not restate every
translucent variant, and the variants cannot disagree with the colour they came
from.

That trade has not been taken. It is recorded here so the floor is a decision.

## How it fails

Mostly **silently**. An unsupported
`oklch(from …)` is an invalid declaration, and an invalid declaration is dropped:
no console warning, no build error, and a border that is simply absent. The same
is true of an unsupported `@layer`: the whole block is skipped, so every token
disappears at once and components render unstyled rather than badly.

There is no fallback layer and no `@supports` guard. Adding either would mean
maintaining two colour systems in one repository, which is the drift this system
is built to prevent.

## Not supported

- **Internet Explorer**, at all.
- **Print.** Nothing here has a print stylesheet, and the token layer assumes a
  screen: the surfaces are near-white rather than white, and shadows carry
  elevation that print cannot show.
- **Forced colours** is supported. Every focus ring has a fallback, and that is
  the only mode-level accommodation here. See [accessibility.md](accessibility.md).
