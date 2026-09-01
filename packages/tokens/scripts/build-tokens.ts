/**
 * Generates haus's primitive layer from `src/tokens.json`, and the brand map's
 * TypeScript from `src/brand.css`.
 *
 *   npm run tokens         regenerate every derived file under src/
 *   npm run tokens:check   fail if either is stale (CI gate)
 *
 * Why: the primitives were stated three times, as DTCG JSON, as CSS custom
 * properties and as typed JS constants, and kept in step by hand. A test used
 * to compare them, which caught drift after the fact; generating two of the
 * three makes that drift impossible instead.
 *
 * Scope is deliberately the *primitive* layer only. `semantics.css` is authored,
 * not generated: 44 of its custom properties are typography roles that
 * `tokens.json` does not model, along with `--shadow-focus`, `color-scheme`, and
 * the relative-colour-syntax alpha tokens. Generating it would mean inventing a
 * source for all of that first. Semantic drift is caught by loom's audit
 * instead: generation prevents primitive drift, and the audit detects the rest.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const tokens = JSON.parse(readFileSync(join(srcDir, 'tokens.json'), 'utf8')) as DtcgRoot

// ─── Types ───────────────────────────────────────────────────────────────────

interface DtcgToken {
  $value: string | number | string[] | number[]
  $type?: string
  $description?: string
}
type DtcgGroup = Record<string, DtcgToken | Record<string, unknown> | string | undefined>
type DtcgRoot = Record<string, DtcgGroup>

const isToken = (node: unknown): node is DtcgToken =>
  typeof node === 'object' && node !== null && '$value' in node

/** Entries of a DTCG group, skipping `$`-prefixed metadata. */
function entries(group: DtcgGroup): Array<[string, DtcgToken]> {
  return Object.entries(group)
    .filter(([key]) => !key.startsWith('$'))
    .filter((pair): pair is [string, DtcgToken] => isToken(pair[1]))
}

// ─── The human layer ─────────────────────────────────────────────────────────
// Section headings and colour-family framing are editorial: they say *why* a
// scale exists, which no value in the JSON can express. They live here so the
// generated file still reads like the hand-written one it replaces.

const BANNER = `/* ─── haus / primitives ──────────────────────────────────────────────────────
   Raw values only. No component or semantic meaning.
   Nothing outside this file should define raw values.
   Components must never reference these directly. Use semantics.css.

   GENERATED FROM src/tokens.json. Do not edit.
   Regenerate with \`npm run tokens\`; \`npm run tokens:check\` fails CI if stale.
   ─────────────────────────────────────────────────────────────────────────── */`

const FAMILIES: Array<{ key: string; heading: string; note?: string }> = [
  { key: 'aronia', heading: 'Aronia (Dusty Purple) ── H=300°' },
  {
    key: 'damson',
    heading: 'Damson (Cool Neutral) ── H=290°, very low chroma',
    note: 'Same hue family as Aronia, so the pairing is monochromatic and highly cohesive.',
  },
  { key: 'elderberry', heading: 'Elderberry (Indigo) ── H=265°, distinct from Aronia H=300°' },
  { key: 'greengage', heading: 'Greengage (Green) ── H=148°' },
  { key: 'mango', heading: 'Mango (Golden) ── H=65°' },
  { key: 'cherry', heading: 'Cherry (Red) ── H=27°' },
]

