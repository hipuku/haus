# Contributing

## The shape of the thing

Five packages in a pnpm workspace, plus a Storybook that consumes them the way a
consumer would.

```
packages/tokens          the system: primitives, brand, semantics, motion
packages/components      twelve React components built on it
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
pnpm run typecheck && pnpm run lint && pnpm run lint:css && pnpm -r run test && pnpm run build
```

`lint:css` is the one people forget. It fails a raw value where a token exists,
which is the rule the whole token layer rests on.

## The rules that are not style preferences

**Generated files are generated.** `primitives.css`, `motion.css`, `index.ts`,
`brand.ts` and `tokens.json`'s semantic block all come from
`packages/tokens/scripts/build-tokens.ts`. Edit the source or the generator, never
the output — `pnpm --filter haus-tokens run tokens:check` fails CI if they
disagree, and it has already caught someone editing a comment in a generated
file.

**Components read roles, not primitives.** Two exceptions are allowed and both
are tested: a size off the space ladder, and a primitive whose own name is
already the role. `packages/components/src/tokens.test.ts` enforces it.

**Never a physical inline-axis property.** `margin-inline-start`, not
`margin-left`. `logical-properties.test.ts` enforces it, including the case a
rename cannot fix: a `translateX` with no `[dir='rtl']` rule to flip it.

**Every focus ring needs a forced-colors fallback.** Same test. A ring is a
`box-shadow` and forced-colors drops those, so a ring without the fallback is no
ring at all for the people who need it most.

**A claim about every component wants a test that walks the barrel.** Not one
test per component — that lets the thirteenth arrive without it.
`api-surface.test.ts` is the pattern.

## Decisions

Anything that changes what a consumer sees, or that someone will otherwise
re-litigate in six months, gets a file in [`docs/decisions/`](docs/decisions/README.md):
context, decision, consequences, and what it was chosen *over*.

A decision can be accepted and unimplemented — several are, and say so. Agreeing
a contract before writing it is the point of deciding in the open.

## Commits and versions

Write the commit message for the person who finds this in a year and needs to
know why. What was broken, what it now does, and what was decided against.

Versioning is [decision 0004](docs/decisions/0004-versioning-is-1-x.md): 1.x
everywhere, a token rename is a major at an identical value, and a contrast
change is a major even when the hex barely moves. `RELEASING.md` has the bump
table and the publish order — `haus-components` depends on `haus-tokens`, so
tokens goes to npm first and the workflow enforces it.

Add a `CHANGELOG.md` entry in the same commit as the change. The gap between
0.2.0 and 0.4.0 has no entries because nobody did, and they cannot be
reconstructed honestly now.

## What not to do

- Do not add a component without deciding to. Twelve is a scope, not a count —
  widening it should cost a decision the way narrowing it would.
- Do not reach past a role to a primitive to get a colour. If the role you want
  does not exist, that is the finding.
- Do not add a second colour system for older browsers. See
  [`docs/browser-support.md`](docs/browser-support.md): the floor is stated, and
  two colour systems is the drift problem this repository exists to solve.
