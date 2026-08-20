import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'

// The CSS files and tokens.json are shipped as-is — they are the source form,
// not something to compile. `files: ["dist"]` means only dist is published, so
// they are copied there rather than exported from src.
const ASSETS = ['primitives.css', 'semantics.css', 'motion.css', 'tokens.json']

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  async onSuccess() {
    await Promise.all(ASSETS.map((f) => copyFile(`src/${f}`, `dist/${f}`)))
  },
})
