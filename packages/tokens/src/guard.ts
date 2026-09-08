/**
 * The token guard: every custom property a stylesheet reads must be defined
 * somewhere the consumer actually loads.
 *
 * CSS fails silently here, which is what makes this worth shipping. `var(--x)`
 * for an undefined `--x` is invalid at computed-value time: the declaration is
 * dropped and the property inherits. No console warning, no build error,
 * nothing in review: a focus ring is simply absent, and a missing duration
 * looks like a design choice.
 *
 * drift wrote this check for itself and it caught five roles before they
 * reached a screen: `--color-ink-on-primary`, `--elevation-floating`,
 * `--motion-duration-emphasis`, `--radius-marker` and `--haus-focus-ring-error`.
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
 * A reference with a fallback, `var(--x, 0.2s)`, is a real value whether or
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
// own guard test: semantics.css came back with 41 undefined roles.
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
 * that wants to report rather than fail: `read.length` is also worth asserting
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

/* ─── Restatement: a consumer keeping its own copy of a value we ship ────────
 *
 * The second failure this package can see and a consumer cannot. An unresolved
 * var() at least renders wrong; a restated value renders perfectly, and is only
 * wrong from the moment one of the two sides moves.
 *
 * vault carried 141 of them and closed it as `vault#25`, then wrote this rule by
 * hand so it could not come back. drift has 89 and never had the rule: it was
 * written in the repository next door and never ported, which is why it ships
 * from here now (haus#53).
 *
 * TWO KINDS, and the second is the one a hand-written version missed.
 *
 *   identical  the declaration is the same text on both sides.
 *              `--haus-space-inset-md: var(--haus-space-4)` written twice.
 *              77 of drift's.
 *
 *   resolved   the text differs and the value does not. `--haus-z-modal: 400`
 *              against this package's `var(--haus-z-400)`, where `--haus-z-400`
 *              is `400`. 12 of drift's, and vault's hand-written rule compares
 *              declaration text so it would have found none of them.
 *
 * The second kind is worth the resolver: hardcoding the number a token resolves
 * to is how a consumer opts out of a scale while appearing to be on it.
 */

/** One `--x: value` declaration, in source order. */
type Declaration = { name: string; value: string }

/** Comments out, whitespace flattened, so two spellings of one value compare equal. */
function normalise(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function declarations(sources: string[]): Declaration[] {
  const out: Declaration[] = []
  for (const css of sources) {
    for (const m of css.matchAll(/(?:^|[;{])\s*(--[a-zA-Z0-9-]+)\s*:\s*([^;}]+)/gm)) {
      out.push({ name: m[1]!, value: normalise(m[2]!) })
    }
  }
  return out
}

/**
 * Follow `var()` references until nothing is left to follow.
 *
 * Depth-limited rather than cycle-tracked: a token graph is shallow, and a
 * limit is one line where a visited-set is five. Hitting the limit returns the
 * partially resolved value, which compares unequal and so reports nothing,
 * because a guard that guesses is worse than one that misses.
 */
function resolve(value: string, table: Map<string, string>, depth = 0): string {
  if (depth > 10) return value
  const next = value.replace(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g, (whole, name: string) => {
    const found = table.get(name)
    return found === undefined ? whole : found
  })
  return next === value ? value : resolve(next, table, depth + 1)
}

export interface Restatement {
  /** The custom property the consumer declares. */
  name: string
  /** `identical` if the declaration matches ours as text, `resolved` if only the value does. */
  kind: 'identical' | 'resolved'
  /** What the consumer wrote. */
  value: string
  /** What this package already says, as written. */
  upstream: string
}

export interface RestatementInput {
  /** The consumer's own token CSS: the file where it overrides or adds. */
  defines: string[]
  /** This package's layers, as the consumer actually loads them. */
  upstream: string[]
}

/**
 * Which of a consumer's declarations this package already ships.
 *
 * An empty array is the assertion. A consumer may override any role it likes,
 * and several should: what it may not do is override a role to the value the
 * package already gives, because that is not an override, it is a copy, and a
 * copy is correct only until one side moves.
 *
 * Read the package from `node_modules` rather than a fixture. The point is to
 * compare against the value that will actually load.
 *
 * WHICH FILES TO PASS AS `upstream`, because it changes the question asked.
 *
 * Include `brand.css` and the answer is *does this consumer restate anything we
 * ship, including our brand's choices*. Leave it out and the answer is *does it
 * restate anything structural*, with its own colour choices treated as its
 * business.
 *
 * Measured against drift, whose colour overrides are a brand written as role
 * overrides: **143 with `brand.css`, 89 without.** The 54 in the gap are exactly
 * its brand. So a consumer that has a brand file, or intends one, leaves
 * `brand.css` out and gets only the copies; a consumer with no brand of its own
 * puts it in and is told that its colour overrides agree with ours, which is a
 * different and also useful thing to know.
 *
 * @example
 * ```ts
 * import { findRestatedTokens } from 'haus-tokens/guard'
 *
 * it('restates no value haus already ships', () => {
 *   const copies = findRestatedTokens({
 *     defines:  [read('src/tokens/semantics.css')],
 *     upstream: HAUS_FILES.map(read),
 *   })
 *   expect(copies.map((c) => `${c.name} (${c.kind})`)).toEqual([])
 * })
 * ```
 */
export function findRestatedTokens(input: RestatementInput): Restatement[] {
  const table = new Map<string, string>()
  for (const { name, value } of declarations(input.upstream)) {
    // First declaration wins, matching the cascade order the consumer loads in.
    if (!table.has(name)) table.set(name, value)
  }

  const seen = new Set<string>()
  const found: Restatement[] = []
  for (const { name, value } of declarations(input.defines)) {
    const upstream = table.get(name)
    if (upstream === undefined || seen.has(name)) continue

    let kind: Restatement['kind'] | undefined
    if (value === upstream) kind = 'identical'
    else if (resolve(value, table) === resolve(upstream, table)) kind = 'resolved'

    if (kind) {
      seen.add(name)
      found.push({ name, kind, value, upstream })
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name))
}
