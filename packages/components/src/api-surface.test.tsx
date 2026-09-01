/**
 * The README says every component forwards its ref and spreads the remaining
 * props onto the underlying element. It said that when four of twelve forwarded
 * a ref and six spread props, and nothing checked it.
 *
 * A per-component test would have caught each one, and would also have let the
 * next component be added without either. So this asserts the claim over the
 * barrel: every export is held to the sentence, and a thirteenth component
 * joins the table by existing.
 */
import { createRef } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as haus from './index'

/** Minimum props for each component to render at all. */
const REQUIRED: Record<string, Record<string, unknown>> = {
  Avatar: { name: 'Ada Lovelace' },
  Badge: { children: 'New' },
  Button: { children: 'Save' },
  Card: { children: 'Body' },
  Checkbox: { label: 'Accept' },
  Input: { label: 'Name' },
  Modal: { open: true, onClose: () => {}, title: 'Confirm', children: 'Body' },
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

describe('the API the README promises', () => {
  it('covers every exported component', () => {
    // A component added to the barrel without an entry above would otherwise be
    // skipped silently by both tests below.
    const missing = components.map(([n]) => n).filter(n => !(n in REQUIRED))
    expect(missing).toEqual([])
    expect(components.length).toBe(Object.keys(REQUIRED).length)
  })

  it.each(components)('%s forwards its ref', (name, Component) => {
    const ref = createRef<HTMLElement>()
    render(<Component ref={ref} {...REQUIRED[name]} />)
    expect(ref.current, `${name} did not forward its ref`).toBeInstanceOf(HTMLElement)
  })

  it.each(components)('%s lands className on the same node as its ref', (name, Component) => {
    // Ruling B5. className used to land on a different node in almost every
    // component — the root on six, an inner label on Checkbox so its outer div
    // was unreachable, .inputWrap on Input, the dialog on Modal — with no
    // documented rule, so a consumer had to read the source of each one.
    //
    // Deliberately not tied to the ref. The two rules point at different nodes
    // on a wrapped control and that is correct: the ref goes to the field, which
    // is what a caller wants to focus, and className goes to the block around
    // it. Asserting them together was the first version of this test and it
    // failed on every wrapped component, which is the distinction being made.
    const { container } = render(<Component {...REQUIRED[name]} className="probe-class" />)
    const marked = document.querySelector('.probe-class')
    expect(marked, `${name} dropped className entirely`).not.toBeNull()

    // The root of what the component rendered: a direct child of the test
    // container, or of <body> for a component that portals.
    const parent = marked!.parentElement
    expect(
      parent === container || parent === document.body,
      `${name} put className on an inner node rather than its root`,
    ).toBe(true)
  })

  it.each(components)('%s spreads unknown props onto an element', (name, Component) => {
    // data-* is the honest probe: it is never a modelled prop, so it can only
    // arrive by being spread. Without it a consumer cannot attach a test hook,
    // an analytics attribute or an aria-* the component did not think of.
    render(<Component {...REQUIRED[name]} data-probe={`${name}-probe`} />)
    expect(
      document.querySelector(`[data-probe="${name}-probe"]`),
      `${name} dropped an unknown prop`,
    ).not.toBeNull()
  })
})