/** Scales, in emission order: JSON path → CSS custom-property prefix. */
const SCALES: Array<{
  heading: string
  note?: string
  prefix: string
  path: string[]
  /** Leaves that belong to another layer and must not be emitted here. */
  omit?: string[]
}> = [
  { heading: 'Type scale', prefix: '--font', path: ['font', 'family'] },
  { heading: '', prefix: '--text', path: ['font', 'size'] },
  { heading: '', prefix: '--weight', path: ['font', 'weight'] },
  { heading: '', prefix: '--leading', path: ['font', 'lineHeight'] },
  { heading: '', prefix: '--tracking', path: ['font', 'tracking'] },
  { heading: 'Spacing scale (4px base)', prefix: '--space', path: ['spacing'] },
  { heading: 'Radius', prefix: '--radius', path: ['radius'] },
  {
    heading: 'Shadows, tinted with damson H=290°',
    note: '--haus-shadow-focus is in semantics.css, because it references semantic colour tokens.',
    prefix: '--shadow',
    path: ['shadow'],
    // shadow.focus resolves through semantic colour tokens, so it is declared
    // in semantics.css. Emitting it here would put a semantic reference in the
    // primitive layer, which is the one rule this file exists to hold.
    omit: ['focus'],
  },
  { heading: 'Z-index', prefix: '--z', path: ['zIndex'] },
  {
    heading: 'Control heights',
    note: 'A scale of its own: 36px and 44px are not steps on the 4px spacing ladder.',
    prefix: '--control-height',
    path: ['controlHeight'],
  },
  { heading: 'Border width', prefix: '--border-width', path: ['borderWidth'] },
  { heading: 'Opacity', prefix: '--opacity', path: ['opacity'] },
  { heading: 'Icon sizes (Font Awesome, paired with the type scale)', prefix: '--icon', path: ['iconSize'] },
]

/** Groups that are JS-only: custom properties cannot be used in @media conditions. */
const CSS_EXCLUDED = new Set(['breakpoint'])

function group(path: string[]): DtcgGroup {
  return path.reduce<Record<string, unknown>>(
    (node, key) => node[key] as Record<string, unknown>,
    tokens as unknown as Record<string, unknown>,
  ) as DtcgGroup
}

/**
 * Every custom property haus defines carries `--haus-`, at every layer,
 * primitives included. Ruling A3 and `docs/decisions/0003`.
 *
 * The point is that a consumer can adopt haus without auditing their own
 * namespace first: unprefixed, `--space-4` and `--text-14` sat in the global
 * namespace where anyone running Tailwind collides with them.
 *
 * `--shadow` + `sm` → `--haus-shadow-sm`; `--font` + `sans` → `--haus-font-sans`.
 */
const NAMESPACE = '--haus-'
const propName = (prefix: string, leaf: string) =>
  `${prefix.replace(/^--/, NAMESPACE)}-${leaf}`

/** Pads to `width` so generated columns line up like a hand-written file. */
const pad = (s: string, width: number) => s.padEnd(width)

/**
 * A $value that is an array is one of two things, and they render nothing alike:
 * a cubicBezier's four numbers, or a fontFamily's stack. Treating the first as
 * the second produced `'0', 0, 0.2, 1` for every easing.
 */
function cssValue(token: DtcgToken): string {
  const value = token.$value
  if (Array.isArray(value)) {
    if (value.every((n) => typeof n === 'number')) {
      return `cubic-bezier(${(value as number[]).map((n) => n.toFixed(2)).join(', ')})`
    }
    const [face, ...fallbacks] = value.map(String)
    return [`'${face}'`, ...fallbacks].join(', ')
  }
  return String(value)
}

/** One declaration line, padded so values align within its block, with the
 *  token's description appended as a trailing comment when it has one. */
function declarations(pairs: Array<[string, DtcgToken]>, prefix: string): string[] {
  const width = Math.max(...pairs.map(([leaf]) => propName(prefix, leaf).length)) + 2
  return pairs.map(([leaf, token]) => {
    const decl = `    ${pad(`${propName(prefix, leaf)}:`, width)} ${cssValue(token)};`
    return token.$description ? `${decl}   /* ${token.$description} */` : decl
  })
}

const heading = (text: string) => `    /* ── ${text} ${'─'.repeat(Math.max(3, 70 - text.length))} */`

// ─── primitives.css ──────────────────────────────────────────────────────────

