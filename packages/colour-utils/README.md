# haus-colour-utils

Perceptual colour utilities — the colour science behind the [haus](https://github.com/hipuku/haus) design system, published standalone. Pure ESM, ships its own types, one dependency.

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
  generateLightnessScale,
  isLight,
  suggestTextColour,
} from "haus-colour-utils";
```

### `deltaE(a, b): number`
CIEDE2000 perceptual distance between two hex colours. `< 1` is imperceptible; `< 2` is a just-noticeable difference.

```ts
deltaE("#3366cc", "#3467cc"); // ~0.7 — effectively the same colour
```

### `wcagContrast(foreground, background): ContrastResult`
WCAG 2.1 contrast ratio and pass/fail verdicts.

```ts
wcagContrast("#767676", "#ffffff");
// { ratio: 4.54, passAA: true, passAAA: false, passAALarge: true }
```

### `clusterByPerceptualDistance(hexes, threshold?): ColourCluster[]`
Group colours that are perceptually within `threshold` ΔE of each other (default `8`) — the basis for finding near-duplicate tokens.

### `nearestNamedColour(hex, topN?): NamedColourMatch[]`
The closest named colours to a hex, ranked by CIEDE2000 distance.

### `generateLightnessScale(hex, options?): string[]`
A perceptual lightness ramp anchored on a colour, in OKLCH. Options: `{ steps = 10, minL = 8, maxL = 97 }`.

### `isLight(hex): boolean` · `suggestTextColour(background, palette): string`
Quick helpers for picking readable text against a background.

## Licence

MIT.
