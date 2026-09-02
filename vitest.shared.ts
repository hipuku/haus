/**
 * Coverage settings, shared by every package.
 *
 * One file rather than five copies, for the reason this repository keeps
 * relearning: five copies of a threshold drift, and the drift is silent until
 * someone compares them.
 *
 * The thresholds are floors rather than targets. They are set just under where
 * each package is today, so the number can only go up — a floor set at the
 * current figure fails on the first honest refactor and teaches people to lower
 * it, which is worse than not having one.
 */
import type { ViteUserConfig } from 'vitest/config'

export const coverage = (thresholds: {
  statements: number
  branches: number
  functions: number
  lines: number
}): NonNullable<NonNullable<ViteUserConfig['test']>['coverage']> => ({
  provider: 'v8',
  reporter: ['text-summary', 'html', 'lcov'],
  // Generated files, type-only declarations and the barrels. A barrel at 100%
  // says nothing, and a generated file's coverage is a property of its
  // generator.
  exclude: [
    '**/dist/**',
    '**/*.config.*',
    '**/index.ts',
    '**/*.d.ts',
    '**/*.test.*',
    '**/*.stories.*',
    'src/tokens/tokens.ts',
    'scripts/**',
  ],
  thresholds,
})
