import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // chroma-js stays external — it is a runtime dependency, not bundled.
  // colornames.json is imported by namedColour.ts and gets inlined.
})