function buildPrimitivesCss(): string {
  const lines: string[] = [BANNER, '', '@layer haus.primitives {', '', '  :root {', '']

  for (const family of FAMILIES) {
    lines.push(heading(family.heading))
    if (family.note) lines.push(`    /* ${family.note} */`)
    lines.push(...declarations(entries(group(['color', family.key])), `--${family.key}`))
    lines.push('')
  }

  for (const scale of SCALES) {
    if (scale.heading) lines.push(heading(scale.heading))
    if (scale.note) lines.push(`    /* ${scale.note} */`)
    const pairs = entries(group(scale.path)).filter(([leaf]) => !scale.omit?.includes(leaf))
    lines.push(...declarations(pairs, scale.prefix))
    lines.push('')
  }

  lines.push('  }', '}', '')
  return lines.join('\n')
}

// ─── tokens.json's semantic block ────────────────────────────────────────────

/**
 * `semantic.color` in tokens.json restated brand.css by hand: 55 entries, the
 * same role-to-primitive choices, kept in step by nobody. docs/tokens.md
 * documents tokens.json as the Style Dictionary handoff path, so a consumer
 * reads it — which makes an unverified snapshot worse than none.
 *
 * Derived from brand.css now, which is where those choices live since the split.
 * Descriptions are carried across by key so the prose survives regeneration.
 */
function buildSemanticColor(): Record<string, DtcgToken> {
  const css = readFileSync(join(srcDir, 'brand.css'), 'utf8')
  const existing = (tokens.semantic?.color ?? {}) as Record<string, DtcgToken>
  const out: Record<string, DtcgToken> = {}

  for (const [, name, value] of css.matchAll(
    /^\s*(--haus-brand-[a-z0-9-]+)\s*:\s*([^;]+);/gm,
  )) {
    const key = name.replace('--haus-brand-', '')
    // A plain alias becomes a DTCG reference; anything computed (the relative
    // colour entries) is carried through as its literal, because DTCG has no
    // way to express `oklch(from …)` and inventing one here would be a fourth
    // dialect nobody reads.
    const alias = /^var\(\s*--haus-([a-z]+)-(\d+)\s*\)$/.exec(value.trim())
    const $value = alias ? `{color.${alias[1]}.${alias[2]}}` : value.trim()
    const description = existing[key]?.$description
    out[key] = description ? { $value, $description: description } : { $value }
  }
  return out
}

// ─── motion.css ──────────────────────────────────────────────────────────────

/**
 * The durations, easings and composite pairs, from the same tokens.json entries
 * the JS export already read.
 *
 * It was typed by hand beside them, so the two forms of the same six pairs were
 * kept in step by nobody. Generating it is the same argument as the primitives:
 * a test comparing them catches drift afterwards, generating one of the two
 * makes drift impossible.
 */
function buildMotionCss(): string {
  const lines: string[] = [
    BANNER,
    '',
    '@layer haus.motion {',
    '',
    '  :root {',
    '',
  ]

  lines.push(heading('Durations'))
  lines.push(...declarations(entries(group(['duration'])), '--duration'))
  lines.push('')

  lines.push(heading('Easing curves'))
  lines.push(...declarations(entries(group(['easing'])), '--ease'))
  lines.push('')

  lines.push(heading('Composite motion tokens (duration + easing pairs)'))
  // A composite $value is an alias pair like "{duration.fast} {easing.move}";
  // aliasToVar turns each half into the var() the CSS wants.
  const composites = entries(group(['motion'])).map(([leaf, token]) => {
    const value = String(token.$value)
      .split(/\s+/)
      .map((part) => aliasToVar(part))
      .join(' ')
    return [leaf, { ...token, $value: value }] as [string, DtcgToken]
  })
  lines.push(...declarations(composites, '--motion'))
  lines.push('')

  lines.push('  }', '}', '')
  return lines.join('\n')
}

// ─── brand.d.ts: the map a consumer has to satisfy ───────────────────────────

/**
 * `BrandMap` is generated from brand.css rather than typed beside it. The
 * contract asks for a type that fails a consumer's build when a brand omits a
 * role or misnames one, and a hand-maintained copy would be the fourth
 * hand-maintained restatement in this package — which is already a filed issue.
 */
