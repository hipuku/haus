# Publishing this package

The package is build-ready but **not yet published**. The name `@haus/colour-utils`
is a placeholder — the `@haus` scope is not owned, so it cannot be published as-is.

## What is already done

- `tsup` build produces ESM + `.d.ts` into `dist/` (`pnpm run build`).
- `package.json` `main`/`module`/`types`/`exports` point at the built `dist/` output.
- `"sideEffects": false` and `"files": ["dist"]` are set.
- `prepublishOnly` runs the build and the test suite before any publish.
- `chroma-js` stays an external runtime dependency; it is not bundled.

## What remains for you to do

1. **Pick a real package name.** Either an unscoped name that is free on npm
   (check with `npm view <name>`), or a scope you own (`@your-user/colour-utils`).
   Update the `"name"` field in `package.json`.

2. **Decide the version.** It is still `0.1.0`. Bump if you want a different
   starting point (`npm version <patch|minor|major>`).

3. **Authenticate and publish:**

   ```sh
   npm login
   npm publish --access public
   ```

   `--access public` is required for a scoped package (`@your-user/…`); it is
   harmless for an unscoped one. `prepublishOnly` will build and test automatically.

That is the entire remaining checklist — no code changes are needed.
