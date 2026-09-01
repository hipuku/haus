// @vitest-environment node
/**
 * The README says these render under react-dom/server with no DOM present.
 * Nothing checked it, and `renderToString` appeared nowhere in the package —
 * so the claim was true by assertion only, and the first consumer to server
 * render would have been the test.
 *
 * Deliberately a node environment, not jsdom. Under jsdom a component can reach
 * for `document` and get one, which is exactly the mistake this is looking for.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as haus from './index'

const REQUIRED: Record<string, Record<string, unknown>> = {
  Avatar: { name: 'Ada Lovelace' },
  Badge: { children: 'New' },
  Button: { children: 'Save' },
  Card: { children: 'Body' },
  Checkbox: { label: 'Accept' },
  Input: { label: 'Name' },
  // Closed: an open Modal is a portal, and a portal has nowhere to go on a
  // server. That is the point of the second test rather than a gap in this one.
  Modal: { open: false, onClose: () => {}, title: 'Confirm', children: 'Body' },
  RadioGroup: { name: 'size', options: [{ value: 'sm', label: 'Small' }] },
  Select: { label: 'Role', options: [{ value: 'a', label: 'A' }] },
  Textarea: { label: 'Notes' },
  Toast: { title: 'Saved' },
  Toggle: { label: 'Wifi' },
}

const components = Object.entries(haus).filter(
  ([name, value]) =>
    /^[A-Z]/.test(name) && (typeof value === 'function' || typeof value === 'object'),
) as [string, React.ElementType][]

describe('server rendering', () => {
  it('has no DOM to fall back on', () => {
    // If this fails the environment docblock has been lost, and every assertion
    // below would pass for the wrong reason.
    expect(typeof document).toBe('undefined')
  })

  it('covers every exported component', () => {
    expect(components.map(([n]) => n).filter(n => !(n in REQUIRED))).toEqual([])
  })

  it.each(components)('%s renders to a string', (name, Component) => {
    expect(() => renderToString(<Component {...REQUIRED[name]} />)).not.toThrow()
  })

  it('an open Modal is the documented exception', () => {
    // createPortal needs a container, and there is none on a server. The README
    // already says to import these from a client component under RSC; this is
    // the concrete edge that makes that instruction load-bearing rather than
    // boilerplate, and it fails loudly rather than hydrating wrong.
    const Modal = haus.Modal as React.ElementType
    expect(() =>
      renderToString(<Modal open onClose={() => {}} title="Confirm">Body</Modal>),
    ).toThrow()
  })
})