function buildBrandTypes(): string {
  const css = readFileSync(join(srcDir, 'brand.css'), 'utf8')
  const names = [...css.matchAll(/^\s*(--haus-brand-[a-z0-9-]+)\s*:/gm)].map((m) => m[1])
  if (names.length === 0) throw new Error('brand.css declares no --haus-brand- properties')

  return [
    BANNER,
    '',
    '/**',
    ' * Every entry a brand must supply, generated from brand.css.',
    ' *',
    ' * A brand file is CSS, so this cannot check it directly. What it does check is',
    ' * the object form: build a brand in TypeScript, satisfy this type, and a missing',
    ' * or misspelled role is a compile error rather than an unresolved var() that',
    ' * drops a declaration with no warning at all.',
    ' */',
    'export interface BrandMap {',
    ...names.map((n) => `  '${n}': string`),
    '}',
    '',
    '/** The role names themselves, for anyone generating a brand rather than writing one. */',
    `export const brandRoles = [`,
    ...names.map((n) => `  '${n}',`),
    '] as const',
    '',
  ].join('\n')
}

// ─── index.ts ────────────────────────────────────────────────────────────────

/** A JS value: numbers stay numbers, everything else is a quoted string. */
function jsValue(token: DtcgToken): string {
  const value = token.$value
  if (Array.isArray(value)) {
    const [face, ...fallbacks] = value.map(String)
    return JSON.stringify([`'${face}'`, ...fallbacks].join(', ')).replace(/^"|"$/g, '"')
  }
  if (typeof value === 'number') return String(value)
  return JSON.stringify(String(value))
}

/**
 * A DTCG alias turned into the `var()` the CSS reads, rather than the literal
 * value: `{duration.fast}` → `var(--haus-duration-fast)`. The composite motion
 * tokens have to point at the duration and easing properties so that overriding
 * one moves everything built on it — inlining the literals would freeze them.
 */
function aliasToVar(part: string): string {
  const alias = /^\{([^}]+)\}$/.exec(part)
  if (!alias) return part
  const segments = alias[1].split('.')
  // `duration.fast` → `--duration` + `fast`; `easing.move` → `--ease` + `move`.
  const group = segments[0] === 'easing' ? '--ease' : `--${segments[0]}`
  return `var(${propName(group, segments.slice(1).join('-'))})`
}

/** DTCG aliases (`{duration.normal}`) resolved to their literal value. */
function resolveAlias(value: string): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => {
    const node = ref.split('.').reduce<Record<string, unknown>>(
      (acc, key) => acc[key] as Record<string, unknown>,
      tokens as unknown as Record<string, unknown>,
    ) as unknown as DtcgToken
    const resolved = node.$value
    if (Array.isArray(resolved) && resolved.every((n) => typeof n === 'number')) {
      return `cubic-bezier(${(resolved as number[]).map((n) => n.toFixed(2)).join(', ')})`
    }
    return String(resolved)
  })
}

function jsObject(pairs: Array<[string, DtcgToken]>, indent: string, transform = jsValue): string {
  return pairs
    .map(([leaf, token]) => {
      const key = /^[A-Za-z_$][\w$]*$/.test(leaf) ? leaf : JSON.stringify(leaf)
      return `${indent}${key}: ${transform(token)},`
    })
    .join('\n')
}

