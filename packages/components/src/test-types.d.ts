/**
 * Matcher types for the test suite.
 *
 * `@testing-library/jest-dom/vitest` extends `expect` at runtime from
 * `vitest.setup.ts`; this import is what tells TypeScript about the matchers it
 * adds, so `toBeInTheDocument` typechecks rather than reading as an unknown
 * property.
 *
 * vitest-axe deliberately has no import here: its custom matcher's types do not
 * fit vitest 2's `Assertion`, so the suite asserts on `.violations` directly
 * instead. That also makes failures print the offending rules.
 */
import '@testing-library/jest-dom/vitest'
