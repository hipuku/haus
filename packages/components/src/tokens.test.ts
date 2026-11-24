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

const declared = (css: string) => new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(m => m[1]))

const read = (p: string) => readFileSync(p, 'utf8')

const PRIMITIVE = declared(read(join(TOKENS, 'primitives.css')))
const ROLE = new Set([...declared(read(join(TOKENS, 'semantics.css'))), ...declared(read(join(TOKENS, 'motion.css')))])

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
          const tokens = [...part.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1])
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
const PAST = DECLS.map(d => ({
  ...d,
  primitives: d.tokens.filter(t => PRIMITIVE.has(t) && !ROLE.has(t)),
})).filter(d => d.primitives.length > 0)

/** The space ladder: the 4px steps and the two optical steps below them, which
 * docs/tokens.md says a component reads directly where 4px is too much. */
const LADDER = /^--haus-space-(\d+|0-5|px)$/

describe('components read roles, not primitives', () => {
  it('reads the stylesheets it is meant to read', () => {
    // A wrong path here would make every assertion below vacuously pass.
    expect(DECLS.length, `no declarations found under ${COMPONENTS}`).toBeGreaterThan(200)
    expect(PRIMITIVE.size, `no primitives found under ${TOKENS}`).toBeGreaterThan(100)
  })

  it('reads no colour, radius, shadow or motion primitive', () => {
    const banned = /^--haus-(aronia|damson|elderberry|greengage|mango|cherry|radius|shadow|duration|ease|motion)-/
    const offenders = PAST.flatMap(d =>
      d.primitives.filter(t => banned.test(t)).map(t => `${d.file} ${d.property}: ${t}`),
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
    const misuse = PAST.filter(d => d.primitives.some(t => LADDER.test(t)) && SPACING.test(d.property)).map(
      d => `${d.file} ${d.property}`,
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
    // font- left this list with haus#54: typeface is brandable now, so
    // --haus-font-sans is a role in semantics.css reading --haus-brand-font-sans,
    // and a component reading it is reading a role, not a primitive.
    const NAMED_ROLE = /^--haus-(weight-|icon-|control-height-)/
    const undocumented = PAST.flatMap(d =>
      d.primitives.filter(t => !LADDER.test(t) && !NAMED_ROLE.test(t)).map(t => `${d.file}: ${t}`),
    )
    expect(undocumented).toEqual([])
  })

  it('matches the counts the docs state', () => {
    // docs/tokens.md and the semantics.css header quote these.
    // If a component legitimately gains or loses one, update them together.
    const sizes = PAST.filter(d => d.primitives.some(t => LADDER.test(t)))
    // 31 since the Toggle thumb stopped mixing px into a rem track: the small
    // thumb's travel moved off a raw 12px onto --haus-space-3, and the thumb's
    // top and start insets off 2px onto --haus-space-0-5, the first component
    // read of a half step.
    //
    // Then 31 to 26 when the five optical nudges were replaced by an offset
    // derived from the first line of the label. The offset is a margin and it
    // subtracts the box, so the box could no longer be a step of the ladder:
    // Checkbox's and Radio's 16px boxes took --haus-marker-box and Toggle's
    // 20px track height --haus-toggle-track-height, five declarations off the
    // ladder and onto a size whose name says what it is.
    //
    // Then 26 to 25 when Modal's enter moved onto the dialog-enter role (4.5
    // audit): its travel was --haus-space-3 and is now the role's offset.
    expect(sizes.length).toBe(25)
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
    // assembling a role by hand, --haus-type-label-field-* is that role, and
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
    // --haus-type-label-md-tracking, so tracking is a role everywhere.
    //
    // Then 40 to 50 with haus#43, and this one went up on purpose: Select's
    // chevron, Toast's close and Modal's close were icon boxes drawn at raw
    // sizes, one of them a literal the strict-value rule cannot see, and they
    // bind to the icon scale now. icon-size is a named-role primitive like
    // font family, so reading it is reading a role. Modal's close also stopped
    // reading --haus-space-7 for its box, which is why the size count fell 31
    // to 29 in the same change.
    //
    // Then 50 to 54 with haus#55, and this one went up on purpose too: Spinner
    // is the nineteenth component and binds its two drawn sizes to the icon
    // scale, two declarations each for icon-sm and icon-lg. Button's own
    // hand-rolled spinner came out in the same change and cost nothing here,
    // because everything it read was a role or lives in motion.css.
    //
    // Then 54 to 22 with haus#54, and this one came down for the right reason:
    // the 32 --haus-font-sans reads did not move, but typeface became brandable,
    // so --haus-font-sans is now a role in semantics.css reading
    // --haus-brand-font-sans rather than a primitive. A read that was reaching
    // past the role layer is now landing on it. Not one component declaration
    // changed.
    //
    // Then 22 to 28 with haus#58, and this one went up on purpose as well.
    // IconButton is square, so one token sets both axes and each of its two
    // sizes costs two declarations: control-height-xs twice for sm, and
    // control-height-sm twice for md. Its glyph box binds to the icon scale,
    // one declaration each for icon-sm and icon-md. Six, and every one of them
    // is the same kind of read the paragraph below already allows.
    //
    // Then 28 to 31 with haus#61. Select's trigger binds one control height per
    // size, three declarations, the same heights the other form controls use.
    // Same category again.
    //
    // Then 31 to 28, and the size count 29 to 28, with decision 0025: the native
    // Select was retired and Listbox became Select. The native select's four reads
    // came out, --haus-space-3 for the chevron inset, --haus-control-height-md, and
    // --haus-icon-xs twice for the chevron box. The themed Select's own three
    // control heights stay, because they landed with haus#61 above.
    //
    // Then 28 to 31 with IconButton's lg size: an icon button that stands level
    // with a default Button reads control-height-md on both axes and icon-lg for
    // its glyph, three declarations. It was added because md tops out below
    // Button's md, so an icon action beside a labelled one had no way to match it.
    //
    // Then 31 to 33 when the five optical nudges were replaced: Callout's icon
    // and Modal's close are centred on the first line of the text beside them,
    // and each offset subtracts the icon box, so each margin reads the icon
    // scale a second time.
    //
    // Then 33 to 31 when Select lost its sizes (4.5 audit, owner 2026-11-24): a
    // field has one size, as Input does, so its three control-height reads
    // became one.
    //
    // Then 31 to 27 when Modal's close became an IconButton (4.5 audit): its
    // own box read icon-lg three times and icon-xs twice, and what is left is
    // one control-height-sm in the margin that centres it on the title.
    //
    // What is left is twelve control heights and fifteen icon sizes. A control
    // height and an icon box are sizes whose own name is already the role, with
    // no honest alias to invent.
    expect(PAST.length - sizes.length).toBe(27)
  })
})

/**
 * Every custom property a component names, in its stylesheet or in its source,
 * is one that exists.
 *
 * A misspelt or unprefixed name is not an error anywhere else. The browser
 * treats `var(--color-primary-subtle)` as unset and takes the fallback, or drops
 * the declaration, and nothing logs. Stylelint reads only the stylesheets, and
 * the role checks above only ask whether a name is a primitive, so a name that
 * is neither passed both. Avatar's palette did exactly that in TSX: five
 * unprefixed role names, so every avatar took the fallback and was primary,
 * whatever its name hashed to.
 */
describe('every custom property a component names exists', () => {
  const BRAND = declared(read(join(TOKENS, 'brand.css')))

  const sources: { file: string; text: string }[] = []
  for (const dir of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const f of readdirSync(join(COMPONENTS, dir.name))) {
      if (!/\.(module\.css|tsx)$/.test(f) || /\.test\.tsx$/.test(f)) continue
      sources.push({ file: `${dir.name}/${f}`, text: read(join(COMPONENTS, dir.name, f)) })
    }
  }

  // A component may declare its own custom properties, in its stylesheet or as
  // a style object key in its source, and read them back.
  const OWN = new Set(
    sources.flatMap(({ text }) => [
      ...[...text.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(m => m[1]),
      ...[...text.matchAll(/['"](--[\w-]+)['"]\s*:/g)].map(m => m[1]),
    ]),
  )
  const KNOWN = new Set([...PRIMITIVE, ...ROLE, ...BRAND, ...OWN])

  it('reads the source it is meant to read', () => {
    expect(sources.some(s => s.file.endsWith('.tsx'))).toBe(true)
    expect(sources.some(s => s.file.endsWith('.module.css'))).toBe(true)
  })

  it('names no custom property that is never declared', () => {
    const unknown = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/var\(\s*(--[\w-]+)/g)]
        .map(m => m[1])
        .filter(name => !KNOWN.has(name))
        .map(name => `${file}: ${name}`),
    )
    expect(unknown).toEqual([])
  })
})