function buildIndexTs(): string {
  const cubic = (token: DtcgToken): string => {
    const v = token.$value
    if (Array.isArray(v) && v.every((n) => typeof n === 'number')) {
      return JSON.stringify(`cubic-bezier(${(v as number[]).map((n) => n.toFixed(2)).join(', ')})`)
    }
    return JSON.stringify(String(v))
  }
  const composite = (token: DtcgToken) => JSON.stringify(resolveAlias(String(token.$value)))

  const colour = FAMILIES.map(
    (f) => `    ${f.key}: {\n${jsObject(entries(group(['color', f.key])), '      ')}\n    },`,
  ).join('\n')

  return `/* ─── haus / tokens ──────────────────────────────────────────────────────────
   Typed constants for the primitive layer.

   The CSS custom properties are the runtime form; this exists for the places
   they cannot reach: @media conditions, build config, style-in-JS. Semantic
   tokens are deliberately absent: their whole job is to be swappable at
   runtime, which freezing them into a constant would defeat.

   GENERATED FROM src/tokens.json. Do not edit.
   Regenerate with \`npm run tokens\`; \`npm run tokens:check\` fails CI if stale.
   ─────────────────────────────────────────────────────────────────────────── */

export const tokens = {
  color: {
${colour}
  },
  font: {
    family: {
${jsObject(entries(group(['font', 'family'])), '      ')}
    },
    size: {
${jsObject(entries(group(['font', 'size'])), '      ')}
    },
    weight: {
${jsObject(entries(group(['font', 'weight'])), '      ')}
    },
    lineHeight: {
${jsObject(entries(group(['font', 'lineHeight'])), '      ')}
    },
    tracking: {
${jsObject(entries(group(['font', 'tracking'])), '      ')}
    },
  },
  spacing: {
${jsObject(entries(group(['spacing'])), '    ')}
  },
  radius: {
${jsObject(entries(group(['radius'])), '    ')}
  },
  duration: {
${jsObject(entries(group(['duration'])), '    ')}
  },
  easing: {
${jsObject(entries(group(['easing'])), '    ', cubic)}
  },
  motion: {
${jsObject(entries(group(['motion'])), '    ', composite)}
  },
  shadow: {
${jsObject(entries(group(['shadow'])).filter(([leaf]) => leaf !== 'focus'), '    ')}
  },
  controlHeight: {
${jsObject(entries(group(['controlHeight'])), '    ')}
  },
  zIndex: {
${jsObject(entries(group(['zIndex'])), '    ')}
  },
  borderWidth: {
${jsObject(entries(group(['borderWidth'])), '    ')}
  },
  opacity: {
${jsObject(entries(group(['opacity'])), '    ')}
  },
  iconSize: {
${jsObject(entries(group(['iconSize'])), '    ')}
  },
  breakpoint: {
${jsObject(entries(group(['breakpoint'])), '    ')}
  },
} as const

export type Tokens = typeof tokens

/* The brand map's type and role list, generated from brand.css. Re-exported here
   so a consumer has one entry point rather than two. */
export type { BrandMap } from './brand'
export { brandRoles } from './brand'
`
}

// ─── Write / check ───────────────────────────────────────────────────────────

const outputs: Record<string, string> = {
  'primitives.css': buildPrimitivesCss(),
  'motion.css': buildMotionCss(),
  'index.ts': buildIndexTs(),
  // Generated from brand.css rather than tokens.json, which is why it is listed
  // separately: editing the brand map without regenerating is exactly the drift
  // `tokens:check` exists to catch.
  'brand.ts': buildBrandTypes(),
  'tokens.json': JSON.stringify(
    { ...tokens, semantic: { ...tokens.semantic, color: buildSemanticColor() } },
    null,
    2,
  ) + '\n',
}

const check = process.argv.includes('--check')
const stale: string[] = []

if (!check && !existsSync(srcDir)) mkdirSync(srcDir, { recursive: true })

for (const [name, content] of Object.entries(outputs)) {
  const target = join(srcDir, name)
  if (check) {
    const current = existsSync(target) ? readFileSync(target, 'utf8') : null
    if (current !== content) stale.push(name)
  } else {
    writeFileSync(target, content)
  }
}

// CSS_EXCLUDED is documentation of intent as much as a guard: breakpoints are
// JS-only because custom properties cannot appear in @media conditions.
void CSS_EXCLUDED

if (check) {
  if (stale.length) {
    console.error(
      `✗ Generated tokens are stale: ${stale.join(', ')}\n` +
        `  src/tokens.json has changed without regenerating.\n` +
        `  Run: npm run tokens`,
    )
    process.exit(1)
  }
  console.log(`✓ ${Object.keys(outputs).join(', ')} are up to date with their sources`)
} else {
  console.log(`✓ Wrote ${Object.keys(outputs).join(', ')} from tokens.json`)
}
