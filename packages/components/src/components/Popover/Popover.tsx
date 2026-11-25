import React from 'react'
import { createPortal } from 'react-dom'
import { usePortalHost } from '../../internal/portalHost'
import styles from './Popover.module.css'

/** Which edge of the trigger the panel lines up with. */
export type PopoverAlign = 'start' | 'end' | 'stretch'

/** Which side of the trigger the panel sits on. */
export type PopoverPlacement = 'bottom' | 'top'

/**
 * How wide the panel is.
 *
 * `trigger` matches the anchor, which is what a select-like menu wants; `auto`
 * takes its content's width, which is what a small action menu wants. The four
 * fixed steps are for panels holding a form, and read the `--haus-popover-width-*`
 * roles rather than the literals they once were, so a brand can restate them.
 */
export type PopoverWidth = 'auto' | 'trigger' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * What the panel *is*.
 *
 * Typed rather than `string`, which is what vault's takes. A popover with the
 * wrong role is worse than one with none: `menu` promises arrow-key navigation
 * between `menuitem` children, and a panel that claims it and holds a form is
 * lying to every screen reader that believes it.
 */
export type PopoverRole = 'dialog' | 'menu' | 'listbox' | 'group'

interface PopoverBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  open: boolean
  onClose: () => void
  /**
   * The element the panel belongs to. Focus returns here when the panel closes,
   * and a click on it is not treated as a click outside.
   *
   * Required, and that is the point of the component. vault's version leaves
   * this to the caller and none of its six call sites does it, so dismissing a
   * menu with Escape drops focus onto `<body>`: the keyboard user is back at
   * the top of the document with no way to know it moved.
   */
  triggerRef: React.RefObject<HTMLElement | null>
  align?: PopoverAlign
  placement?: PopoverPlacement
  width?: PopoverWidth
  /**
   * Render the panel out of the caller's positioned ancestor and position it
   * from the trigger's rect instead.
   *
   * The host is `document.body`, except inside a `Modal`, where it is the
   * dialog. The dialog is what the panel needs to escape *into*: the thing
   * clipping it is the dialog's scrolling body, not the dialog, and a panel in
   * `document.body` is outside the focus trap that keeps `aria-modal` honest,
   * so every control in it lost focus the instant it was given and the panel
   * could not be used at all.
   *
   * **Off by default, and it stays a caller's decision.** Today's behaviour
   * needs no measuring and no dependency, and is right whenever nothing
   * between the trigger and the page clips. It is wrong the moment something
   * does: `Modal`'s body is `overflow-y: auto`, so a panel inside a dialog is
   * cut off at its edge, and `placement` cannot answer that. Flipping to `top`
   * clips at the other edge instead. haus#68.
   *
   * The consumer knows whether it is inside a scrolling container; the panel
   * cannot. That is the same division `placement` already makes.
   */
  portal?: boolean
  role?: PopoverRole
}

/* A panel a screen reader announces as nothing is a panel that may as well not
   have a role. Either it points at its own heading or it carries a label, and
   the type says so rather than leaving it to a reviewer. Same shape as Modal. */
type PopoverLabel =
  { 'aria-label': string; 'aria-labelledby'?: never } | { 'aria-label'?: never; 'aria-labelledby': string }

