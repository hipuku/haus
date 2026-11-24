import { Losses, mergeTokens, type InputDocument } from './document.js'
import { indexTokens, resolveValue, sameValue, valueIn, type Index } from './resolve.js'
import {
  joinPath,
  type Literal,
  type Token,
  type TokenSet,
  type TokenType,
  type TokenValue,
  type WriteOptions,
  type WriteResult,
} from './types.js'
import {
  colourToCss,
  cubicBezierToCss,
  dimensionToCss,
  durationToCss,
  fontFamilyToCss,
  isColorValue,
  isCubicBezier,
  isDimensionValue,
  isDurationValue,
  parseCssColour,
  parseCubicBezier,
  parseCurlyReference,
  parseDimensionOrZero,
  parseDuration,
  parseFontFamily,
  parseFontWeight,
} from './values.js'

/* ─────────────────────────────────────────────────────────────────────────────
   Tailwind v4 keeps its tokens as custom properties in `@theme` blocks, named by
   namespace: `--color-*`, `--text-*`, `--radius-*`. It has no mode primitive, so
   a dark theme is the same properties redefined under a selector.

   The reader is a scanner, not a CSS parser, for the same reason specifi's
   stylesheet extraction is: it needs declarations and the block each sits in,
   nothing more. It tracks brace depth, strips comments, and reads `@theme`,
   `:root`, and the selectors that mean a mode.
   ────────────────────────────────────────────────────────────────────────── */

/** Namespaces, longest first so `--font-weight-*` is not read as `--font-*`. */
const NAMESPACES: [string, TokenType | null][] = [
  ['inset-shadow', 'shadow'],
  ['drop-shadow', 'shadow'],
  ['font-weight', 'fontWeight'],
  ['perspective', 'dimension'],
  ['breakpoint', 'dimension'],
  ['container', 'dimension'],
  ['tab-size', 'number'],
  ['duration', 'duration'],
  ['tracking', 'dimension'],
  ['leading', 'number'],
  ['spacing', 'dimension'],
  ['animate', null],
  ['aspect', null],
  ['radius', 'dimension'],
  ['shadow', 'shadow'],
  ['color', 'color'],
  ['blur', 'dimension'],
  ['zoom', null],
  ['text', 'dimension'],
  ['font', 'fontFamily'],
  ['ease', 'cubicBezier'],
]

export const CUSTOM_PROPERTY = 'custom property'

/**
 * `--spacing` alone is a token and `--spacing-tight` another, so in a tree
 * `spacing` would be both a token and a group. The bare one is read as
 * `spacing.DEFAULT`, Tailwind v3's name for the same thing, and written back
 * without the segment.
 */
const DEFAULT_SEGMENT = 'DEFAULT'

interface Declaration {
  name: string
  value: string
  mode: string
}

/**
 * Comments blanked to spaces, newlines kept so positions still line up.
 *
 * A scan rather than a lazy regex: `/\*[\s\S]*?\*\//g` retries from every `/*`
 * when one is never closed, which is quadratic, and a pasted stylesheet of
 * `/*` followed by many `a/*` took over half a second at 120KB.
 *
 * The scan tracks strings, because `content: "/*"` opens no comment and a
 * comment marker inside a quoted value was blanking the rest of the file. An
 * unterminated comment runs to the end, which is what CSS says it does.
 */
function stripComments(css: string): string {
  let out = ''
  let quote: string | null = null
  for (let i = 0; i < css.length; i++) {
    const char = css[i]
    if (quote) {
      out += char
      if (char === '\\' && i + 1 < css.length) out += css[++i]
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      out += char
      continue
    }
    if (char === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const comment = end === -1 ? css.slice(i) : css.slice(i, end + 2)
      out += comment.replace(/[^\n]/g, ' ')
      i += comment.length - 1
      continue
    }
    out += char
  }
  return out
}

/**
 * A block that holds no tokens. Its declarations are skipped rather than read
 * into whatever mode encloses it: `@media (min-width: 40rem) { :root { … } }`
 * is a responsive override, and reading it as the default replaced the real
 * default values with it.
 */
const IGNORE = Symbol('not a token block')

