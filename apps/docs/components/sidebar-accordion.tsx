'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/*
 * One section open at a time.
 *
 * The sidebar's four sections are folders, and fumadocs opens a folder without
 * closing its siblings, so opening Components while reading Getting started
 * left both expanded and the list grew until it scrolled. There is no option
 * for this, so it is enforced here.
 *
 * Two things keep it true. A click on a folder that is about to open closes
 * whichever other folder is open, in the capture phase, before fumadocs has
 * changed any state. And after a navigation, any folder that does not contain
 * the current page is closed, which covers the case where following a link
 * opens a second section on arrival.
 *
 * It drives the triggers rather than reaching into fumadocs's state: clicking
 * a button is the one interaction the component is guaranteed to honour, and
 * an internal state shape would be a thing to re-learn on every upgrade.
 */
const TRIGGERS = '#nd-sidebar button[aria-expanded]:not([data-search-full],[data-collapsed])'

/** The element a trigger expands, which is where its pages live. */
const panelOf = (trigger: Element) => trigger.parentElement

export function SidebarAccordion() {
  const pathname = usePathname()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest?.(TRIGGERS)
      if (!trigger) return
      // Still its pre-click state: "false" means this click opens it, and only
      // then does anything else need to close.
      if (trigger.getAttribute('aria-expanded') !== 'false') return
      for (const other of document.querySelectorAll(TRIGGERS)) {
        if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
          ;(other as HTMLElement).click()
        }
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    // After a navigation, let the sidebar settle into whatever it opens for the
    // new page, then close anything that is not the section holding it.
    const id = window.setTimeout(() => {
      for (const trigger of document.querySelectorAll(TRIGGERS)) {
        if (trigger.getAttribute('aria-expanded') !== 'true') continue
        if (!panelOf(trigger)?.querySelector('a[data-active="true"]')) {
          ;(trigger as HTMLElement).click()
        }
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
