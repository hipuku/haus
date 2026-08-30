# haus-colour-utils

Perceptual colour utilities: the colour science behind the [haus](https://github.com/hipuku/haus) design system, published standalone. Pure ESM, ships its own types, one dependency.

```bash
npm install haus-colour-utils
```

## API

```ts
import {
  deltaE,
  wcagContrast,
  clusterByPerceptualDistance,
  nearestNamedColour,
  createNamedColourMatcher,
  generateLightnessScale,
  oklch,
  hueFamily,
  isLight,
  suggestTextColour,
} from "haus-colour-utils";
```

### `deltaE(a, b): number`
CIEDE2000 perceptual distance between two hex colours. `< 1` is imperceptible; `< 2` is a just-noticeable difference.

```ts
deltaE("#3366cc", "#3467cc"); // ~0.7, effectively the same colour
```

### `wcagContrast(foreground, background): ContrastResult`
WCAG 2.1 contrast ratio and pass/fail verdicts.

```ts
wcagContrast("#767676", "#ffffff");
// { ratio: 4.54, passAA: true, passAAA: false, passAALarge: true }
```

### `clusterByPerceptualDistance(hexes, threshold?): ColourCluster[]`
Group colours that are perceptually within `threshold` ΔE of each other (default `8`). This is the basis for finding near-duplicate tokens.

### `nearestNamedColour(hex, topN?): NamedColourMatch[]`
The closest named colours to a hex, ranked by CIEDE2000 distance, over the 289 basic colour terms bundled here.

### `createNamedColourMatcher(entries): (hex, topN?) => NamedColourMatch[]`
The same search over a dataset you supply. Install [`haus-colour-names`](../colour-names) for the exhaustive 31,900-name set:

```ts
import { colourNameEntries } from "haus-colour-names";
const nameColour = createNamedColourMatcher(colourNameEntries());
```

Both rank on the true CIEDE2000 distance and round only the number they report, so a
candidate 0.96 away outranks one 1.00 away even though both display as `1`. Equal distances
break by name, so the result does not depend on the order the dataset happens to be in.

### `oklch(hex): Oklch | null`
Lightness, chroma and hue. `h` is `null` for an achromatic colour, so a grey cannot silently propagate a `NaN`.

```ts
oklch("#ff0000"); // { l: 0.628, c: 0.258, h: 29.2 }
```

### `hueFamily(hex, families?, neutralChroma?): string | null`
Which named family a colour belongs to: one of `HUE_FAMILIES`, or `"Neutral"` below `NEUTRAL_CHROMA` (0.03).

```ts
hueFamily("#2563eb"); // "Blue"
hueFamily("#f7f7fa"); // "Neutral". A tinted near-white is still a grey.
```

Chroma rather than HSL saturation, which inflates at the extremes of lightness and reads a tinted near-black as a saturated hue. The bins are fitted to 4,275 colours a person named, taken from `haus-colour-names`: the boundaries are the set that maximises mean per-family recall, and `hue-families.test.ts` holds it at 0.77. They are not the HSL wheel's boundaries, which offset every family by about one place, and they are no longer midpoints between the eight colours the families are named after. That construction assumed a family is centred on its namesake, and several are not: the median of 222 colours people call orange is hue 47, while `#ffa500` is at 71, so a midpoint at 50 filed most oranges as red.

### `generateLightnessScale(hex, options?): string[]`
A perceptual lightness ramp anchored on a colour, in OKLCH. Options: `{ steps = 10, minL = 8, maxL = 97 }`.

### `isLight(hex): boolean` · `suggestTextColour(background, palette): string`
Quick helpers for picking readable text against a background.

## Licence

MIT.
