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
    // padding, gap or margin: it was reporting the arrival of new CSS as
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
    // border-width, opacity and z-index left this list with haus#27: they are
    // roles in semantics.css now, so a component reading one is reading a role.
    // tracking- left this list with haus#37: tracking is carried by the type
    // roles now, so a component reading a --haus-tracking-* primitive is
    // reaching past the role layer, which is the thing this test is for.
    const NAMED_ROLE = /^--haus-(font-|weight-|icon-|control-height-)/
    const undocumented = PAST.flatMap((d) =>
      d.primitives.filter((t) => !/^--haus-space-\d+$/.test(t) && !NAMED_ROLE.test(t)).map((t) => `${d.file}: ${t}`),
    )
    expect(undocumented).toEqual([])
  })

  it('matches the counts the docs state', () => {
    // docs/tokens.md, DESIGN.md and the semantics.css header all quote these.
    // If a component legitimately gains or loses one, update them together.
    const sizes = PAST.filter((d) => d.primitives.some((t) => /^--haus-space-\d+$/.test(t)))
    expect(sizes.length).toBe(29)
    // 61 before step 7, rising to 77 as the six new components landed: border
    // widths, font families, shadows and, the sharp one, --haus-z-dropdown.
    // Popover and Tooltip are the pair worth pausing on. They are the first
    // components here that have to sit above something, and there is no z role
    // to ask for, so the system itself now reads the primitive that drift and
    // vault each rewrote by hand. That is haus#27, and it stopped being a
    // tidiness argument the moment the system hit its own gap.
    //
    // Then 77 to 71 with haus#34, and that is the number coming down for the
    // right reason rather than by relabelling. Four field labels stopped
    // assembling a role by hand, --haus-type-field-label-* is that role, and
    // Button and Avatar took --haus-weight-emphasis and --haus-weight-strong,
    // which are weight-only because both hold one weight across three and five
    // size steps and so have no single role to take it from.
    //
    // There is no --haus-weight-* read left in the components at all.
    //
    // Then 71 to 41 with haus#27, and none of it was component work: not one
    // declaration in this package changed. The eight z-index names, the two
    // border widths and the two opacities were primitives carrying role names,
    // so a product that wanted the stacking order had to read primitives.css,
    // which is why drift and vault each fixed their own. primitives.css holds
    // the ladders now (0 to 600, 1px and 2px, 0.4 and 0.6) and semantics.css
    // holds the names, so the same 30 declarations resolve through the role
    // layer without moving.
    //
    // Then 41 to 40 with haus#37: Button was the one component reading a
    // tracking primitive (--haus-tracking-normal), and it moved onto
    // --haus-type-label-tracking, so tracking is a role everywhere.
    //
    // Then 40 to 50 with haus#43, and this one went up on purpose: Select's
    // chevron, Toast's close and Modal's close were icon boxes drawn at raw
    // sizes, one of them a literal the strict-value rule cannot see, and they
    // bind to the icon scale now. icon-size is a named-role primitive like
    // font family, so reading it is reading a role. Modal's close also stopped
    // reading --haus-space-7 for its box, which is why the size count fell 31
    // to 29 in the same change.
    //
    // What is left is genuinely nameless: 32 reads of --haus-font-sans, five
    // control heights, and thirteen icon sizes (three icon-sm, four icon-lg,
    // six icon-xs). A font family is not a role and there is no honest alias to
    // invent for it.
    expect(PAST.length - sizes.length).toBe(50)
  })
})
