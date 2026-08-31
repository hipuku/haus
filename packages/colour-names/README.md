# haus-colour-names

31,900 named colours as data. No dependencies, no matching logic.

The dataset is [meodai/color-names](https://github.com/meodai/color-names). This package
carries it and normalises the hexes; the perceptual matching lives in
[`haus-colour-utils`](../colour-utils), so a project that wants CIEDE2000 or WCAG contrast
does not install 764KB of names to get them.

```bash
npm install haus-colour-names haus-colour-utils
```

```ts
import { colourNameEntries } from 'haus-colour-names'
import { createNamedColourMatcher } from 'haus-colour-utils'

const nameColour = createNamedColourMatcher(colourNameEntries())

nameColour('#4f84ba', 3)
// [ { name: 'Blue Vault', hex: '#4e83bd', distance: 0.7 }, … ]
```

`haus-colour-utils` bundles 289 basic colour terms and uses them by default, so reach for
this package when you want the exhaustive set.

## API

| Export | Type | What it is |
|---|---|---|
| `colourNameEntries()` | `() => ColourNameEntry[]` | The dataset as `{ hex, name }`, hexes normalised to `#rrggbb`. Built on first call, then reused. |
| `colourNames` | `Record<string, string>` | The raw map. Keys are six hex digits with no `#`. |
| `COLOUR_NAME_COUNT` | `number` | 31,900. |

## Licence

MIT for the package. The dataset is MIT, from meodai/color-names.
