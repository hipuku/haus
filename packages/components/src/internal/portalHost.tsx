import React from 'react'

/**
 * Where a portalled surface goes, when something above it owns the page.
 *
 * `document.body` is the right host for a portalled Popover on an ordinary
 * page: it escapes whatever clipped it, and nothing else is competing for
 * focus. Inside a Modal it is the wrong one, and the failure is total rather
 * than cosmetic. Modal keeps `aria-modal="true"` honest with a `focusin`
 * listener that pulls focus back whenever it lands outside the dialog, so a
 * Popover panel in `document.body` is outside, every input in it loses focus
 * the instant it is given, and the panel cannot be typed into at all.
 *
 * Closing the Modal's trap over the panel is not the fix. The panel is the
 * dialog's content by every measure a user has, so it belongs in the dialog:
 * then the trap includes it, Tab reaches it in order, `inert` applies to it
 * with everything else, and none of those three need a special case.
 *
 * Portalling to the dialog still does the job the `portal` prop exists for.
 * What clips a panel inside a dialog is the dialog's own scrolling body, and
 * the dialog root is outside it.
 *
 * A context rather than a DOM walk from the panel: the panel is already
 * portalled by the time it could look, so the DOM would say `document.body`
 * either way. React's tree is the only place the relationship is still visible.
 */
export interface PortalHost {
  /** Null while the host is mounted but has not attached its element yet. */
  element: HTMLElement | null
}

/**
 * Null means no host in the tree, which is different from a host whose element
 * has not attached. Both read as "no element", and only the first one may fall
 * back to `document.body`; the second has to wait, because falling back is the
 * bug this exists to prevent.
 */
export const PortalHostContext = React.createContext<PortalHost | null>(null)

/** What a host provides. Holds the element in state rather than a ref, so a
 *  consumer re-renders when it attaches. */
export function usePortalHostValue(): [PortalHost, (node: HTMLElement | null) => void] {
  const [element, setElement] = React.useState<HTMLElement | null>(null)
  const value = React.useMemo(() => ({ element }), [element])
  return [value, setElement]
}

/**
 * The element a portalled surface should render into: the nearest host, or
 * `document.body` when there is none.
 *
 * Null means "not yet", and a caller must render nothing rather than choose for
 * itself. That happens on the host's first render and on the server, where
 * there is no document to fall back to.
 */
export function usePortalHost(): HTMLElement | null {
  const host = React.useContext(PortalHostContext)
  if (host) return host.element
  return typeof document === 'undefined' ? null : document.body
}