/** Classes that mean a mode rather than a component. Anything else is a component. */
const MODE_CLASSES = new Set(['dark', 'light'])

/** The mode a block's prelude selects, IGNORE when the block holds no tokens. */
function modeOf(prelude: string, outer: string | undefined | typeof IGNORE): string | undefined | typeof IGNORE {
  const p = prelude.trim()
  if (outer === IGNORE) return IGNORE
  if (/^@theme\b/.test(p)) return 'default'
  if (p === ':root' || p === 'html') return outer ?? 'default'
  const dataTheme = /^(?::root|html)?\[data-theme=["']?([\w-]+)["']?\]$/.exec(p)
  if (dataTheme) return dataTheme[1]
  // `.dark` is a mode; `.btn` is a component whose custom properties are not
  // tokens. A class qualified by :root or html is a mode whatever it is called,
  // because that is how a theme class is written.
  const cls = /^(:root|html)?\.([\w-]+)$/.exec(p)
  if (cls) return cls[1] !== undefined || MODE_CLASSES.has(cls[2].toLowerCase()) ? cls[2] : IGNORE
  const media = /^@media\s*\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)$/i.exec(p)
  if (media) return media[1].toLowerCase()
  if (p.startsWith('@')) return IGNORE
  return undefined
}

function scan(css: string): { declarations: Declaration[]; skipped: Map<string, number> } {
  const text = stripComments(css)
  const declarations: Declaration[] = []
  // Selectors whose custom properties were not read, and how many each held,
  // so the reader can say so rather than dropping them in silence.
  const skipped = new Map<string, number>()
  const stack: (string | undefined | typeof IGNORE)[] = []
  const preludes: string[] = []
  let buffer = ''
  let quote: string | null = null
  let escaped = false
  let parens = 0

  const flushDeclaration = () => {
    const mode = stack[stack.length - 1]
    // Split at the first colon and trim, rather than matching
    // /^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/: the lazy value followed by \s*$
    // backtracks quadratically on a long run of spaces, over a second at 80KB.
    // A custom property name cannot contain a colon, so the first one ends it.
    const colon = buffer.indexOf(':')
    const name = colon === -1 ? '' : buffer.slice(0, colon).trim()
    const isProperty = /^--[\w-]+$/.test(name) && !name.endsWith('-*')
    if (mode && mode !== IGNORE && isProperty) {
      declarations.push({ name, value: buffer.slice(colon + 1).trim(), mode })
    } else if (mode === IGNORE && isProperty) {
      const where = preludes[preludes.length - 1] ?? '(unknown)'
      skipped.set(where, (skipped.get(where) ?? 0) + 1)
    }
    buffer = ''
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quote) {
      buffer += char
      // A backslash escapes the next character, so `"a\"b"` is one string and
      // not two; the scanner used to leave the string here and read the rest of
      // the value as CSS.
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      buffer += char
      continue
    }
    if (char === '(') parens++
    if (char === ')') parens--
    if (char === '{' && parens === 0) {
      const prelude = buffer.trim()
      stack.push(modeOf(prelude, stack[stack.length - 1]))
      preludes.push(prelude)
      buffer = ''
    } else if (char === '}' && parens === 0) {
      flushDeclaration()
      stack.pop()
      preludes.pop()
    } else if (char === ';' && parens === 0) {
      flushDeclaration()
    } else {
      buffer += char
    }
  }
  return { declarations, skipped }
}

/** `--color-flare-dark` → namespace `color`, path `['color', 'flare-dark']`. */
function nameToPath(name: string): { path: string[]; type: TokenType | null; namespace?: string } {
  const bare = name.slice(2)
  for (const [namespace, type] of NAMESPACES) {
    if (bare === namespace) return { path: [namespace, DEFAULT_SEGMENT], type, namespace }
    if (bare.startsWith(`${namespace}-`)) {
      const rest = bare.slice(namespace.length + 1)
      // `--text-sm--line-height` and its siblings: companions of a size.
      const companion = namespace === 'text' ? /^(.+)--(line-height|letter-spacing|font-weight)$/.exec(rest) : null
      if (companion) {
        const type =
          companion[2] === 'font-weight' ? 'fontWeight' : companion[2] === 'line-height' ? 'number' : 'dimension'
        return { path: [namespace, rest], type, namespace }
      }
      return { path: [namespace, rest], type, namespace }
    }
  }
  return { path: [bare], type: null }
}

