# haus-style-probe

Read a rendered element's design decisions — in-browser computed-style
extraction, plus pure normalisation into typed token values.

`getComputedStyle` gives you strings: `"rgb(37, 99, 235)"`, `"0.5rem"` resolved
to `"8px"`, `"normal"`, `"none"`. That is the ground truth of what a design
system actually ships, and it is unusable until something turns it into values
you can compare. This package is that something.

## The split

Two halves, divided at the browser boundary — and the division is the design:

| | Runs in | Pure? | Job |
|---|---|---|---|
| `extractRawElements` | the **page** | no (reads the DOM) | return untouched computed-style strings |
| `normaliseElement` | **Node** | yes | parse those strings into typed values |

Nothing is parsed inside the page. That keeps the browser half small enough to
audit by eye, and leaves every parsing decision — colour to hex, line-height to
a unitless ratio, letter-spacing to em — in deterministic functions that are
unit-testable without launching a browser at all.

## Install

```bash
npm install haus-style-probe
```

## Usage

Probe one mounted component:

```ts
import { extractRawElements, normaliseElement } from 'haus-style-probe'

await page.setContent('<div id="probe">' + renderToString(<Button />) + '</div>')

const raw = await page.evaluate(extractRawElements, { root: '#probe' })
const [button] = raw.map(normaliseElement)

button.styles.backgroundColor // → '#2563eb'
button.styles.borderRadius    // → [8]
button.styles.padding         // → [8, 16, 8, 16]
```

Or walk a whole page — same function, no `root`:

```ts
const elements = (await page.evaluate(extractRawElements)).map(normaliseElement)
```

### Options

| Option | Default | Meaning |
|---|---|---|
| `root` | — | CSS selector for the subtree to read: the matched element **and** its descendants, nothing else. Omit to walk the document. |
| `maxElements` | `12000` | Ceiling on extracted elements. A single animation-heavy page can have tens of thousands of nodes; the design system lives in the shared stylesheet, so the first few thousand already cover the token set. |

A `root` that matches nothing returns `[]` rather than falling back to the
whole document — a component that never mounted must not read as a clean one.

## What normalisation decides

| Property | Raw | Normalised |
|---|---|---|
| `color`, `backgroundColor` | `rgb()` / `rgba()` | lowercase hex, alpha pair appended when `< 1`, `null` when fully transparent |
| `effectiveBackgroundColor` | — | nearest non-transparent ancestor background (the value to pair with `color` for contrast) |
| `fontFamily` | the whole stack | first family, unquoted |
| `lineHeight` | `24px` / `normal` | unitless ratio against font-size; `null` for `normal` |
| `letterSpacing` | `0.4px` / `normal` | em against font-size; `0` for `normal` |
| `fontWeight` | `bold` | `700` |
| `borderRadius`, `gap` | four/two sides | distinct values, deduped |
| `borderColor` | four sides | only sides with non-zero width — computed border colour defaults to `currentColor` even at width `0` |
| `motionDurations` | `0.2s, 300ms` | milliseconds, non-zero, distinct |

## Authoring constraint

`extractRawElements` is shipped to the browser by `Function.prototype.toString`.
It therefore has no access to module scope: no imports, no shared constants, no
nested named functions (bundler `keepNames` wraps those in a `__name` helper
that does not exist in the page). `tsup.config.ts` pins `keepNames: false`, and
`extract.test.ts` rebuilds the function with `new Function` — stripping every
closure, exactly as the browser does — so a regression fails the suite rather
than the crawl.

## Consumers

- **[drift](https://github.com/hipuku/drift)** — walks whole sites to describe
  the design system a page actually ships.
- **loom** — mounts one component and compares its rendered value against the
  intended design.

Descriptive audit and prescriptive comparison are different tools; the
measurement underneath them should not be written twice.

## Licence

MIT
