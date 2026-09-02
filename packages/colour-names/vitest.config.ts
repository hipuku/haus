import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared'

/*
 * No thresholds, for the same reason as tokens and a different shape of it: this
 * package is largely a data table of 18,289 colour names, so 100% coverage is a
 * statement about the table being loaded rather than about the code being tested.
 */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 0, branches: 0, functions: 0, lines: 0 }),
  },
})
