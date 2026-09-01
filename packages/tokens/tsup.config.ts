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

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
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
