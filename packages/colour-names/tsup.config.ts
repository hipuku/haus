import { defineConfig } from 'tsup'

/**
 * Dual output, ESM and CJS.
 *
 * The package advertised `main` pointing at the ESM entry, so a bundler falling
 * back to `main` in a CJS context got ESM and failed on the import statement —
 * an advertised entry point that does not work in the context it advertises for.
 *
 * The dual-package hazard is the usual objection and does not apply here: these
 * packages hold no module state, no singleton and no instanceof check, so two
 * copies behave identically.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // The dataset is inlined into the bundle. It is the package.
})
