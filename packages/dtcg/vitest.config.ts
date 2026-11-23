import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/* Floors just under the figures it arrived with from tokenise: 77.32 / 66.05 / 95.36 / 80.63. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // The fixtures include a stylesheet imported with ?raw, which vitest
    // otherwise replaces with an empty module.
    css: true,
    coverage: {
      ...coverage({ statements: 77, branches: 66, functions: 95, lines: 80 }),
      include: ['src/**/*.ts'],
    },
  },
})
