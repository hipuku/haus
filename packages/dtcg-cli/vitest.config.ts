import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/*
 * Floors just under the figures it arrived with: 96.72 / 93.75 / 100 / 96.29.
 * bin.ts is left out: its one statement hands process.argv and the two
 * streams to run(), which the tests call directly.
 */
const shared = coverage({ statements: 96, branches: 93, functions: 100, lines: 96 })

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: { ...shared, include: ['src/**/*.ts'], exclude: [...(shared.exclude ?? []), 'src/bin.ts'] },
  },
})
