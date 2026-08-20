import { defineConfig } from 'tsup'

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
