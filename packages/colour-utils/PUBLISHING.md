# Publishing this package

The package is build-ready and named **`haus-colour-utils`** (unscoped; confirmed
available on npm). It is **not yet published** — the final `npm publish` is the only
remaining step, and it needs an authenticated npm session.

## What is already done

- `tsup` build produces ESM + `.d.ts` into `dist/` (`pnpm run build`).
- `package.json` `main`/`module`/`types`/`exports` point at the built `dist/` output.
- `"sideEffects": false` and `"files": ["dist"]` are set.
- `prepublishOnly` runs the build and the test suite before any publish.
- `chroma-js` stays an external runtime dependency; it is not bundled.

## What remains for you to do

1. ✅ **Name chosen** — `haus-colour-utils` (unscoped, available on npm).
2. **Version** — currently `0.1.0`. Bump only if you want a different starting point
   (`npm version <patch|minor|major>`).
3. **Authenticate and publish**, from `packages/colour-utils/`:

   ```sh
   npm login          # once, if not already authenticated
   npm publish        # unscoped public package publishes public by default
   ```

   `prepublishOnly` builds and runs the 22 tests before the publish goes out, so a
   broken build cannot be published.

No code changes remain.