function readValue(
  raw: string,
  type: TokenType | null,
  names: Map<string, string[]>,
): { value: TokenValue; type: TokenType | null } {
  const varRef = /^var\(\s*(--[\w-]+)\s*\)$/.exec(raw)
  if (varRef) {
    const target = names.get(varRef[1])
    if (target) return { value: { kind: 'reference', ref: target }, type }
    return { value: { kind: 'raw', text: raw }, type }
  }

  const inferred =
    type ??
    (parseCssColour(raw)
      ? 'color'
      : parseDimensionOrZero(raw) && raw.trim() !== '0'
        ? 'dimension'
        : parseDuration(raw)
          ? 'duration'
          : /^-?\d*\.?\d+$/.test(raw.trim())
            ? 'number'
            : null)
  const literal = (value: Literal): { value: TokenValue; type: TokenType | null } => ({
    value: { kind: 'literal', value },
    type: inferred,
  })

  switch (inferred) {
    case 'color': {
      const colour = parseCssColour(raw)
      if (colour) return literal(colour)
      break
    }
    case 'dimension': {
      const dimension = parseDimensionOrZero(raw)
      if (dimension) return literal(dimension)
      break
    }
    case 'duration': {
      const duration = parseDuration(raw)
      if (duration) return literal(duration)
      break
    }
    case 'cubicBezier': {
      const bezier = parseCubicBezier(raw)
      if (bezier) return literal(bezier)
      break
    }
    case 'fontWeight': {
      const weight = parseFontWeight(raw)
      if (weight !== null) return literal(weight)
      break
    }
    case 'fontFamily':
      return literal(parseFontFamily(raw))
    case 'number':
      if (raw.trim() !== '' && !Number.isNaN(Number(raw))) return literal(Number(raw))
      break
  }
  return { value: { kind: 'raw', text: raw }, type: inferred }
}

export function readTailwind(documents: readonly InputDocument[], losses: Losses): TokenSet {
  const declarations: Declaration[] = []
  for (const document of documents) {
    const { declarations: found, skipped } = scan(document.text)
    declarations.push(...found)
    for (const [selector, count] of skipped) {
      losses.add(
        'dropped-mode',
        selector,
        `${count} custom ${count === 1 ? 'property' : 'properties'} under "${selector}" were not read: it selects a component or a condition, not a mode.`,
      )
    }
  }
  const names = new Map(declarations.map(d => [d.name, nameToPath(d.name).path]))
  const modes = ['default', ...new Set(declarations.map(d => d.mode).filter(m => m !== 'default'))]
  const merged = new Map<string, Token>()
  // Two property names can land on one path: `--spacing` is read as
  // `spacing.DEFAULT` and so is `--spacing-DEFAULT`. The later one wins, as it
  // would in CSS, and the reader says which name it took.
  const from = new Map<string, string>()

  for (const declaration of declarations) {
    const { path, type: namespaceType, namespace } = nameToPath(declaration.name)
    const key = `${joinPath(path)}|${declaration.mode}`
    const earlier = from.get(key)
    if (earlier && earlier !== declaration.name) {
      losses.add(
        'renamed',
        path,
        `${earlier} and ${declaration.name} are both read as "${joinPath(path)}"; ${declaration.name} won.`,
        declaration.mode,
      )
    }
    from.set(key, declaration.name)
    const { value, type } = readValue(declaration.value, namespaceType, names)
    const token: Token = { path, type, values: { [declaration.mode]: value } }
    if (!namespace) token.sourceType = CUSTOM_PROPERTY
    mergeTokens(merged, token)
  }

  return { modes, tokens: [...merged.values()] }
}

