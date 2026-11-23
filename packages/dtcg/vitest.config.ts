import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/* Floors just under the figures it arrived with from tokenise: 77.32 / 66.05 / 95.36 / 80.63. */
const shared = coverage({ statements: 77, branches: 66, functions: 95, lines: 80 })

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // The fixtures include a stylesheet imported with ?raw, which vitest
    // otherwise replaces with an empty module.
    css: true,
    // cli/bin.ts is left out: its one statement hands argv and the two streams
    // to run(), which the CLI tests call directly.
    coverage: {
      ...shared,
      include: ['src/**/*.ts'],
      exclude: [...(shared.exclude ?? []), 'src/cli/bin.ts'],
    },
  },
})
