import { copyFile, mkdir } from 'node:fs/promises'
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
/** Brands ship as their own directory so a consumer can point at one by name. */
const BRANDS = ['ruby.css']

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
  async onSuccess() {
    await mkdir('dist/brands', { recursive: true })
    await Promise.all([
      ...ASSETS.map((f) => copyFile(`src/${f}`, `dist/${f}`)),
      ...BRANDS.map((f) => copyFile(`src/brands/${f}`, `dist/brands/${f}`)),
    ])
  },
})