export const looksLikeTailwind = (text: string) =>
  /@theme\b/.test(text) || /^\s*(:root|\[data-theme)/m.test(text) || /^\s*--[\w-]+\s*:/m.test(text)

/* ─── Writing ─────────────────────────────────────────────────────────────── */

/** Group names the other formats use for what Tailwind calls a namespace. */
const NAMESPACE_ALIASES: Record<string, string> = {
  color: 'color',
  colors: 'color',
  colour: 'color',
  colours: 'color',
  spacing: 'spacing',
  space: 'spacing',
  size: 'spacing',
  sizing: 'spacing',
  radius: 'radius',
  radii: 'radius',
  borderradius: 'radius',
  'border-radius': 'radius',
  shadow: 'shadow',
  shadows: 'shadow',
  boxshadow: 'shadow',
  elevation: 'shadow',
  ease: 'ease',
  easing: 'ease',
  easings: 'ease',
  font: 'font',
  fonts: 'font',
  fontfamily: 'font',
  fontfamilies: 'font',
  'font-family': 'font',
  'font-weight': 'font-weight',
  fontweight: 'font-weight',
  fontweights: 'font-weight',
  text: 'text',
  'font-size': 'text',
  fontsize: 'text',
  fontsizes: 'text',
  tracking: 'tracking',
  letterspacing: 'tracking',
  'letter-spacing': 'tracking',
  leading: 'leading',
  lineheight: 'leading',
  lineheights: 'leading',
  'line-height': 'leading',
  breakpoint: 'breakpoint',
  breakpoints: 'breakpoint',
  screens: 'breakpoint',
  duration: 'duration',
  durations: 'duration',
  blur: 'blur',
  container: 'container',
  perspective: 'perspective',
  // Every namespace Tailwind itself generates utilities from, so a group named
  // after one lands in @theme rather than becoming a plain custom property in
  // :root. Only the ones with another common name need an entry above.
  ...Object.fromEntries(NAMESPACES.map(([n]) => [n, n])),
}

/** Namespaces Tailwind generates utilities from. Anything else is a plain custom property in `:root`. */
const THEME_NAMESPACES = new Set(NAMESPACES.map(([n]) => n).filter(n => n !== 'duration'))

function sanitise(segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function propertyName(token: Token): { name: string; inTheme: boolean; renamed: boolean } {
  // A plain custom property read from a stylesheet keeps its own name.
  if (token.sourceType === CUSTOM_PROPERTY) {
    const joined = token.path.join('-')
    const cleaned = token.path.map(sanitise).filter(Boolean).join('-')
    return { name: `--${cleaned}`, inTheme: false, renamed: cleaned !== joined }
  }
  const [first, ...rest] = token.path
  const found = NAMESPACE_ALIASES[first.toLowerCase()]
  const expected = NAMESPACES.find(([n]) => n === found)?.[1]
  // A group named like a namespace only counts when its token is that namespace's type:
  // haus's `font.lineHeight.tight` is a number, not a font family.
  // `text` holds a size and its companions, which are three different types,
  // so the namespace is allowed to disagree with the token's type there. A
  // colour is not one of them: `text.primary` is a colour and `--text-primary`
  // is a font size, and Tailwind would have generated a text-size utility from
  // it.
  const textCompanion = found === 'text' && token.type !== 'color'
  const alias = found && (expected === undefined || expected === token.type || textCompanion) ? found : undefined
  const namespace = alias
  const segments = (alias ? rest : token.path).filter((s, i, all) => !(s === DEFAULT_SEGMENT && i === all.length - 1))
  const joined = (alias ? rest : token.path).filter(s => s !== DEFAULT_SEGMENT).join('-')
  const cleaned = segments.map(sanitise).filter(Boolean).join('-')
  const name = `--${namespace ? (cleaned ? `${namespace}-${cleaned}` : namespace) : cleaned}`
  return { name, inTheme: Boolean(namespace && THEME_NAMESPACES.has(namespace)), renamed: cleaned !== joined }
}

function cssValue(
  token: Token,
  value: TokenValue,
  mode: string,
  set: TokenSet,
  index: Index,
  names: Map<string, string>,
  losses: Losses,
): string | undefined {
  if (value.kind === 'raw') {
    // A raw value is text from the input, written straight into a stylesheet. A
    // semicolon, a brace or a newline in it would end the declaration and start
    // something else, so the token is dropped and reported instead.
    if (/[;{}\n\r]/.test(value.text)) {
      losses.add(
        'unrepresentable-value',
        token.path,
        `"${value.text.replace(/\s+/g, ' ').trim()}" is not one CSS value; it was not written.`,
        mode,
      )
      return undefined
    }
    return value.text
  }
  if (value.kind === 'reference') {
    const target = names.get(joinPath(value.ref))
    if (target) return `var(${target})`
    const resolved = resolveValue(value, mode, set, index)
    if (!resolved.value) {
      losses.add(
        'unrepresentable-value',
        token.path,
        `{${joinPath(value.ref)}} does not resolve (${resolved.problem}).`,
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
    return cssValue(token, resolved.value, mode, set, index, names, losses)
  }
  return literalToCss(token, value.value, mode, names, losses)
}

const refText = (v: unknown, names: Map<string, string>): string | undefined => {
  if (typeof v !== 'string') return undefined
  const ref = parseCurlyReference(v)
  if (!ref) return undefined
  const target = names.get(joinPath(ref))
  return target ? `var(${target})` : undefined
}

function part(v: unknown, names: Map<string, string>): string | undefined {
  const ref = refText(v, names)
  if (ref) return ref
  if (isColorValue(v)) return colourToCss(v) ?? undefined
  if (isDimensionValue(v)) return dimensionToCss(v)
  if (isDurationValue(v)) return durationToCss(v)
  if (isCubicBezier(v)) return cubicBezierToCss(v)
  if (typeof v === 'string' && parseCurlyReference(v)) return undefined
  if (typeof v === 'number' || typeof v === 'string') return String(v)
  return undefined
}

function literalToCss(
  token: Token,
  literal: unknown,
  mode: string,
  names: Map<string, string>,
  losses: Losses,
): string | undefined {
  const single = part(literal, names)
  if (single !== undefined && token.type !== 'fontFamily') return single

  switch (token.type) {
    case 'fontFamily':
      if (typeof literal === 'string' || Array.isArray(literal)) return fontFamilyToCss(literal as string[])
      break
    case 'shadow': {
      const layers = Array.isArray(literal) ? literal : [literal]
      const css = layers.map(layer => {
        if (typeof layer !== 'object' || layer === null) return undefined
        const s = layer as Record<string, unknown>
        const bits = [s.offsetX, s.offsetY, s.blur, s.spread].map(b => part(b, names))
        const colour = part(s.color, names)
        if (bits.some(b => b === undefined) || !colour) return undefined
        return `${s.inset === true ? 'inset ' : ''}${bits.join(' ')} ${colour}`
      })
      if (css.every(Boolean)) return css.join(', ')
      break
    }
    case 'border': {
      const b = literal as Record<string, unknown>
      const width = part(b.width, names)
      const style = typeof b.style === 'string' ? b.style : undefined
      const colour = part(b.color, names)
      if (width && style && colour) return `${width} ${style} ${colour}`
      break
    }
    case 'transition': {
      const t = literal as Record<string, unknown>
      const duration = part(t.duration, names)
      const timing = part(t.timingFunction, names)
      const delay = part(t.delay, names)
      if (duration && timing) return [duration, timing, delay].filter(Boolean).join(' ')
      break
    }
  }
  losses.add(
    'unrepresentable-value',
    token.path,
    `The ${token.type ?? 'value'} has no CSS custom property form here.`,
    mode,
  )
  return undefined
}

export function writeTailwind(set: TokenSet, options: WriteOptions): WriteResult {
  const losses = new Losses()
  const index = indexTokens(set)
  const [defaultMode, ...otherModes] = set.modes

  const names = new Map<string, string>()
  const used = new Map<string, string>()
  const placement = new Map<string, boolean>()
  const typographyNames = new Map<string, string>()
  for (const token of set.tokens) {
    const key = joinPath(token.path)
    if (token.type === 'gradient' || token.type === 'strokeStyle') continue
    // A typography token is written as `--text-<name>` and its companions, so
    // it holds that name against the rest: a size token of the same name would
    // otherwise be written over it, each believing the name was its own.
    if (token.type === 'typography') {
      const base = typographyBase(token)
      if (used.has(base)) {
        losses.add('renamed', token.path, `${base} is already ${used.get(base)}; this token was not written.`)
        continue
      }
      used.set(base, key)
      typographyNames.set(key, base)
      continue
    }
    const { name, inTheme, renamed } = propertyName(token)
    if (used.has(name)) {
      losses.add('renamed', token.path, `${name} is already ${used.get(name)}; this token was not written.`)
      continue
    }
    if (renamed) losses.add('renamed', token.path, `Written as ${name}.`)
    used.set(name, key)
    names.set(key, name)
    placement.set(key, inTheme)
  }

  /*
   * Which tokens this stylesheet actually declares, which is what a `var()` may
   * point at. A name is reserved before any value is written, and a value can
   * still turn out to have no CSS form, so pointing at a name alone produced
   * `var(--x)` with nothing declaring `--x`. A mode block may point at a
   * property the default block declares, because the cascade still has it, so
   * the two sets are taken together. Dropping one target can drop a value that
   * needed it, so the set is narrowed until it stops shrinking.
   */
  const targetNames = (targets: ReadonlySet<string>) => new Map([...names].filter(([key]) => targets.has(key)))

  const declaredIn = (mode: string): Set<string> => {
    let targets = new Set(names.keys())
    for (;;) {
      const next = new Set<string>()
      for (const [key, token] of [...names.keys()].map(k => [k, index.get(k)!] as const)) {
        const value = valueIn(token, mode, set.modes)
        if (value && cssValue(token, value, mode, set, index, targetNames(targets), new Losses()) !== undefined) {
          next.add(key)
        }
      }
      if (next.size === targets.size) return targets
      targets = next
    }
  }

  const declared = new Map(set.modes.map(mode => [mode, declaredIn(mode)]))
  const namesFor = (mode: string) => {
    const here = declared.get(mode) ?? new Set<string>()
    const base = declared.get(defaultMode) ?? new Set<string>()
    return targetNames(new Set([...base, ...here]))
  }

  const themeLines: Record<string, string[]> = {}
  const rootLines: Record<string, string[]> = {}
  for (const mode of set.modes) {
    themeLines[mode] = []
    rootLines[mode] = []
  }

  const emit = (mode: string, name: string, css: string, inTheme: boolean) =>
    (inTheme && mode === defaultMode ? themeLines : rootLines)[mode].push(`  ${name}: ${css};`)

  for (const token of set.tokens) {
    const key = joinPath(token.path)

    if (token.type === 'typography') {
      const base = typographyNames.get(key)
      if (base) writeTypography(token, base, set, index, namesFor(defaultMode), emit, losses)
      continue
    }
    if (token.type === 'gradient' || token.type === 'strokeStyle') {
      losses.add('dropped-composite', token.path, `Tailwind has no ${token.type} theme variable.`)
      continue
    }
    const name = names.get(key)
    if (!name) continue

    for (const mode of set.modes) {
      const own = token.values[mode]
      if (mode !== defaultMode && (!own || sameValue(own, token.values[defaultMode]))) continue
      const value = mode === defaultMode ? valueIn(token, mode, set.modes) : own
      if (!value) continue
      const css = cssValue(token, value, mode, set, index, namesFor(mode), losses)
      if (css !== undefined) emit(mode, name, css, placement.get(key) ?? false)
    }
    if (token.description || token.deprecated !== undefined || token.extensions) {
      losses.add(
        'dropped-metadata',
        token.path,
        'CSS custom properties have no description, deprecation or extensions.',
      )
    }
  }

  const blocks: string[] = ['@import "tailwindcss";']
  // `@theme inline` tells Tailwind to use the value as written instead of
  // wrapping it in a var() of its own, which is what a value that is already a
  // var() needs; the reader knew the difference and the writer dropped it.
  const themeInline = themeLines[defaultMode].some(line => line.includes('var('))
  if (themeLines[defaultMode].length) {
    blocks.push(`@theme${themeInline ? ' inline' : ''} {\n${themeLines[defaultMode].join('\n')}\n}`)
  }
  if (rootLines[defaultMode].length) blocks.push(`:root {\n${rootLines[defaultMode].join('\n')}\n}`)

  // One sanitised name per mode, whichever selector it goes into: a data-theme
  // attribute took the mode's name as written, where the class branch cleaned
  // it, so the same set of modes produced two different vocabularies. Two modes
  // that clean to one name would silently become one block.
  const selectorNames = new Map<string, string>()
  const takenNames = new Map<string, string>()
  for (const mode of otherModes) {
    const cleaned = sanitise(mode)
    if (!cleaned) {
      losses.add('dropped-mode', mode, `"${mode}" has nothing a selector can be made of; it was not written.`)
      continue
    }
    const clash = takenNames.get(cleaned)
    if (clash) {
      losses.add('dropped-mode', mode, `"${mode}" and "${clash}" both select ${cleaned}; "${mode}" was not written.`)
      continue
    }
    if (cleaned !== mode) losses.add('renamed', mode, `The mode "${mode}" is selected as "${cleaned}".`, mode)
    takenNames.set(cleaned, mode)
    selectorNames.set(mode, cleaned)
  }

  for (const mode of otherModes) {
    const lines = rootLines[mode]
    const cleaned = selectorNames.get(mode)
    if (!lines.length || !cleaned) continue
    if (options.tailwindModeSelector === 'media') {
      const scheme = cleaned.toLowerCase()
      if (scheme !== 'dark' && scheme !== 'light') {
        losses.add('dropped-mode', mode, `prefers-color-scheme has only light and dark; "${mode}" was not written.`)
        continue
      }
      blocks.push(
        `@media (prefers-color-scheme: ${scheme}) {\n  :root {\n${lines.map(l => `  ${l}`).join('\n')}\n  }\n}`,
      )
    } else {
      const selector = options.tailwindModeSelector === 'class' ? `.${cleaned}` : `[data-theme="${cleaned}"]`
      blocks.push(`${selector} {\n${lines.join('\n')}\n}`)
    }
  }

  return { files: [{ name: 'theme.css', text: `${blocks.join('\n\n')}\n` }], losses: losses.entries }
}

/**
 * Tailwind's type utility is a size with companions: `--text-sm`,
 * `--text-sm--line-height`, `--text-sm--letter-spacing`, `--text-sm--font-weight`.
 * There is no slot for the family, so a typography token splits, and loses it.
 */
export function typographyBase(token: Token): string {
  const [first, ...rest] = token.path
  const segments = NAMESPACE_ALIASES[first.toLowerCase()] ? rest : token.path
  return `--text-${segments.map(sanitise).filter(Boolean).join('-')}`
}

function writeTypography(
  token: Token,
  base: string,
  set: TokenSet,
  index: Index,
  names: Map<string, string>,
  emit: (mode: string, name: string, css: string, inTheme: boolean) => void,
  losses: Losses,
) {
  const written = new Map<string, string>()

  for (const mode of set.modes) {
    const own = token.values[mode]
    if (mode !== set.modes[0] && !own) continue
    const resolved = resolveValue(valueIn(token, mode, set.modes)!, mode, set, index)
    if (
      resolved.value?.kind !== 'literal' ||
      typeof resolved.value.value !== 'object' ||
      resolved.value.value === null
    ) {
      losses.add('unrepresentable-value', token.path, 'The typography value is not an object.', mode)
      continue
    }
    const t = resolved.value.value as Record<string, unknown>
    const fields: [string, unknown][] = [
      ['', t.fontSize],
      ['--line-height', t.lineHeight],
      ['--letter-spacing', t.letterSpacing],
      ['--font-weight', t.fontWeight],
    ]
    for (const [suffix, v] of fields) {
      const css = part(v, names)
      if (css === undefined) continue
      // A mode is an override only where what it writes differs from the
      // default. Comparing the token values instead called two aliases that
      // resolve to the same line a difference, and two different lines that
      // happened to share a value no difference at all.
      const name = `${base}${suffix}`
      if (mode !== set.modes[0] && written.get(name) === css) continue
      if (mode === set.modes[0]) written.set(name, css)
      emit(mode, name, css, true)
    }
    losses.add(
      'split-composite',
      token.path,
      `Written as ${base} and its companions; the font family has no slot and was dropped.`,
      mode,
    )
  }
}
