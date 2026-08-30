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

The workflow runs, finds the version on npm and stops there. The tag is the point: it is what
lets `git describe` and the npm page agree on which commit a published version came from.

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

## What the workflow will not do for you

- It does not decide the version. Semver is a claim about compatibility and it is yours to
  make.
- It does not push the tag. Nothing here rewrites or pushes history on your behalf.
- It does not publish more than one package per tag. Two releases means two tags.
