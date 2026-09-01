/**
 * The token layer's claim is that components read roles, not raw values.
 * stylelint's strict-value rule already stops a hardcoded `12px`; it says
 * nothing about reaching one layer too far down and reading `--space-3`.
 * These are the reads that remain, held to the exact shape DESIGN.md and
 * docs/tokens.md describe, so the counts in the prose stay measured.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENTS = join(process.cwd(), 'src', 'components')
const TOKENS = join(process.cwd(), '..', 'tokens', 'src')

const declared = (css: string) =>
  new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))

const read = (p: string) => readFileSync(p, 'utf8')

const PRIMITIVE = declared(read(join(TOKENS, 'primitives.css')))
const ROLE = new Set([
  ...declared(read(join(TOKENS, 'semantics.css'))),
  ...declared(read(join(TOKENS, 'motion.css'))),
])

/** Every CSS declaration in the component styles, with its property and file. */
function declarations() {
  const out: { file: string; property: string; tokens: string[] }[] = []
  for (const dir of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const f of readdirSync(join(COMPONENTS, dir.name))) {
      if (!f.endsWith('.module.css')) continue
      const css = read(join(COMPONENTS, dir.name, f))
      for (const line of css.split('\n')) {
        for (const part of line.split(';')) {
          const tokens = [...part.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])
          if (!tokens.length) continue
          out.push({ file: `${dir.name}/${f}`, property: /([a-z-]+)\s*:/.exec(part.trim())?.[1] ?? '?', tokens })
        }
      }
    }
  }
  return out
}

const DECLS = declarations()
/** Reads that go past the role layer to a primitive. */
const PAST = DECLS.map((d) => ({
  ...d,
  primitives: d.tokens.filter((t) => PRIMITIVE.has(t) && !ROLE.has(t)),
})).filter((d) => d.primitives.length > 0)

describe('components read roles, not primitives', () => {
  it('reads the stylesheets it is meant to read', () => {
    // A wrong path here would make every assertion below vacuously pass.
    expect(DECLS.length, `no declarations found under ${COMPONENTS}`).toBeGreaterThan(200)
    expect(PRIMITIVE.size, `no primitives found under ${TOKENS}`).toBeGreaterThan(100)
  })

  it('reads no colour, radius, shadow or motion primitive', () => {
    const banned = /^--haus-(aronia|damson|elderberry|greengage|mango|cherry|radius|shadow|duration|ease|motion)-/
    const offenders = PAST.flatMap((d) =>
      d.primitives.filter((t) => banned.test(t)).map((t) => `${d.file} ${d.property}: ${t}`),
    )
    expect(offenders).toEqual([])
  })

  it('reads the space ladder only for sizes, never for padding, gap or margin', () => {
    // Stated as the rule it is named after rather than as an allowlist of the
    // properties that happened to exist when it was written. The allowlist
    // version failed on `inset-inline-end` and on a custom property the moment
    // the components were converted to logical properties, neither of which is
    // padding, gap or margin — it was reporting the arrival of new CSS as
    // misuse.
    //
    // Known limit, unchanged by the rewrite: a value laundered through a custom
    // property (`--pad: var(--space-4); padding: var(--pad)`) is invisible here,
    // because the declaration that names the primitive is not the one that
    // spends it.
    const SPACING = /^(padding|margin|gap|row-gap|column-gap)(-|$)/
    const misuse = PAST.filter((d) => d.primitives.some((t) => /^--haus-space-\d+$/.test(t)) && SPACING.test(d.property)).map(
      (d) => `${d.file} ${d.property}`,
    )
    expect(misuse).toEqual([])
  })

  it('reads no primitive outside the documented set', () => {
    // Primitives whose own name already is the role, so no alias exists.
    const NAMED_ROLE = /^--haus-(font-|weight-|border-width-|tracking-|opacity-|icon-|z-|control-height-)/
    const undocumented = PAST.flatMap((d) =>
      d.primitives.filter((t) => !/^--haus-space-\d+$/.test(t) && !NAMED_ROLE.test(t)).map((t) => `${d.file}: ${t}`),
    )
    expect(undocumented).toEqual([])
  })

  it('matches the counts the docs state', () => {
    // docs/tokens.md, DESIGN.md and the semantics.css header all quote these.
    // If a component legitimately gains or loses one, update them together.
    const sizes = PAST.filter((d) => d.primitives.some((t) => /^--haus-space-\d+$/.test(t)))
    expect(sizes.length).toBe(31)
    expect(PAST.length - sizes.length).toBe(61)
  })
})
