# Releasing

Packages publish to npm from this repo: the scoped `@hipuku/*` packages, public, and `haus-components`
until its final release.

## The colour rename

`haus-colour-utils` and `haus-colour-names` merged into `@hipuku/colour`, in `packages/colour`, after
commit `0f18c24`. Neither directory exists on `main` any more, but each old name still gets one
final release that points at the replacement. The workflow reads the package from the tagged commit,
so tag a commit where the old directory exists:

```sh
git switch -c release/colour-utils-final 0f18c24
# in packages/colour-utils: bump the version, point the README at @hipuku/colour
git commit -am "colour-utils 1.0.2: final release, replaced by @hipuku/colour"
git tag colour-utils-v1.0.2 && git push origin colour-utils-v1.0.2
npm deprecate haus-colour-utils "Replaced by @hipuku/colour"
```

The same for `colour-names`. **`@hipuku/style-probe` cannot be released until `@hipuku/colour` is on
npm**, because it now depends on it; the workflow refuses, as below. `@hipuku/colour`'s first
version is published by hand, like any new package.

Each is released by pushing a tag. `.github/workflows/publish.yml` reads the tag, checks the
manifest agrees with it, builds, tests and publishes. If the version in the tag is already on
npm, the run skips instead of failing, so a tag can also be written after the fact to give an
earlier release a commit to point at.

## The tokens and style probe renames

`haus-tokens` became `@hipuku/tokens` and `haus-style-probe` became `@hipuku/style-probe` after commit
`ec0982c`. Their directories did not move, so the tags keep their prefixes: `tokens-v…` and
`style-probe-v…` now publish the new names. Each old name gets one final release from a branch cut
from `ec0982c`, where the old names are still in `package.json`, then `npm deprecate` pointing at the
new name, as for colour above. The first version of each new name is published by hand.

Until the new names are on npm, consumer-facing install text keeps the published names: the root
README, Storybook's installation page, and the install and import examples in both packages'
READMEs. `registry.json` now depends on `@hipuku/tokens@^6.0.0`. All of them switched at the
release.

Every `@hipuku/*` manifest sets `publishConfig.provenance`. Provenance is generated in CI, so if the
manual first publish of a new name stops with an `EUSAGE` error about provenance, publish that first
version with `npm publish <tarball> --provenance=false`; CI releases after it keep provenance.

## Authentication

There is no npm token. The workflow publishes by **trusted publishing**: GitHub mints a
short-lived OIDC token proving which repository, workflow and commit is asking, and npm
checks that against a trusted publisher registered on the package. Nothing long-lived is
stored, so there is no secret to leak and none to rotate.
Published releases carry provenance for the same reason: npm can prove where they came from.

Each package needs this configured once, at
`npmjs.com/package/<name>/access` → **Trusted publisher**:

| Field                | Value           |
| -------------------- | --------------- |
| Provider             | GitHub Actions  |
| Organization or user | `hipuku`        |
| Repository           | `haus`          |
| Workflow filename    | `publish.yml`   |
| Environment          | _(leave empty)_ |

A package that does not exist on npm yet cannot be configured this way, because the settings
page is a property of the package. Publish its first version manually, with `pnpm pack` in the
package directory, then `npm publish <tarball>` from your own machine, answering the 2FA
prompt, then register the trusted publisher immediately afterwards. Every release after the
first goes through CI.

## Tag format

```text
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

The first version of each package was published by hand, before this workflow existed. A tag
written later onto the commit whose manifest carries that version gives the npm page a commit
to point at:

```sh
git tag style-probe-v0.2.1 <commit>
git push --tags
```

The run it starts skips at the version check, because that version is already on npm.

Actions runs the workflow **as it existed at the tagged commit**, not as it exists on `main`. A tag
on a commit from before the skip check runs the old workflow, which fails at npm with "cannot
publish over the previously published versions". The tag itself is correct either way.
`tokens-v0.1.2` (run #11) is in that state. Run #10, `style-probe-v0.2.1`, failed for a
different reason, a declaration build error since fixed by building the whole workspace; that
version reached npm by hand.

## Order matters

`haus-components` depends on `@hipuku/tokens`, and `@hipuku/style-probe` on `@hipuku/colour`,
through `workspace:^`. pnpm rewrites that to the dependency's real version when it publishes,
so **the dependency has to be on npm at that version first**. Publishing components against a
tokens version that was never released produces a package that installs and then fails to
resolve.

The workflow checks this and refuses rather than shipping it, but the fix is always the same:
release the dependency, then release the dependent.

Current order, bottom up:

```text
@hipuku/tokens     →  haus-components
@hipuku/colour     →  @hipuku/style-probe
```

## What the workflow will not do for you

- It does not decide the version. Semver is a claim about compatibility and it is yours to
  make.
- It does not push the tag. Nothing here rewrites or pushes history on your behalf.
- It does not publish more than one package per tag. Two releases means two tags.
