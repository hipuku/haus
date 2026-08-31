# haus-components

Twelve accessible React components built on [`haus-tokens`](../tokens).

## Install

```bash
npm install haus-components haus-tokens
```

`react` and `react-dom` are peer dependencies, `^18 || ^19`, so your copy is the only copy.
Nothing else is required. Every icon in the package is drawn inline, so there is no icon
font to load and no stylesheet beyond `haus-components/styles.css` and the token layers.

## Usage

Import the token layers, then the component stylesheet. Order matters:
components reference the semantic tokens, so those must be defined first.

```ts
import 'haus-tokens/primitives.css'
import 'haus-tokens/semantics.css'
import 'haus-tokens/motion.css'
import 'haus-components/styles.css'
```

```tsx
import { Button, Card, Badge } from 'haus-components'

<Card>
  <Button variant="primary" size="lg">Save changes</Button>
  <Badge variant="success">Clean</Badge>
</Card>
```

## Components

`Avatar` · `Badge` · `Button` · `Card` · `Checkbox` · `Input` · `Modal` ·
`Radio` · `Select` · `Textarea` · `Toast` · `Toggle`

Every component forwards its ref and spreads the remaining props onto the
underlying element, so anything not modelled as a prop is still reachable.

`Modal` takes either a `title`, which becomes the visible heading and names the
dialog, or an `aria-label` when the design has no heading. The types require one
of the two, since a dialog with no accessible name is announced as nothing.

## The stylesheet is separate, on purpose

The CSS is emitted as a standalone `styles.css` rather than injected when you
import a component. Injection would write to `document` at import time, which
breaks server rendering, and it takes away your control over where the
component styles sit relative to the token layers. One explicit import keeps
both.

Class names are scoped at build time, as in `haus-Button-button-2ZuB7`, so they can
never collide with yours.

## Server rendering

Renders under `react-dom/server` with no DOM present. The interactive
components (`Modal`, `Toggle`, `Checkbox`) use hooks but no layout effects at
module scope, so they hydrate cleanly.

Note there is no `'use client'` directive: under a React Server Components
setup, import these from a client component.

## Build

Vite library mode rather than the tsup used elsewhere in this workspace. tsup
routes every stylesheet through esbuild's global `css` loader, which turns each
`*.module.css` into plain global CSS and hands the component an empty styles
object, giving `className="undefined"` on every element with no error. Vite's
PostCSS pipeline scopes CSS modules properly, which is the entire reason this
package needs a build.

## Licence

MIT
