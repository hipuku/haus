import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { defineConfig } from 'tsup'

// The CSS files and tokens.json are shipped as-is. They are the source form,
// not something to compile. `files: ["dist"]` means only dist is published, so
// they are copied there rather than exported from src.
const ASSETS = [
  'layers.css',
  'primitives.css',
  'brand.css',
  'semantics.css',
  'motion.css',
  'index.css',
  'tokens.json',
]
/**
 * Brands ship as their own directory so a consumer can point at one by name.
 *
 * Read from the directory rather than listed, since haus#53. The list was
 * `['vault.css']` and `brands/drift.css` was added, tested and published without
 * it: `brand.test.ts` reads the directory and passed, and the build read this
 * list and shipped nothing, so 2.3.0 announced a brand the artefact did not
 * contain. A hand-maintained list beside a directory is a second place for the
 * same fact, and this package has now produced that defect four times.
 */
const BRANDS = (await readdir('src/brands')).filter((f) => f.endsWith('.css'))

/**
 * Dual output, ESM and CJS.
 *
 * The package advertised `main` pointing at the ESM entry, so a bundler falling
 * back to `main` in a CJS context got ESM and failed on the import statement -
 * an advertised entry point that does not work in the context it advertises for.
 *
 * The dual-package hazard is the usual objection and does not apply here: these
 * packages hold no module state, no singleton and no instanceof check, so two
 * copies behave identically.
 */
export default defineConfig({
  /* A second entry rather than a re-export from index. The guard is a build-
     and test-time tool and nothing that renders should pull it in, so it is
     reachable as `haus-tokens/guard` and absent from the main bundle. */
  entry: ['src/index.ts', 'src/guard.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  async onSuccess() {
    await mkdir('dist/brands', { recursive: true })
    await Promise.all([
      ...ASSETS.map((f) => copyFile(`src/${f}`, `dist/${f}`)),
      ...BRANDS.map((f) => copyFile(`src/brands/${f}`, `dist/brands/${f}`)),
    ])
  },
})
