import { defineConfig } from 'tsup'

// NOTE: dependencies here are pinned to literal semver ranges, never pnpm's
// `workspace:` protocol. pnpm rewrites that protocol at pack time; npm ships it
// verbatim, producing a package that cannot be installed at all
// (EUNSUPPORTEDPROTOCOL). A literal range is correct under both.

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // keepNames MUST stay off. `extractRawElements` is shipped to the browser by
  // Function.prototype.toString (page.evaluate); esbuild's keepNames wraps
  // functions in a `__name(...)` helper that does not exist in the page
  // context, so the serialised body would throw a ReferenceError on eval.
  // See src/extract.ts for the matching authoring rules.
  keepNames: false,
})
