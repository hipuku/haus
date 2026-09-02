import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared'

/*
 * No thresholds, deliberately. This package's tests read CSS and JSON files and
 * assert on their contents; almost nothing here is executable code, so the
 * figure is 1/1 statements and means nothing at all. A threshold on it would be
 * a number that always passes, which is worse than no number.
 */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 0, branches: 0, functions: 0, lines: 0 }),
  },
})
