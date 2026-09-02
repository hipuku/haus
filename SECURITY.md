# Security

## Reporting

Open a [security advisory](https://github.com/hipuku/haus/security/advisories/new)
rather than a public issue. If that is not available to you, email the address on
the GitHub profile.

Expect an acknowledgement within a week. This is a solo project, so that is a
realistic promise rather than a service level.

## What is in scope

These are five npm packages of CSS custom properties, React components and pure
functions. There is no server, no database, no authentication and no network
call anywhere in the published code.

Realistically, that leaves:

- **A supply-chain problem** — a compromised dependency, or a published artefact
  that does not match this source.
- **A component that renders unescaped input.** The components pass their props
  to DOM attributes; none uses `dangerouslySetInnerHTML`.
- **A CSS injection** through a value that reaches a custom property.
  `Avatar` sets two properties from a `style` prop, derived from the `name` it is
  given — worth knowing if a name is attacker-controlled.

## What is not

- The Storybook in `apps/storybook`. It is a documentation site with no data.
- Anything reachable only by a maintainer with repository write access.
- Dependency advisories with no path to exploitation from a consumer's use of
  these packages. Dependabot is configured and those are handled as ordinary
  maintenance.

## What is done about it

Dependabot runs on this repository and every advisory is at zero. Releases are
published from CI rather than a laptop, and `RELEASING.md` documents the order
and the gate: `prepublishOnly` runs `tokens:check` and the build, so a published
artefact cannot disagree with its source.
