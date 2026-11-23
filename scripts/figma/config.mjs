/* What the Figma parity check compares, and where each side lives.

   haus is one Figma file: the token collections (haus/primitives and
   haus/semantics, with one semantics mode per shipped brand) and one page per
   component. Code is the token sources in @hipuku/tokens and the component folders
   in haus-components. */

export const FIGMA_FILE = { key: 'Qo23P38COlJrfQmlM39Fa3', name: 'haus Design System' }

export const PATHS = {
  tokens: 'packages/tokens/src',
  tokenFiles: ['primitives.css', 'brand.css', 'semantics.css', 'motion.css'],
  brands: 'packages/tokens/src/brands',
  types: 'packages/components/src/types.ts',
  components: 'packages/components/src/components',
  snapshot: 'figma/snapshot/haus.json',
  baseline: 'figma/baseline.json',
  exceptions: 'figma/exceptions.json',
}

/* The states a stylesheet can express, in the words the Figma sets' `State`
   axis uses, compared in lower case. haus draws focus as a variant, because
   every component styles its own `:focus-visible` ring, so focus is compared. A
   set can carry more states than these (`Open`, `Error`, `Loading`), which come
   from props or script rather than a pseudo-class and are not compared. */
export const CSS_STATES = {
  hover: 'hover',
  active: 'pressed',
  'focus-visible': 'focus',
  disabled: 'disabled',
}
export const COMPARED_STATES = new Set(Object.values(CSS_STATES))

/* Props that are not Figma properties: structure, wiring, the element rendered
   and the ARIA a caller supplies. */
/* A component folder whose main export has another name: Radio's folder exports
   RadioGroup, which is the set Figma draws, beside a Radio part. The component
   and its axes take the export's name; its states stay with the folder, because
   the stylesheet styles the radios, which the Radio part draws. */
export const COMPONENT_NAMES = { Radio: 'RadioGroup' }

/* Axis names compared without case or spaces, so Figma's "Label position" and
   code's labelPosition are one axis. */
export const axisName = name => name.toLowerCase().replace(/[^a-z0-9]/g, '')

export const SKIP_PROPS = new Set(['as', 'asChild', 'className', 'children', 'style', 'role', 'id', 'name'])

/* Figma components that are construction parts, not components of the
   package: a leading underscore or full stop, or a slash. */
export const isPrivateComponent = name => name.startsWith('_') || name.startsWith('.') || name.includes('/')
