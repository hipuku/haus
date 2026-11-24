import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import { setProjectAnnotations } from '@storybook/react-vite'
import { page } from '@vitest/browser/context'
import { afterEach, beforeEach, expect } from 'vitest'
import preview from './preview'

/**
 * The preview's decorators, parameters and globals, so a story under Vitest
 * renders as it does in Storybook: the mode decorator, the background, and
 * `a11y: { test: 'error' }`, which is what turns an axe violation into a
 * failure rather than a note in a panel.
 *
 * The a11y addon's own annotations come first, and they are what runs axe:
 * `a11y: { test: 'error' }` in the preview is read by this hook, and without
 * the import the parameter is inert under Vitest. Measured before adding it, a
 * badge whose label was set to its own background colour passed.
 *
 * The addon prints a note saying it applies these itself since 10.3 and that
 * this call can be removed. It cannot, here: naming `setupFiles` on the project
 * replaces the setup file the addon would have injected, so removing this line
 * leaves every story with no render function at all. The note is written for a
 * project that does not set `setupFiles`.
 */
setProjectAnnotations([a11yAddonAnnotations, preview])

/**
 * Wait for the faces before anything is measured or captured.
 *
 * The brand names DM Sans and DM Mono and the preview head loads them from
 * Google Fonts, so there is a moment where the fallback is on screen. A
 * screenshot taken then is a screenshot of system-ui, and the next run, with
 * the font cached, reads as a change in every story at once.
 */
/** The two families the default brand names. Both have to be on the page. */
const FACES = ['DM Sans', 'DM Mono']

beforeEach(async () => {
  // Paint the page the surface role, which is what a product does and what
  // Storybook's backgrounds addon does in the browser. Under Vitest nothing
  // paints it, so in dark mode haus's light ink sat on the user agent's white:
  // axe read #fcfbfe on #ffffff at 1.03 and failed thirty stories for a
  // contrast pair the system never ships.
  document.documentElement.style.backgroundColor = 'var(--haus-color-surface-default)'
  document.body.style.backgroundColor = 'var(--haus-color-surface-default)'

  await document.fonts.ready

  // And then check they are actually there. `fonts.ready` settles when nothing
  // is pending, which includes nothing having started: a runner that cannot
  // reach Google Fonts renders every story in system-ui, consistently, and a
  // whole baseline set taken that way compares clean forever. `fonts.load`
  // returns the faces that matched, so an empty array is the face missing.
  for (const family of FACES) {
    const faces = await document.fonts.load(`400 1rem "${family}"`)
    if (faces.length === 0) {
      throw new Error(
        `${family} did not load, so this would be a screenshot of the fallback. ` +
          'The faces come from Google Fonts through the preview head; check the network before trusting any image from this run.',
      )
    }
  }
})

/**
 * One screenshot per story per mode, after its play function has run, so what
 * is captured is the state the story ends in rather than the state it starts
 * in.
 *
 * The story's own box, not the window. There is no `#storybook-root` under
 * Vitest: the runner mounts each story into a bare div it appends to the body,
 * beside Storybook's four hidden `sb-wrapper` helpers, and that div is the
 * handle. Capturing the window instead made the comparison too weak to be a
 * gate, because a story is a small thing on a 1200x900 canvas and a real change
 * to it moved less than the allowed ratio of the whole.
 *
 * When a story portals, as Modal and Toast do, the portal is a second child of
 * the body and the mount div holds only the trigger. Those fall back to the
 * body, which is the only element that contains both halves.
 *
 * Two kinds of element in the body belong to Storybook rather than to the
 * story, and counting either as a portal would send every story to the body:
 * the four hidden `sb-wrapper` divs, and the filter sheet the a11y addon adds
 * for its vision simulations.
 */
const isChrome = (el: Element) => el.classList.contains('sb-wrapper') || el.id === 'storybook-a11y-vision-filters'

afterEach(async () => {
  // A contract story (stories/contracts) asserts behaviour, pausing animations
  // to read them, so it has no stable picture to compare and is not one.
  if (document.querySelector('[data-contract]')) return
  const mounted = [...document.body.children].filter(el => !isChrome(el))
  const target = mounted.length === 1 ? mounted[0] : document.body
  await expect.element(page.elementLocator(target)).toMatchScreenshot()
})
