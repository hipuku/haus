# Releasing this package

`haus-colour-utils` is **published on npm** (unscoped, public):
https://www.npmjs.com/package/haus-colour-utils

## Cutting a new release

From `packages/colour-utils/`:

1. Bump the version (npm will not overwrite a version that is already published):

   ```sh
   npm version patch    # or: minor / major
   ```

2. Publish (an authenticated npm session is required):

   ```sh
   npm publish
   ```

   `prepublishOnly` runs the build and the full test suite first, so a broken
   build cannot be published.

## Build setup (already in place)

- `tsup` produces ESM + `.d.ts` into `dist/`.
- `package.json` `main` / `module` / `types` / `exports` point at the built `dist/`.
- `"sideEffects": false` and `"files": ["dist"]` are set.
- `chroma-js` stays an external runtime dependency; it is not bundled.

## Automated publish (optional)

`.github/workflows/publish.yml` publishes on a `colour-utils-v*` tag once an
`NPM_TOKEN` automation-token secret is added to the repo. Until then, releases are
the manual `npm version` + `npm publish` above.
