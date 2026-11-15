# Contributing

## The shape of the thing

Five packages in a pnpm workspace, plus a Storybook that consumes them the way a
consumer would.

```text
packages/tokens          the system: primitives, brand, semantics, motion
packages/components      twenty React components built on it
packages/colour-utils    contrast, ramps, perceptual distance
packages/colour-names    a name for a colour
packages/style-probe     reads computed styles off a live page
apps/storybook           what a reviewer opens
```

```bash
pnpm install
pnpm run build          # every package
pnpm run storybook      # builds first, then serves
```

Node 22. `.nvmrc` says so, and on 20 the suites fail with a jsdom error that
looks like a code problem rather than a version one.

## Before you push

```bash
pnpm run typecheck && pnpm run lint && pnpm run lint:css && pnpm run lint:prose && pnpm run format:check && pnpm -r run test && pnpm run build
```

`lint:css` is the one people forget. It fails a raw value where a token exists.

## The rules that are not style preferences

**Generated files are generated.** `primitives.css`, `motion.css`, `index.ts`,
`brand.ts` and `tokens.json`'s semantic block all come from
`packages/tokens/scripts/build-tokens.ts`. Edit the source or the generator, never
the output. `pnpm --filter haus-tokens run tokens:check` fails CI if they
disagree, and it has already caught someone editing a comment in a generated
file.

**Components read roles.** Two primitive reads are allowed and both are tested:
a size off the space ladder, and a primitive whose own name is already the
role. `packages/components/src/tokens.test.ts` enforces it.

**Never a physical inline-axis property.** `margin-inline-start`, not
`margin-left`. `logical-properties.test.ts` enforces it, including the case a
rename cannot fix: a `translateX` with no `[dir='rtl']` rule to flip it.

**Every focus ring needs a forced-colors fallback.** Same test. A ring is a
`box-shadow` and forced-colors drops those, so without the fallback there is no
visible ring in that mode.

**A claim about every component needs a test that walks the barrel.** One test
per component lets the next component arrive without one. `api-surface.test.ts`
is the pattern.

**This package has no `use client`, so every stateless component is on the React
Server Component path.** A Server Component can render `Button`, `Badge` or `Card`
directly with no client bundle, and core does that in two pages. Ten components
can be rendered that way: `Avatar`, `Badge`, `Button`, `Callout`, `Card`,
`Divider`, `EmptyState`, `IconButton`, `Spinner`, `Toast`.

That path is guarded by its rule rather than by a render harness
([decision 0024](docs/decisions/0024-the-rsc-path-is-guarded-by-its-rule.md)):

- **A component may not pass a `ref`, an event handler or anything else across a
  boundary it was not given one for.** The rule is narrower than "support RSC":
  do not attach a prop the caller did not pass.
- `rsc-rules.test.tsx` renders every `asChild` component with no ref on either
  side and fails if one arrives. That is the one way this package has broken a
  Server Component (`haus#71`), and the test catches nothing broader: a hook or
  an event handler in a server tree is not checked.
- `ssr.test.tsx` covers `renderToString`, which is server rendering, not React
  Server Components, and accepts a ref where an RSC render rejects one.
- **A new prop that clones, forwards or injects into a caller's element is the
  kind that breaks this way.** `asChild` is the only one today, on Button,
  IconButton and Card.

## Visual regression

Chromatic runs on pushes to `main` and on pull requests. It bills by snapshot:
one per story, per browser, per run.

It needs `CHROMATIC_PROJECT_TOKEN` as a repository secret. Without it the job
skips with a notice, so a fork does not fail on a secret it cannot set.

A visual change does not fail the build, and nothing is auto-accepted. Changes
wait in the Chromatic UI for a person to accept or reject them (`haus#36`).

## Decisions

Anything that changes what a consumer sees, or that someone will otherwise
re-litigate in six months, gets a file in [`docs/decisions/`](docs/decisions/README.md):
context, decision, consequences, and what it was chosen over.

A decision can be accepted and unimplemented. Several are, and say so: a
contract can be agreed before it is built.

## Commits and versions

Write the commit message for the person who finds this in a year and needs to
know why. What was broken, what it now does, and what was decided against.

Versioning is [decision 0004](docs/decisions/0004-versioning-is-1-x.md): 1.x
everywhere, a token rename is a major at an identical value, and a contrast
change is a major even when the hex barely moves. `RELEASING.md` has the bump
table and the publish order. `haus-components` depends on `haus-tokens`, so
tokens goes to npm first and the workflow enforces it.

Add a `CHANGELOG.md` entry in the same commit as the change. The gap between
0.2.0 and 0.4.0 has no entries because nobody did, and they cannot be
reconstructed honestly now.

## What not to do

- Do not add a component without deciding to. Twenty is the scope, and widening
  it should cost a decision the way narrowing it would.
- Do not reach past a role to a primitive to get a colour. If the role you want
  does not exist, that is the finding.
- Do not add a second colour system for older browsers. See
  [`docs/browser-support.md`](docs/browser-support.md): the floor is stated, and
  two colour systems is the drift problem this repository exists to solve.
