/**
 * The token guard: every custom property a stylesheet reads must be defined
 * somewhere the consumer actually loads.
 *
 * CSS fails silently here, which is what makes this worth shipping. `var(--x)`
 * for an undefined `--x` is invalid at computed-value time: the declaration is
 * dropped and the property inherits. No console warning, no build error,
 * nothing in review — a focus ring is simply absent, and a missing duration
 * looks like a design choice.
 *
 * drift wrote this check for itself and it caught five roles before they
 * reached a screen: `--color-ink-on-aronia`, `--elevation-floating`,
 * `--motion-duration-emphasis`, `--radius-marker` and `--shadow-focus-error`.
 * The contract is defined in this package, so the check belongs here rather
 * than being rewritten by every consumer (haus#19). Shipping it is also the
 * point: a design system that can say *you have not loaded what my components
 * read* is a different thing from one that hopes you did.
 *
 * **Pure, and it does no file reading.** It takes CSS as strings, so it runs in
 * a Vitest suite, a Node script, a build step or a browser without this package
 * growing a dependency on `node:fs`. The consumer knows which files it loads;
 * this only knows what the contract is.
 *
 * @example
 * ```ts
 * import { readFileSync } from 'node:fs'
 * import { findUndefinedTokens } from 'haus-tokens/guard'
 *
 * const read = (p: string) => readFileSync(p, 'utf8')
 *
 * it('reads no role this app does not load', () => {
 *   const { missing } = findUndefinedTokens({
 *     reads:   [read('node_modules/haus-components/dist/styles.css')],
 *     defines: [
 *       read('node_modules/haus-tokens/dist/primitives.css'),
 *       read('node_modules/haus-tokens/dist/semantics.css'),
 *       read('node_modules/haus-tokens/dist/motion.css'),
 *       read('src/tokens/overrides.css'),
 *     ],
 *   })
 *   expect(missing).toEqual([])
 * })
 * ```
 */

/**
 * `var(--x)` with no fallback.
 *
 * A reference with a fallback — `var(--x, 0.2s)` — is a real value whether or
 * not the property is set, so it cannot fail at computed-value time and is
 * excluded. It is still usually a sign the name is wrong: a fallback that never
 * loses is a hardcoded value wearing a token's clothes. `findFallbackTokens`
 * below is for looking at those deliberately, rather than failing a build on
 * something that works.
 */
const READ_NO_FALLBACK = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g
const READ_WITH_FALLBACK = /var\(\s*(--[a-zA-Z0-9-]+)\s*,/g
// `m` is load-bearing: without it `^` only matches the start of the whole
// string, so every declaration on its own indented line after a newline is
// missed and only the first in each block is seen. Caught by this package's
// own guard test — semantics.css came back with 41 undefined roles.
const DECLARATION = /(?:^|[;{])\s*(--[a-zA-Z0-9-]+)\s*:/gm

export interface TokenGuardInput {
  /** The CSS doing the reading: the component stylesheet, your own modules. */
  reads: string[]
  /** The CSS doing the defining: the token layers you load, plus your own. */
  defines: string[]
  /**
   * Names defined outside CSS. A component that sets `style={{ '--x': v }}`
   * defines the property on the element, and no stylesheet will show it.
   */
  alsoDefined?: string[]
}

export interface TokenGuardResult {
  /** Read with no fallback and defined nowhere. Sorted, so a diff is stable. */
  missing: string[]
  /** Every property read without a fallback. */
  read: string[]
  /** Every property declared across `defines` and `alsoDefined`. */
  defined: string[]
}

function collect(sources: string[], pattern: RegExp): Set<string> {
  const found = new Set<string>()
  for (const css of sources) {
    // A fresh lastIndex per source: a /g regex is stateful, and reusing one
    // across inputs silently skips the start of every source after the first.
    pattern.lastIndex = 0
    for (const m of css.matchAll(pattern)) found.add(m[1]!)
  }
  return found
}

/**
 * Which properties are read but never defined.
 *
 * An empty `missing` is the assertion. The other two fields are for a consumer
 * that wants to report rather than fail — `read.length` is also worth asserting
 * as a floor, because a wrong path makes every check pass by finding nothing.
 */
export function findUndefinedTokens(input: TokenGuardInput): TokenGuardResult {
  const read = collect(input.reads, READ_NO_FALLBACK)
  const defined = collect(input.defines, DECLARATION)
  for (const name of input.alsoDefined ?? []) defined.add(name)

  return {
    missing: [...read].filter((name) => !defined.has(name)).sort(),
    read: [...read].sort(),
    defined: [...defined].sort(),
  }
}

/**
 * Which properties are only ever read with a fallback.
 *
 * Not a failure, and deliberately a separate function so it cannot be mistaken
 * for one. A fallback that never loses is a hardcoded value wearing a token's
 * clothes, and the list is worth reading occasionally rather than failing a
 * build over.
 */
export function findFallbackTokens(input: Pick<TokenGuardInput, 'reads' | 'defines'>): string[] {
  const withFallback = collect(input.reads, READ_WITH_FALLBACK)
  const defined = collect(input.defines, DECLARATION)
  return [...withFallback].filter((name) => !defined.has(name)).sort()
}
