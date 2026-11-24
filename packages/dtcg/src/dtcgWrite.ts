import { isRecord, Losses } from './document.js'
import { indexTokens, resolveValue, untypedDetail, valueIn, type Index } from './resolve.js'
import {
  COMPOSITE_TYPES,
  joinPath,
  type OutputFile,
  type Token,
  type TokenSet,
  type TokenValue,
  type WriteResult,
} from './types.js'
import { parseCssColour, parseDimensionOrZero, parseDuration } from './values.js'

/* ─────────────────────────────────────────────────────────────────────────────
   Writes DTCG 2025.10. One mode is a plain token file. Several modes are a
   resolver document: every token's default value in one set, and a modifier
   whose contexts carry only the tokens that differ in that mode, all inline so
   the output is one file that pastes back in.
   ────────────────────────────────────────────────────────────────────────── */

/** Put a value at a path in a nested object, reporting a path already used by a token or a group. */
export function setAtPath(
  root: Record<string, unknown>,
  path: readonly string[],
  leaf: Record<string, unknown>,
  losses: Losses,
): boolean {
  let node = root
  for (const [i, key] of path.slice(0, -1).entries()) {
    const next = own(node, key)
    // A leaf is `$value` in DTCG and `value` with a string `type` in Tokens
    // Studio's own shape; this writer serves both, and recognising only the
    // first let a group be written inside a token. The type must be a string,
    // or a group holding tokens named `value` and `type` would look like a
    // leaf and its siblings would be turned away.
    if (
      isRecord(next) &&
      ('$value' in next || ('value' in next && typeof (next as { type?: unknown }).type === 'string'))
    ) {
      losses.add(
        'renamed',
        path,
        `"${path.slice(0, i + 1).join('.')}" is a token, so it cannot also be a group; this token was not written.`,
      )
      return false
    }
    if (!isRecord(next)) define(node, key, {})
    node = own(node, key) as Record<string, unknown>
  }
  const last = path[path.length - 1]
  if (isRecord(own(node, last))) {
    losses.add(
      'renamed',
      path,
      `"${joinPath(path)}" is a group, so it cannot also be a token; this token was not written.`,
    )
    return false
  }
  define(node, last, leaf)
  return true
}

/*
 * A token path comes from the input, so a segment can be `__proto__`. Read and
 * written as own properties, it stays data: `node.__proto__ = {}` would replace
 * the object's prototype, and a deeper write through it reached
 * Object.prototype itself. JSON.stringify writes an own `__proto__` key like
 * any other.
 */
const own = (node: Record<string, unknown>, key: string): unknown => (Object.hasOwn(node, key) ? node[key] : undefined)

const define = (node: Record<string, unknown>, key: string, value: unknown) =>
  Object.defineProperty(node, key, { value, enumerable: true, writable: true, configurable: true })

/**
 * Which of these paths a writer actually inserts, in the order it writes them.
 *
 * `setAtPath` turns away a token whose path is a group already, a token under a
 * token, and a second token at a path already taken, and which of a colliding
 * pair survives depends on the order. Working that out up front is what lets a
 * writer keep an alias only to a token the output will really hold: excluding
 * every path involved in a collision was too blunt, because the first of the
 * pair is written and is a perfectly good target.
 */
export function insertablePaths(paths: readonly (readonly string[])[]): Set<string> {
  const accepted = new Set<string>()
  const groups = new Set<string>()
  for (const path of paths) {
    const name = joinPath(path)
    const ancestors = path.slice(0, -1).map((_, i) => joinPath(path.slice(0, i + 1)))
    if (ancestors.some(a => accepted.has(a))) continue
    if (accepted.has(name) || groups.has(name)) continue
    accepted.add(name)
    for (const ancestor of ancestors) groups.add(ancestor)
  }
  return accepted
}

/**
 * A model value as a 2025.10 `$value`, or undefined when 2025.10 has no way to
 * say it. Raw text gets one more attempt at parsing for the token's type,
 * because a Tailwind `16px` arrives raw only when its namespace was unknown.
 */
export function toDtcgValue(token: Token, value: TokenValue, mode: string, losses: Losses): unknown {
  if (value.kind === 'reference') return `{${joinPath(value.ref)}}`
  if (value.kind === 'literal') {
    // 2025.10 dimensions are px or rem and nothing else. A reader that was
    // lenient about `2em` or `50%` hands over a dimension object this format
    // cannot hold, and writing it made a file that reads back as invalid.
    const literal = value.value
    if (
      token.type === 'dimension' &&
      isRecord(literal) &&
      typeof literal.unit === 'string' &&
      literal.unit !== 'px' &&
      literal.unit !== 'rem'
    ) {
      losses.add(
        'unrepresentable-value',
        token.path,
        `2025.10 dimensions are px or rem, and this one is in ${literal.unit}.`,
        mode,
      )
      return undefined
    }
    return literal
  }

  const text = value.text
  const parsed =
    token.type === 'color'
      ? parseCssColour(text)
      : token.type === 'dimension'
        ? parseDimensionOrZero(text)
        : token.type === 'duration'
          ? parseDuration(text)
          : null
  if (parsed) return parsed

  if (token.type && COMPOSITE_TYPES.includes(token.type)) {
    losses.add(
      'unrepresentable-value',
      token.path,
      `"${text}" is CSS shorthand; 2025.10 needs the ${token.type} as an object.`,
      mode,
    )
  } else {
    losses.add('unrepresentable-value', token.path, `"${text}" has no 2025.10 ${token.type ?? 'value'} form.`, mode)
  }
  return undefined
}

