import { defineConfig } from 'vitest/config'
import { coverage } from '../../vitest.shared'

/*
 * This package read 44.89 / 41.02 / 75 / 47 when coverage was first wired up,
 * and the note here recorded the gap as the DOM-walking half being untested.
 * That was wrong, and backwards.
 *
 * `extract.test.ts` rebuilds `extractRawElements` with `new Function` to prove
 * it survives the trip to the browser context, and called only that copy. v8
 * charges the execution to the anonymous function rather than to the file it
 * came from, so the walker was being exercised and reported as dead. Running
 * every behavioural case against both the imported and the rehydrated copy
 * moved extract.ts to 90% on its own, with no new assertion about it.
 *
 * The real gap was `normalise.ts`, the pure Node half: `splitTopLevel`,
 * `parseBlur` and `parseDurations` are reachable only through
 * `normaliseElement`, and its one fixture left every one of their inputs
 * undefined. Those are the fields drift reads to compare a page's transitions
 * against the motion tokens.
 */

export default defineConfig({
  test: {
    coverage: coverage({ statements: 94, branches: 82, functions: 100, lines: 96 }),
  },
})
