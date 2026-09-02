import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared'

/* Floors just under today's figures: 96.11 / 88.23 / 100 / 97.81. */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 95, branches: 85, functions: 95, lines: 95 }),
  },
})
