// @vitest-environment node
/**
 * No component attaches a ref it was not given.
 *
 * `haus#71` shipped and reached a consumer within minutes. `<Button asChild>`
 * rendered from a React Server Component threw *"Refs cannot be used in Server
 * Components, nor passed to Client Components"*, because `mergeRefs` returned a
 * callback unconditionally: with no ref on the Button and none on the child, it
 * still produced one, and `cloneElement` duly attached it.
 *
 * **Nothing here could have caught it.** The 30 component suites render on a
 * client, where a stray ref is legal. `ssr.test.tsx` renders through
 * `renderToString`, which is server *rendering* and not React Server
 * Components, and it accepts a ref happily. The RSC row of that table was blank,
 * and `haus#72` said the blank row was the finding.
 *
 * ## Why this asserts the rule and not the render
 *
 * `haus#72` offered two options. A real RSC harness (`react-server-dom-webpack`)
 * gives a true server render and would catch violations this cannot see: a hook
 * where none is allowed, an event handler in a server tree. It is also a
 * dependency and a build wrinkle for a package that declares almost nothing, and
 * this package has refused that trade before for good reasons.
 *
 * The narrower option was taken, and its limit is stated rather than implied:
 * **this catches a ref attached unasked, which is exactly `haus#71`, and nothing
 * else.** It is worth having because that is not an arbitrary slice of the RSC
 * rules. `asChild` is the only path in this package that can attach a ref the
 * caller did not pass, and decision 0022 puts `asChild` on `IconButton` and
 * `Card` next, so the surface this guards is about to triple.
 *
 * ## Why a forwardRef child, and not an inspection
 *
 * The peer range is React 18 and 19. In 19 a ref arrives as an ordinary prop; in
 * 18 it sits on the element. `forwardRef` receives it in the same argument under
 * both, so a recording `forwardRef` child is the one observation that holds
 * across the range.
 *
 * The list of components is read from the source rather than typed here. A
 * component that gains `asChild` is covered the day it gains it, which is the
 * point: this file exists because the surface is about to grow.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as haus from './index'

const COMPONENTS = join(process.cwd(), 'src', 'components')

/** Components whose source accepts `asChild`, read from the directory. */
const asChildComponents = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(name => {
    const impl = join(COMPONENTS, name, `${name}.tsx`)
    return existsSync(impl) && /\basChild\b/.test(readFileSync(impl, 'utf8'))
  })

/**
 * Props each component needs beyond `asChild` and its child.
 *
 * Entries are added when a component gains `asChild`, never before: the check
 * below fails on a component that gains it without a line here, so the person
 * adding it is told rather than getting a confusing render failure. Both
 * entries below arrived that way, one commit apart, which is the check doing
 * the only job it has.
 */
const REQUIRED: Record<string, Record<string, unknown>> = {
  Button: {},
  IconButton: { icon: '+', label: 'Settings' },
  Card: {},
}

describe('no component attaches a ref it was not given', () => {
  it('found the components that accept asChild', () => {
    // If this ever reads zero, the filter has drifted and every case below
    // would vacuously pass.
    expect(asChildComponents.length).toBeGreaterThan(0)
    expect(asChildComponents).toContain('Button')
  })

  it.each(asChildComponents)('%s asChild attaches no ref when neither side has one', name => {
    const Component = (haus as Record<string, unknown>)[name] as React.ElementType
    expect(Component, `${name} is not exported`).toBeTruthy()

    let received: unknown = 'never rendered'
    const Child = React.forwardRef<HTMLAnchorElement, { children?: React.ReactNode }>(
      function Child(props, ref) {
        received = ref
        return <a href="/x" {...props} />
      },
    )

    const html = renderToString(
      React.createElement(
        Component,
        { asChild: true, ...(REQUIRED[name] ?? {}) },
        <Child>Go</Child>,
      ),
    )

    expect(html, `${name} rendered nothing`).toContain('<a')
    // The whole of haus#71: with no ref on either side, there must be no ref.
    expect(received, `${name} attached a ref nobody asked for`).toBeFalsy()
  })

  it.each(asChildComponents)('%s still merges a ref when one is actually given', name => {
    const Component = (haus as Record<string, unknown>)[name] as React.ElementType

    let received: unknown = null
    const Child = React.forwardRef<HTMLAnchorElement, { children?: React.ReactNode }>(
      function Child(props, ref) {
        received = ref
        return <a href="/x" {...props} />
      },
    )

    const ref = React.createRef<HTMLAnchorElement>()
    renderToString(
      React.createElement(
        Component,
        { asChild: true, ref, ...(REQUIRED[name] ?? {}) },
        <Child>Go</Child>,
      ),
    )

    // The fix for haus#71 was "return undefined when there is nothing to
    // merge", and the way to get that wrong in the other direction is to drop
    // the merge entirely. This is the half that would catch that.
    expect(received, `${name} dropped a ref that was given`).toBeTruthy()
  })

  it('REQUIRED and the asChild components agree, in both directions', () => {
    // REQUIRED is a list beside a directory, which is the shape this package
    // keeps getting wrong, so it is checked both ways rather than trusted.
    const stale = Object.keys(REQUIRED).filter(n => !asChildComponents.includes(n))
    expect(stale, `REQUIRED names components without asChild: ${stale.join(', ')}`).toEqual([])

    const unlisted = asChildComponents.filter(n => !(n in REQUIRED))
    expect(
      unlisted,
      `gained asChild with no REQUIRED entry, so the cases above cannot render it: ${unlisted.join(', ')}`,
    ).toEqual([])
  })
})
