# Releasing

Five packages publish to npm from this repo, unscoped and public:
`haus-tokens`, `haus-components`, `haus-colour-utils`, `haus-style-probe`,
`haus-colour-names`.

Each is released by pushing a tag. `.github/workflows/publish.yml` reads the tag, checks the
manifest agrees with it, builds, tests and publishes. It needs an `NPM_TOKEN`
automation-token secret.

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
