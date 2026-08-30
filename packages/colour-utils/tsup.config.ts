import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // chroma-js stays external, because it is a runtime dependency rather than a bundled one.
  // colornames.json is imported by namedColour.ts and gets inlined.
})
