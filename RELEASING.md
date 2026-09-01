# Releasing

Five packages publish to npm from this repo, unscoped and public:
`haus-tokens`, `haus-components`, `haus-colour-utils`, `haus-style-probe`,
`haus-colour-names`.

Each is released by pushing a tag. `.github/workflows/publish.yml` reads the tag, checks the
manifest agrees with it, builds, tests and publishes. If the version in the tag is already on
npm, the run skips instead of failing, so a tag can also be written after the fact to give an
earlier release a commit to point at.

## Authentication

There is no npm token. The workflow publishes by **trusted publishing**: GitHub mints a
short-lived OIDC token proving which repository, workflow and commit is asking, and npm
checks that against a trusted publisher registered on the package. Nothing long-lived is
stored, so there is no secret to leak and nothing that expires at an inconvenient moment.
Published releases carry provenance for the same reason: npm can prove where they came from.

Each package needs this configured once, at
`npmjs.com/package/<name>/access` → **Trusted publisher**:

| Field | Value |
|---|---|
| Provider | GitHub Actions |
| Organization or user | `hipuku` |
| Repository | `haus` |
| Workflow filename | `publish.yml` |
| Environment | *(leave empty)* |

A package that does not exist on npm yet cannot be configured this way, because the settings
page is a property of the package. Publish its first version manually, with `pnpm pack` in the
package directory, then `npm publish <tarball>` from your own machine, answering the 2FA
prompt, then register the trusted publisher immediately afterwards. Every release after the
first goes through CI.

## Tag format

```
<directory>-v<version>
```

The directory is the folder under `packages/`, so `colour-utils-v0.1.3` releases
`packages/colour-utils` as `haus-colour-utils@0.1.3`. The workflow fails if
`packages/<directory>/package.json` does not exist, or if its `version` is not the version in
the tag.

## Cutting a release

From the package directory:

```sh
pnpm version patch          # or minor / major, and it writes the manifest
git commit -am "colour-utils 0.1.3: <what changed>"
git tag colour-utils-v0.1.3
git push && git push --tags
```

Watch the run. npm will not overwrite a version that already exists, so a failed publish is
recoverable by bumping again.

### Tagging a release that already happened

The first version of each package was published by hand, before this workflow existed, and
two of the five never got one. Tag the commit whose manifest carries that version:

```sh
git tag style-probe-v0.2.1 <commit>
git push --tags
```

The tag is the point: it is what lets `git describe` and the npm page agree on which commit a
published version came from.

Actions runs the workflow **as it existed at the tagged commit**, not as it exists on `main`. So a
tag written onto a commit from before the skip check will still run the old workflow and fail at
npm with "cannot publish over the previously published versions". The tag is created correctly
either way; the run is noise, and the run can be deleted from the Actions page. `tokens-v0.1.2` and
`style-probe-v0.2.1` are both in that state. Any tag written from here on gets the skip.

## Order matters

`haus-components` depends on `haus-tokens`, and `haus-style-probe` on `haus-colour-utils`,
through `workspace:^`. pnpm rewrites that to the dependency's real version when it publishes,
so **the dependency has to be on npm at that version first**. Publishing components against a
tokens version that was never released produces a package that installs and then fails to
resolve.

The workflow checks this and refuses rather than shipping it, but the fix is always the same:
release the dependency, then release the dependent.

Current order, bottom up:

```
haus-tokens        →  haus-components
haus-colour-utils  →  haus-style-probe
haus-colour-names     (nothing depends on it)
```

## Semver policy

Settled 2026-09-01 as ruling A4, and the reason the 1.0 cut exists.

**Every package is 1.x or above. Nothing stays on 0.x.**

The five packages sat on 0.x because 0.x reads as "not finished yet", and that was never the
claim being made. `^0.2.0` does not mean what a reader expects: under the caret rule, a 0.x
minor is treated as breaking, so **a minor cannot reach a consumer while a patch can**. That is
backwards, and it is why the control-height tokens sat published and unreachable in drift until
a lockfile was repointed by hand.

Once on 1.x the ordinary rules apply, and here is what each one means for a token system, where
the usual advice about "the public API" is not enough:

| Bump | What it covers |
|---|---|
| **major** | Removing or renaming a custom property. Changing which primitive a role resolves to in a way that alters contrast. Removing or renaming a component prop or one of its accepted values. Raising the supported browser floor. |
| **minor** | Adding a property, a role, a component, a prop or an accepted value. Changing a value within its documented intent, where a shade moves and every contrast pair it participates in still passes. |
| **patch** | A fix that changes no name and no documented value: a wrong `var()` reference, a missing `on-*` pair, a build artefact that did not match its source. |

Three consequences worth stating, because each has already caught someone here:

- **A token rename is a major even when the value is identical.** The name is the API.
- **A contrast change is a major even when the hex barely moves.** A consumer may be relying on
  a documented ratio, and there is no way for them to detect the change at install time.
- **Prefixing every property with `--haus-` is one major, taken once.** It lands with the 1.0
  cut alongside the brand-map split and ruling A5, so consumers absorb one migration rather
  than three. See `docs/theming.md`.

`CHANGELOG.md` records every entry under the bump it claimed. A release with no changelog entry
is not a release.

## What the workflow will not do for you

- It does not decide the version. Semver is a claim about compatibility and it is yours to
  make; the policy above says what each bump has to mean, not which one this release is.
- It does not push the tag. Nothing here rewrites or pushes history on your behalf.
- It does not publish more than one package per tag. Two releases means two tags.
