import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/* Floors just under what the suite reaches: 85.93 / 75.78 / 99.45 / 88.09. They were 77 / 66 / 95
   / 80, the figures the package arrived with from tokenise, before the review backlog was worked
   through and every finding got a test. */
const shared = coverage({ statements: 85, branches: 75, functions: 99, lines: 87 })

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
