# haus: workflow

How changes get into haus: branches, pull requests, the checks that gate them, review, keeping
Figma and code in step, and how a package is released.

## Contents

- [Branches and pull requests](#branches-and-pull-requests)
- [Checks](#checks)
- [Review](#review)
- [Design sync](#design-sync)
- [Releases](#releases)

---

## Branches and pull requests

Nothing is committed to `main` directly. Every change goes through a branch named
`<type>/<short-name>` (`feat`, `fix`, `design`, `a11y`, `docs`, `refactor`, `chore`, `deps`) and a
pull request that uses the template, carries one type label, and is squash merged. The pull request
title becomes the commit on `main`, and labels group the release notes.

The template asks whether the change is visible to a consumer. A breaking or additive change carries
its `CHANGELOG.md` entry in the same pull request, and a decision someone would otherwise
re-litigate gets the next numbered entry under [Decisions](./DESIGN.md#decisions) in `DESIGN.md`.

The `main` ruleset requires a pull request, the checks below, resolved conversations and a linear
history, and it applies to the owner too.

## Checks

| Check             | Workflow           | Runs                                                                                             | Required |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| Lint              | `ci.yml`           | `pnpm run lint` (ESLint), `lint:css` (Stylelint), `lint:prose`, `lint:md` (markdownlint), `knip` | Yes      |
| Links             | `ci.yml`           | lychee, offline: every relative link and heading anchor in the markdown resolves                 | Yes      |
| Format            | `ci.yml`           | `pnpm run format:check`                                                                          | Yes      |
| Typecheck         | `ci.yml`           | The package build, then `pnpm -r run typecheck`                                                  | Yes      |
| Test              | `ci.yml`           | The package build, then every suite with its coverage floor                                      | Yes      |
| Build             | `ci.yml`           | `tokens:check`, the package build and the Storybook build, after the four above pass             | Yes      |
| Visual regression | `chromatic.yml`    | Chromatic snapshots every story; a change waits in Chromatic for a person to accept it           | No       |
| CodeQL            | default setup      | Code scanning of the TypeScript and the workflows                                                | No       |
| Figma parity      | `figma-parity.yml` | `pnpm run figma:check`, described under [Design sync](#design-sync)                              | No       |

Visual regression never fails the build (`exitZeroOnChanges`), and nothing is accepted
automatically, so accepting a visual change is a decision rather than a side effect of merging. It
skips with a notice when `CHROMATIC_PROJECT_TOKEN` is not available, as on a fork. It snapshots only the stories a change can
affect (TurboSnap), and every story whenever anything under `packages/` changes, because the
Storybook reads the packages' built output, which git does not track.

## Review

CodeRabbit reviews every pull request that is not a draft. Its configuration, `.coderabbit.yaml`,
gives it this repo's rules by path:

- **Component stylesheets:** roles from the semantic layer, with the two allowed primitive reads;
  no raw values; logical properties; a forced-colours fallback for every focus ring.
- **Components:** nothing attached across a Server Component boundary that the caller did not
  pass, an accessible name and keyboard handling for interactive elements, the `--haus-` prefix on
  every custom property, and `className` on the root.
- **Generated token files:** never edited by hand.
- **`brand.css` and `semantics.css`:** no new names or raw values in the brand layer, no palette
  names in the semantic one, and the versioning rules for a rename or a contrast change.
- **Package manifests:** a version change comes with its CHANGELOG entry.
- **Markdown:** Australian English and claims the code supports.

It is not a required check. Each comment is applied in a commit or answered with a reason, then
resolved; the ruleset will not merge a pull request with an open conversation.

## Design sync

haus's design lives in one Figma file, [haus Design System](https://www.figma.com/design/Qo23P38COlJrfQmlM39Fa3/haus-Design-System):
the token collections and one page per component. The Figma parity check compares it with the code
on every pull request, so a difference in a component is found when it is made rather than when
someone notices. Variables are compared from an exported snapshot, so a variable changed in Figma is
found once the snapshot is refreshed.

### What is compared

| Item               | Code                                                                      | Figma                                                 |
| ------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| `token --haus-*`   | A custom property in `haus-tokens`, resolved to its final value           | A variable, by its code syntax, resolved              |
| `component Button` | A folder in `packages/components/src/components`                          | A component set                                       |
| `axis Button.size` | A prop typed as a union of strings, or an alias for one                   | A variant property of the set                         |
| `states Button`    | The `:hover`, `:active`, `:focus-visible` and `:disabled` rules it writes | The `Hover`, `Pressed`, `Focus` and `Disabled` states |

Tokens are compared resolved. Figma folds the brand layer into the semantics collection's modes, so
a role there points straight at a primitive, while in code it reads a `--haus-brand-*` entry first.
Both chains are followed to the end, colours are compared as the hex Figma stores, and a type role's
leading and tracking are compared in pixels, because that is what its Figma variable holds
([decision 0026](./DESIGN.md#0026-type-roles-in-figma)). The default mode is compared, which is the
haus brand; a named brand's own primitives are read too, because Figma keeps them beside haus's.

Some things are left out on purpose, and `figma/exceptions.json` lists each with its reason: motion
and shadows (Figma has no variable that drives a transition, and draws shadows as effect styles),
the numeric ladders under a role, checked and selected values drawn as variants, and the
construction parts Figma draws as their own sets. The check warns when an exception is no longer
needed. Booleans and text properties are not compared, because in Figma they are as often layer
toggles as props.

### Where Figma is read from

Components are read live from Figma's REST API, with a personal access token stored as the
`FIGMA_TOKEN` repository secret. Variables cannot be read that way, because the REST variables
endpoint needs an Enterprise plan, so they come from `figma/snapshot/haus.json`, exported through
Figma's Plugin API. The check warns when the file has changed since that export, and
`pnpm run figma:check --plugin-code` prints the export to run; `--save` stores its result.

Without the token (a fork, a Dependabot pull request, or a local run) everything comes from the
snapshot, and the report says so. A rate limit or a server error is retried up to twice, waiting at
most a minute each time; if Figma still cannot answer, components are compared from the snapshot,
the report names the snapshot's date, and the weekly run leaves the issues alone. While the variables snapshot is older than the file, the weekly run leaves each token's own issue as
it is, carries on opening and closing component issues, and still rewrites the known-drift tracking
issue. A rejected token
is different: it fails the check, because a snapshot would hide it.

### How a finding is decided

`figma/baseline.json` holds, for every item, the pair of values code and Figma had when the baseline
was last accepted. Each side is compared with its own half of that pair, which says which side
moved:

| Code      | Figma     | Finding                   | Effect                                        |
| --------- | --------- | ------------------------- | --------------------------------------------- |
| Moved     | Not moved | Code ahead of Figma       | Fails the pull request                        |
| Not moved | Moved     | Changed in Figma          | A drift decision issue                        |
| Lacks it  | Added it  | New in Figma              | A design proposal issue                       |
| Moved     | Moved     | Conflict                  | Fails the pull request                        |
| Not moved | Not moved | Known drift               | Listed in the tracking issue; never fails     |
| Match     | Match     | Agreed since the baseline | `pnpm run figma:accept` moves the baseline on |

The `figma-later` label turns code ahead of Figma into a warning, for a change whose Figma update
follows in its own pull request. It never waives a conflict. `scripts/figma/diff.mjs` holds these
rules and `scripts/figma/parity.test.mjs` tests them.

### Resolving a finding

- **Code ahead of Figma.** Update Figma so the check matches, or accept the difference as known drift
  with `pnpm run figma:accept "<item>"` in the same pull request.
- **Changed in Figma.** Answer the issue with `/keep-code` (Figma changes back to the shipped value)
  or `/take-figma` (code changes to the Figma value, in its own pull request).
- **New in Figma.** Build it, or remove it from Figma.
- **After either side changes,** run `pnpm run figma:accept` in the pull request that brings them
  together, so the baseline records the agreement.

A component change in Figma includes its page: the component's documentation beside the set says
what its properties and defaults are, and the check does not read it, so it is updated in the same
change.

## Releases

Each package is released on its own by a tag, `<directory>-v<version>` (for example
`components-v3.1.1`). The pull request that changes a package bumps its version and writes its
CHANGELOG entry, so the change, the version and the notes land in one commit that passed every
check; the tag goes on that commit after it merges. When several changes ship together, each
pull request writes its entry under an unreleased heading for that package, and a release pull
request bumps the version and dates the heading. Pushing the tag runs `publish.yml`, which checks
the manifest agrees with the tag, builds the workspace, runs the package's tests and publishes to
npm with provenance through trusted publishing. Every step, and the order packages must be released
in, is in [`RELEASING.md`](./RELEASING.md).

Generated GitHub release notes are grouped by label through `.github/release.yml`; the package's
CHANGELOG entry is what the release says.
