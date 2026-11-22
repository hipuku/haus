import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared.ts'

/*
 * The engine is plain functions over numbers, so every line is reachable from a
 * test and the floor is the ceiling. It arrived at 100% and stays there: a drop
 * means a branch was added without a case for it, which is exactly what a floor
 * is for.
 *
 * `tokens.generated.ts` is excluded by the shared config's generated-file rule,
 * because a generated file's coverage is a property of its generator.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      ...coverage({ statements: 100, branches: 100, functions: 100, lines: 100 }),
      include: ['src/**/*.ts'],
    },
  },
})