function tokenLeaf(token: Token, dtcgValue: unknown): Record<string, unknown> {
  const leaf: Record<string, unknown> = {}
  if (token.type) leaf.$type = token.type
  leaf.$value = dtcgValue
  if (token.description) leaf.$description = token.description
  if (token.deprecated !== undefined) leaf.$deprecated = token.deprecated
  if (token.extensions) leaf.$extensions = token.extensions
  return leaf
}

/** Reference targets that will not be written are replaced by their resolved value. */
function writable(
  token: Token,
  value: TokenValue,
  mode: string,
  set: TokenSet,
  index: Index,
  written: ReadonlySet<string>,
  losses: Losses,
): TokenValue | undefined {
  if (value.kind !== 'reference' || written.has(joinPath(value.ref))) return value
  const resolution = resolveValue(value, mode, set, index)
  if (!resolution.value) {
    losses.add(
      'unrepresentable-value',
      token.path,
      `{${joinPath(value.ref)}} does not resolve (${resolution.problem}).`,
      mode,
    )
    return undefined
  }
  losses.add(
    'resolved-alias',
    token.path,
    `{${joinPath(value.ref)}} is not in the output, so its value was written instead.`,
    mode,
  )
  return resolution.value
}

export function writeDtcg(set: TokenSet): WriteResult {
  const losses = new Losses()
  const index = indexTokens(set)
  const [defaultMode, ...otherModes] = set.modes

  const insertable = insertablePaths(set.tokens.map(token => token.path))

  /** The `$value` this token would be written with in this mode, or undefined when it cannot be. */
  const emit = (
    token: Token,
    value: TokenValue,
    mode: string,
    targets: ReadonlySet<string>,
    losses: Losses,
  ): unknown => {
    const target = writable(token, value, mode, set, index, targets, losses)
    return target === undefined ? undefined : toDtcgValue(token, target, mode, losses)
  }

  /*
   * Which tokens the file will really hold, which is what an alias may point
   * at. A token needs a type, a path the writer can insert, and a default value
   * this format can say; and a token whose value is an alias to one that falls
   * out falls out with it, so the set is narrowed until it stops shrinking.
   */
  let written = new Set(
    set.tokens.filter(token => token.type && insertable.has(joinPath(token.path))).map(token => joinPath(token.path)),
  )
  for (;;) {
    const next = new Set<string>()
    for (const token of set.tokens) {
      const key = joinPath(token.path)
      if (!written.has(key)) continue
      const value = valueIn(token, defaultMode, set.modes)
      if (value && emit(token, value, defaultMode, written, new Losses()) !== undefined) next.add(key)
    }
    if (next.size === written.size) break
    written = next
  }

  const build = (mode: string, onlyOverrides: boolean): Record<string, unknown> => {
    const root: Record<string, unknown> = {}
    for (const token of set.tokens) {
      if (!token.type) {
        if (mode === defaultMode) {
          losses.add('dropped-type', token.path, untypedDetail(token, defaultMode, 'DTCG 2025.10 type'))
        }
        continue
      }
      const own = token.values[mode]
      if (onlyOverrides && !own) continue
      const value = onlyOverrides ? own : valueIn(token, mode, set.modes)
      if (!value) continue
      const dtcgValue = emit(token, value, mode, written, losses)
      if (dtcgValue === undefined) continue
      // An override is compared as it would be written, not as it was read: a
      // mode whose value is an alias the output cannot keep becomes that
      // alias's value here, and comparing the two aliases instead said the
      // mode did not differ when the written files would have.
      if (onlyOverrides) {
        const base = token.values[defaultMode]
        const quiet = new Losses()
        const baseValue = base ? emit(token, base, defaultMode, written, quiet) : undefined
        if (JSON.stringify(dtcgValue) === JSON.stringify(baseValue)) continue
      }
      setAtPath(root, token.path, tokenLeaf(token, dtcgValue), losses)
    }
    return root
  }

  const files: OutputFile[] = []
  if (otherModes.length === 0) {
    files.push({ name: 'tokens.json', text: JSON.stringify(build(defaultMode, false), null, 2) })
  } else {
    // Mode names come from the input too, so they are defined as own
    // properties: `contexts['__proto__'] = …` would set the prototype and the
    // mode would vanish from the JSON with no loss reported.
    const contexts: Record<string, unknown[]> = {}
    define(contexts, defaultMode, [])
    for (const mode of otherModes) define(contexts, mode, [build(mode, true)])
    const resolver = {
      version: '2025.10',
      sets: { base: { sources: [build(defaultMode, false)] } },
      modifiers: { mode: { contexts, default: defaultMode } },
      resolutionOrder: [{ $ref: '#/sets/base' }, { $ref: '#/modifiers/mode' }],
    }
    files.push({ name: 'tokens.resolver.json', text: JSON.stringify(resolver, null, 2) })
  }
  return { files, losses: losses.entries }
}
