import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared'

/*
 * The outlier, and the floors say so rather than hiding it: 44.89 / 41.02 / 75 /
 * 47. Wiring coverage up is what found it — this is a published package under
 * half covered, and the untested half is the DOM-walking that is the whole point
 * of it. The floors are set at today's level so it cannot slip further while the
 * gap is closed.
 */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 44, branches: 40, functions: 70, lines: 46 }),
  },
})
