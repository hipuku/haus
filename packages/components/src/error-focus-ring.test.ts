/**
 * A control that can be invalid must ring in the error colour, not the brand one.
 *
 * `--haus-focus-ring-error` was added when Input and Textarea needed it, and for a
 * while nothing else read it. Checkbox and Radio were found later, by asking which
 * components read the token and noticing the list was short. They survived an
 * earlier audit for the reason haus#44 records: a token audit finds a component using
 * the wrong role, and cannot find a component that should be using a role and is
 * not. Neither of them read the token at all, so neither appeared in the list of
 * components reading it wrongly.
 *
 * So the question is asked from the other side here, off the component API rather
 * than off the stylesheet. A component that takes an `error` prop has a state a
 * user can be wrong in; if it also paints a focus ring, then focusing it while it
 * is wrong must not repaint the ring in the brand colour. Four pixels of purple
 * around a sixteen pixel box is the loudest thing on the control, and it says
 * "focused" rather than "wrong".
 *
 * Driving it off the API is what makes it hold for the next control too. Any new
 * component with an `error` prop is in the set from the moment it is written, and
 * fails here until it has the rule, without anyone remembering to add it to a list.
 *
 * The component tests run with `css: false`, so nothing here reads a computed
 * style. The source is what is available, and the source is where the rule is
 * either present or missing.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENTS = join(process.cwd(), 'src', 'components')

/** Comments stripped: a rule being explained in prose is not a rule in force, and
 *  three of these stylesheets discuss the very token being asserted on. */
const decomment = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

interface Component {
  name: string
  /** Every `.module.css` in the directory, concatenated and decommented. */
  css: string
  /** Every `.tsx` that is not a test, concatenated. */
  source: string
}

function components(): Component[] {
  return readdirSync(COMPONENTS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const files = readdirSync(join(COMPONENTS, d.name))
      const read = (f: string) => readFileSync(join(COMPONENTS, d.name, f), 'utf8')
      return {
        name: d.name,
        css: files
          .filter((f) => f.endsWith('.module.css'))
          .map((f) => decomment(read(f)))
          .join('\n'),
        source: files
          .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
          .map(read)
          .join('\n'),
      }
    })
}

const ALL = components()

/** Takes an `error` prop, so it has a state the user can be wrong in. Badge and
 *  Toast have an `.error` class but no `error` prop: theirs is a tone, a
 *  destructive button or a red toast, and there is nothing to be invalid about. */
const takesError = (c: Component) => /\berror\?: *string/.test(c.source)

/** Paints the ordinary focus ring. The `)` matters: it separates
 *  `var(--haus-focus-ring)` from `var(--haus-focus-ring-error)`. */
const paintsRing = (c: Component) => c.css.includes('var(--haus-focus-ring)')

const paintsErrorRing = (c: Component) => c.css.includes('var(--haus-focus-ring-error)')

describe('an invalid control rings in the error colour', () => {
  it('found the components it is meant to read', () => {
    // Both halves. A wrong path empties the list; a regex that matches nothing
    // empties the set, and either would make every assertion below pass on air.
    expect(ALL.length).toBeGreaterThan(10)
    expect(ALL.filter(takesError).map((c) => c.name).sort()).toEqual([
      'Checkbox',
      'Input',
      'Radio',
      'Textarea',
    ])
  })

  it.each(ALL.filter((c) => takesError(c) && paintsRing(c)).map((c) => c.name))(
    '%s reads the error ring as well as the ordinary one',
    (name) => {
      const c = ALL.find((x) => x.name === name)!
      expect(paintsErrorRing(c)).toBe(true)
    },
  )

  it('scopes every error ring under the error class', () => {
    // A stylesheet can carry the token in a rule nothing selects. The declaration
    // has to sit in a block whose selector is qualified by `.error`, which is the
    // class each of these five components puts on the element wrapping the input.
    const unscoped: string[] = []
    for (const c of ALL.filter(paintsErrorRing)) {
      const rules = c.css.match(/[^{}]+\{[^}]*\}/g) ?? []
      const carrying = rules.filter((r) => r.includes('var(--haus-focus-ring-error)'))
      expect(carrying.length).toBeGreaterThan(0)
      for (const rule of carrying) {
        const selector = rule.slice(0, rule.indexOf('{'))
        if (!/\.error(?![A-Za-z0-9_-])/.test(selector)) {
          unscoped.push(`${c.name}: ${selector.trim()}`)
        }
      }
    }
    expect(unscoped).toEqual([])
  })

  it('leaves a control with no error state alone', () => {
    // Toggle is the case worth pinning. A switch takes effect immediately, so
    // there is nothing to validate, and it correctly has neither an `error` prop
    // nor an error ring. If it ever grows one, the assertion above starts
    // covering it and this one says why it changed.
    const toggle = ALL.find((c) => c.name === 'Toggle')!
    expect(takesError(toggle)).toBe(false)
    expect(paintsErrorRing(toggle)).toBe(false)
  })
})
