import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/* Floors just under the figures haus-colour-utils had: 96.11 / 88.23 / 100 / 97.81. */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 95, branches: 85, functions: 95, lines: 95 }),
  },
})
