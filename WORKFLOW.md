# haus: workflow

How changes get into haus: branches, pull requests, the checks that gate them, review, and how a
package is released.

## Contents

- [Branches and pull requests](#branches-and-pull-requests)
- [Checks](#checks)
- [Review](#review)
- [Releases](#releases)

---

## Branches and pull requests

Nothing is committed to `main` directly. Every change goes through a branch named
`<type>/<short-name>` (`feat`, `fix`, `design`, `a11y`, `docs`, `refactor`, `chore`, `deps`) and a
pull request that uses the template, carries one type label, and is squash merged. The pull request
title becomes the commit on `main`, and labels group the release notes.

The template asks whether the change is visible to a consumer. A breaking or additive change carries
its `CHANGELOG.md` entry in the same pull request, and a decision someone would otherwise
re-litigate gets a record in [`docs/decisions/`](./docs/decisions/README.md).

The `main` ruleset requires a pull request, the checks below, resolved conversations and a linear
history, and it applies to the owner too.

## Checks

| Check             | Workflow        | Runs                                                                                             | Required |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Lint              | `ci.yml`        | `pnpm run lint` (ESLint), `lint:css` (Stylelint), `lint:prose`, `lint:md` (markdownlint), `knip` | Yes      |
| Links             | `ci.yml`        | lychee, offline: every relative link and heading anchor in the markdown resolves                 | Yes      |
| Format            | `ci.yml`        | `pnpm run format:check`                                                                          | Yes      |
| Typecheck         | `ci.yml`        | The package build, then `pnpm -r run typecheck`                                                  | Yes      |
| Test              | `ci.yml`        | The package build, then every suite with its coverage floor                                      | Yes      |
| Build             | `ci.yml`        | `tokens:check`, the package build and the Storybook build, after the four above pass             | Yes      |
| Visual regression | `chromatic.yml` | Chromatic snapshots every story; a change waits in Chromatic for a person to accept it           | No       |
| CodeQL            | default setup   | Code scanning of the TypeScript and the workflows                                                | No       |

Visual regression never fails the build (`exitZeroOnChanges`), and nothing is accepted
automatically, so accepting a visual change is a decision rather than a side effect of merging. It
skips with a notice when `CHROMATIC_PROJECT_TOKEN` is not available, as on a fork.

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