export type PopoverProps = PopoverBaseProps & PopoverLabel

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    open,
    onClose,
    triggerRef,
    align = 'start',
    placement = 'bottom',
    width = 'auto',
    role = 'dialog',
    portal = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const setPanel = React.useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  /* Escape closes and focus goes back where it came from.
   *
   * The second half is the part every hand-rolled popover forgets. Escape that
   * only sets `open` to false leaves focus on an element that has just been
   * removed from the document, and the browser's fallback is `<body>`, so the
   * next Tab starts from the top of the page. WCAG 2.4.3.
   *
   * Only restored when focus is actually inside the panel. A popover dismissed
   * by clicking elsewhere should not steal focus back to its trigger; the
   * pointer already moved the user somewhere deliberately. */
  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Stopped here so a popover inside a dialog closes the popover and not
      // the dialog behind it. Nesting is the normal case, not the exotic one.
      e.stopPropagation()
      const inside = panelRef.current?.contains(document.activeElement)
      onClose()
      if (inside) triggerRef.current?.focus()
    }

    /* pointerdown rather than click: a click fires after the pointer is
       released, so a drag that starts inside a menu and ends outside it closes
       the menu on mouseup. pointerdown also beats focus, which is what stops a
       second trigger's panel opening and closing in the same gesture. */
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      // The trigger is not outside. Without this the trigger's own onClick
      // toggles a panel this listener has already closed, so the panel opens
      // and shuts on one click and the component looks broken.
      if (triggerRef.current?.contains(target)) return
      onClose()
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, onClose, triggerRef])

  /* Tabbing out of the last control closes the panel rather than trapping.
   *
   * Deliberately not a focus trap, which is what Modal has. A modal is modal -
   * the page behind it is inert and Tab has nowhere else to go. A popover is
   * not: the content behind it is live, and trapping focus in a small menu the
   * user can leave by looking away is a worse experience than closing. */
  React.useEffect(() => {
    if (!open) return
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [open, onClose, triggerRef])

  /* Measured only while portalled and open. A portalled panel has left its
     positioned ancestor behind, so the CSS that placed it no longer applies and
     the rect is the only thing left to place it by. Recomputed on scroll and
     resize because both move the trigger under a fixed panel.

     This is not the positioning engine this package declined. There is still no
     collision detection: nothing flips, nothing shifts, and the panel goes
     exactly where `placement` and `align` say. It is the same placement, in
     viewport coordinates instead of the ancestor's. */
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  /* The trigger's direction, read with its rect. `start` and `end` are the
     trigger's own edges, and a fixed panel is placed in viewport coordinates,
     so in a right-to-left layout `start` is the trigger's right edge. */
  const [rtl, setRtl] = React.useState(false)
  React.useEffect(() => {
    if (!portal || !open) return
    const measure = () => {
      const node = triggerRef.current
      if (!node) return
      setRect(node.getBoundingClientRect())
      setRtl(getComputedStyle(node).direction === 'rtl')
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [portal, open, triggerRef])

  /* Kept in the document while the exit animation runs, so the panel leaves on
     the popover-exit role rather than vanishing in a frame (4.5, Select
     finding 11). `closing` is the panel on its way out: inert, so nothing in it
     takes a click or focus, and unmounted when its animation ends. When there
     is no animation to wait for (none declared, or a 0ms duration) it unmounts
     at once, which is also what happens in a test environment with no CSS.
     Reopening during the exit goes straight back to the enter animation. */
  const [closing, setClosing] = React.useState(false)
  const wasOpen = React.useRef(open)
  React.useLayoutEffect(() => {
    if (wasOpen.current && !open) setClosing(true)
    if (open) setClosing(false)
    wasOpen.current = open
  }, [open])

  React.useLayoutEffect(() => {
    if (!closing) return
    const node = panelRef.current
    const style = node ? getComputedStyle(node) : null
    const animated =
      !!style &&
      style.animationName !== '' &&
      style.animationName !== 'none' &&
      parseFloat(style.animationDuration || '0') > 0
    if (!animated) setClosing(false)
  }, [closing])

  /* Called here with the other hooks, above the early return. */
  const host = usePortalHost()

  if (!open && !closing) return null

  const cls = [
    styles.panel,
    styles[align],
    styles[placement],
    width === 'auto' ? '' : styles[`w-${width}`],
    className,
    portal ? styles.portalled : '',
  ]
    .filter(Boolean)
    .join(' ')

  /* Viewport coordinates, so the panel sits where the absolute rules would have
     put it: below or above the trigger, aligned to the edge `align` names. The
     width cases that read the ancestor's box read the trigger's instead, which
     is the same element the ancestor was wrapping. */
  const fixedStyle: React.CSSProperties | undefined = rect
    ? {
        position: 'fixed',
        top: placement === 'bottom' ? rect.bottom : undefined,
        bottom: placement === 'top' ? window.innerHeight - rect.top : undefined,
        // Which viewport edge the panel is pinned to: the trigger's left edge
        // when its alignment edge is on the left, otherwise its right edge.
        ...((align === 'end') === rtl ? { left: rect.left } : { right: window.innerWidth - rect.right }),
        /* The trigger's measured width replaces every percentage the panel
           would otherwise resolve against the wrong box.
           `width="trigger"` carries `min-inline-size: 100%` in the stylesheet,
           and a portalled panel is `position: fixed`, so that percentage
           resolves against the viewport. The minimum is therefore written from
           the rect whenever the width mode asks for one, and not only when
           `align` happens to leave the branch free: with `stretch` the old
           ternary set `inline-size` alone, the percentage survived, and the
           panel came out at least as wide as the viewport.
           `stretch` still sets the width outright where the width mode has no
           opinion. Where it does, the two agree about the trigger already and
           the mode's own growth is kept, so a panel that is too narrow for its
           content widens instead of overflowing: `.panel` has no `overflow`,
           so the alternative is content drawn outside its surface. For
           `width="trigger"` that growth is `.w-trigger`'s own
           `inline-size: max-content` under its `max-inline-size`, not
           `.panel`'s minimum, which `.w-trigger` overrides. */
        ...(width === 'trigger' ? { minInlineSize: rect.width } : {}),
        ...(align === 'stretch' && width !== 'trigger' ? { inlineSize: rect.width } : {}),
      }
    : { position: 'fixed', visibility: 'hidden' }

  const panel = (
    <div
      ref={setPanel}
      role={role}
      className={cls}
      style={portal ? fixedStyle : undefined}
      data-state={open ? 'open' : 'closed'}
      inert={!open || undefined}
      onAnimationEnd={e => {
        if (!open && e.target === e.currentTarget) setClosing(false)
      }}
      {...rest}
    >
      {children}
    </div>
  )

  /* `document.body` unless something above owns the page. Inside a Modal the
     host is the dialog, so the panel stays inside the focus trap: in the body
     the dialog's `focusin` handler takes focus off every control in it the
     moment it is given, and the panel cannot be used at all. Null means the
     host is not attached yet, and the panel waits a render rather than going to
     the body, which is the case that was broken. */
  if (portal) return host ? createPortal(panel, host) : null
  return panel
})
