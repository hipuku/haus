# haus

A token-first design system for React, published as five npm packages: OKLCH design tokens with a
replaceable brand layer, 20 accessible components built on them, and the colour and measurement
libraries underneath. Light and dark modes; the product brands are light only.

![The haus Storybook: the Composition page, a sign-in form built from haus components, beside the token and component index](screenshots/storybook-composition.png)

[![Case study on hipuku.dev](https://img.shields.io/badge/Case_study-hipuku.dev-7653AB?style=for-the-badge)](https://www.hipuku.dev/work/haus)
[![Documentation](https://img.shields.io/badge/Docs-docs.hipuku.dev-7653AB?style=for-the-badge)](https://docs.hipuku.dev)
[![Live Storybook](https://img.shields.io/badge/Live-Storybook-7653AB?logo=storybook&logoColor=white&style=for-the-badge)](https://haus.hipuku.dev)
[![haus-components on npm](https://img.shields.io/npm/v/haus-components?label=npm&logo=npm&logoColor=white&color=7653AB&style=for-the-badge)](https://www.npmjs.com/package/haus-components)
[![Figma file](https://img.shields.io/badge/Figma-1_file-7653AB?logo=figma&logoColor=white&style=for-the-badge)](https://www.figma.com/design/Qo23P38COlJrfQmlM39Fa3/haus-Design-System)

## At a glance

- **Four token layers.** Primitives, brand, semantics and motion, each in its own cascade layer;
  components read roles, never palette steps. [`DESIGN.md` § Layers](./DESIGN.md#layers)
- **Replaceable brand.** A brand is one file of 71 choices, and two products ship their own on the
  same contract. [`DESIGN.md` § Brands](./DESIGN.md#brands)
- **Accessible components.** Axe runs in all 20 component suites, every surface is measured
  against its paired ink, and every focus ring has a forced-colours fallback.
  [`DESIGN.md` § Accessibility](./DESIGN.md#accessibility)
- **Decided in the open.** 28 numbered decisions, each with what it was chosen over.
  [`DESIGN.md` § Decisions](./DESIGN.md#decisions)
- **Generated, not copied.** The primitives, the motion layer and the typed constants are generated
  from the token file, and the brand map type from `brand.css`; CI fails if either drifts.
  [`ARCHITECTURE.md` § Token build](./ARCHITECTURE.md#token-build)
- **Used by four products.** core, vault, drift and maple each take the packages they need.
  [`ARCHITECTURE.md` § Consumers](./ARCHITECTURE.md#consumers)

## Documentation

| File                                   | Covers                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------ |
| [`DESIGN.md`](./DESIGN.md)             | Tokens, brands, typography, components, accessibility and enforcement    |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Packages, consumers, the token and component builds, publishing, testing |
| [`WORKFLOW.md`](./WORKFLOW.md)         | Branches, pull requests, checks, review, keeping Figma and code in step  |
| [`docs/`](./docs/)                     | Reference: tokens, accessibility, browser support                        |
| [`CHANGELOG.md`](./CHANGELOG.md)       | What each package release changed, for a consumer                        |
| [`RELEASING.md`](./RELEASING.md)       | How a package is tagged and published                                    |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | The rules a change is held to                                            |

## Install

```bash
npm install @hipuku/tokens haus-components
```

```ts
import '@hipuku/tokens/index.css'
import 'haus-components/styles.css'
```

Every component, foundation and package has a page at
[docs.hipuku.dev](https://docs.hipuku.dev), with the tools that demonstrate them.

React 18 or 19 is a peer dependency. The colour libraries install on their own: `@hipuku/colour`,
which replaces `haus-colour-utils` and `haus-colour-names`, and `@hipuku/style-probe`, previously
`haus-style-probe`. The token package was `haus-tokens`. Each old name has a final deprecated
release pointing at its replacement, and nothing was unpublished. Each package's README covers its
API.

### From the registry

Components also install as source, copied into your repository with
[shadcn](https://ui.shadcn.com). Map the `@hipuku` namespace in `components.json`:

```json
{
  "registries": {
    "@hipuku": "https://haus.hipuku.dev/r/{name}.json"
  }
}
```

```bash
npx shadcn add @hipuku/badge
```

`@hipuku/badge` is a registry name, installed with `shadcn add`. Components are not npm packages, so
`npm install @hipuku/badge` finds nothing.

Every component in `packages/components` is in the registry, with the four internal helpers and the
shared types it reaches as registry dependencies, so `shadcn add` brings them along. Each
component's tokens come from `@hipuku/tokens`, which the install adds as a dependency.

**The registry is for TypeScript projects.** Every file installs byte for byte, so a project with
`"tsx": false` in `components.json` receives `.js` and `.jsx` files that still contain TypeScript,
and its build fails. The files are not rewritten because shadcn's rewriting of component source
broke Badge: with `cssVariables: false` it changed `.join(' ')` to `.join('')`.

## Develop

Node 22 (`.nvmrc`) and pnpm 10 (`packageManager` in `package.json`).

```bash
pnpm install
pnpm run storybook      # builds the packages, then serves Storybook on port 6006
pnpm --filter docs dev  # the docs site, once the packages are built
```

## Scripts

| Command                    | Runs                                                    |
| -------------------------- | ------------------------------------------------------- |
| `pnpm run build`           | Every package                                           |
| `pnpm run lint`            | ESLint                                                  |
| `pnpm run lint:css`        | Stylelint, which fails a raw value where a token exists |
| `pnpm run lint:prose`      | The em dash check, against its baseline                 |
| `pnpm run lint:md`         | markdownlint                                            |
| `pnpm run knip`            | Unused files, exports and dependencies                  |
| `pnpm run figma:check`     | Code against the Figma file, see `WORKFLOW.md`          |
| `pnpm run test:scripts`    | The repository scripts' own tests                       |
| `pnpm run format:check`    | Prettier                                                |
| `pnpm run typecheck`       | `tsc` in every package                                  |
| `pnpm -r run test`         | Every test suite                                        |
| `pnpm run build-storybook` | The static Storybook                                    |
| `pnpm run build-registry`  | The registry items, into the Storybook output           |
| `pnpm run test:registry`   | Installs every registry item into a fresh app           |
| `pnpm run lint:docs`       | Fails when a registry component has no docs page        |

## Stack

React · TypeScript · CSS Modules · OKLCH · W3C Design Tokens · pnpm workspaces · tsup · Vite ·
Vitest · Storybook · Chromatic
