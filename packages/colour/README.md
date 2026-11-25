# @hipuku/colour

Replaces `haus-colour-utils` and `haus-colour-names`, which merged into this package. Each has a
final deprecated release pointing here, and neither was unpublished. Not a drop-in: the names moved
to the `/names` subpath and the function names changed.

Perceptual colour utilities: the colour science behind the [haus](https://github.com/hipuku/haus) design system, published standalone. Pure ESM, ships its own types, one dependency.

```bash
npm install @hipuku/colour
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
  analysePalette,
  classifyDeltaE,
} from '@hipuku/colour'
```

### `deltaE(a, b): number`

CIEDE2000 perceptual distance between two hex colours. `< 1` is imperceptible; `< 2` is a just-noticeable difference.

```ts
deltaE('#3366cc', '#3467cc') // 0.34, effectively the same colour
```

### `wcagContrast(foreground, background): ContrastResult`

WCAG 2.1 contrast ratio and pass/fail verdicts. The verdicts compare the exact ratio with each threshold, as WCAG does, so 4.496:1 fails AA; only the reported `ratio` is rounded, to 2 decimal places.

```ts
wcagContrast('#767676', '#ffffff')
// { ratio: 4.54, passAA: true, passAAA: false, passAALarge: true }
```

### `clusterByPerceptualDistance(hexes, threshold?): ColourCluster[]`

Group colours that are perceptually within `threshold` ΔE of each other (default `8`). This is the basis for finding near-duplicate tokens.

### `nearestNamedColour(hex, topN?): NamedColourMatch[]`

The closest named colours to a hex, ranked by CIEDE2000 distance, over the 289 basic colour terms bundled here.

### `createNamedColourMatcher(entries): (hex, topN?) => NamedColourMatch[]`

The same search over a dataset you supply. Import `@hipuku/colour/names` for the exhaustive 31,900-name set. It is a subpath rather than part of
the main entry, so a bundler leaves its 764KB out unless it is imported:

```ts
import { colourNameEntries } from '@hipuku/colour/names'
const nameColour = createNamedColourMatcher(colourNameEntries())
```

Both rank on the true CIEDE2000 distance and round only the number they report, so a
candidate 0.96 away outranks one 1.00 away even though both display as `1`. Equal distances
break by name, so the result does not depend on the order the dataset happens to be in.

### `oklch(hex): Oklch | null`

Lightness, chroma and hue. `h` is `null` for an achromatic colour, so a grey cannot silently propagate a `NaN`.

```ts
oklch('#ff0000') // { l: 0.628, c: 0.258, h: 29.2 }
```

### `hueFamily(hex, families?, neutralChroma?): string | null`

Which named family a colour belongs to: one of `HUE_FAMILIES`, or `"Neutral"` below `NEUTRAL_CHROMA` (0.03).

```ts
hueFamily('#2563eb') // "Blue"
hueFamily('#f7f7fa') // "Neutral". A tinted near-white is still a grey.
```

Chroma rather than HSL saturation, which inflates at the extremes of lightness and reads a tinted near-black as a saturated hue. The bins are fitted to 4,275 colours a person named, taken from `@hipuku/colour`: the boundaries are the set that maximises mean per-family recall, and `hue-families.test.ts` holds it at 0.77. They are not the HSL wheel's boundaries, which offset every family by about one place, and they are no longer midpoints between the eight colours the families are named after. That construction assumed a family is centred on its namesake, and several are not: the median of 222 colours people call orange is hue 47, while `#ffa500` is at 71, so a midpoint at 50 filed most oranges as red.

### `generateLightnessScale(hex, options?): string[]`

A perceptual lightness ramp anchored on a colour, in OKLCH. Options: `{ steps = 10, minL = 8, maxL = 97 }`.

### `isLight(hex): boolean` · `suggestTextColour(background, palette): string`

Quick helpers for picking readable text against a background.

### `analysePalette(hexes): PaletteAnalysis | null`

Measures a palette: its OKLCH lightness steps and how even they are, the spread of its chroma, the
arc of the hue wheel it covers and whether its hues turn back in the order given, its near-identical
pairs (CIEDE2000 under 2.5), and the WCAG contrast of every pair, with verdicts on the exact ratio.
Colours it cannot read are left out; null when fewer than two remain.

### `classifyDeltaE(distance): DeltaEBand`

How visible a CIEDE2000 difference is: `imperceptible` under 1, `just-noticeable` under 2,
`noticeable` under 10, `distinct` under 50, and `different` beyond.

## Licence

MIT.
