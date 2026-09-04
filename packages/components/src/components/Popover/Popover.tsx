import React from 'react'
import styles from './Popover.module.css'

/** Which edge of the trigger the panel lines up with. */
export type PopoverAlign = 'start' | 'end' | 'stretch'

/** Which side of the trigger the panel sits on. */
export type PopoverPlacement = 'bottom' | 'top'

/**
 * How wide the panel is.
 *
 * `trigger` matches the anchor, which is what a select-like menu wants; `auto`
 * takes its content's width, which is what a small action menu wants. The three
 * fixed steps are for panels holding a form.
 */
export type PopoverWidth = 'auto' | 'trigger' | 'sm' | 'md' | 'lg'

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
   * menu with Escape drops focus onto `<body>` — the keyboard user is back at
   * the top of the document with no way to know it moved.
   */
  triggerRef: React.RefObject<HTMLElement | null>
  align?: PopoverAlign
  placement?: PopoverPlacement
  width?: PopoverWidth
  role?: PopoverRole
}

/* A panel a screen reader announces as nothing is a panel that may as well not
   have a role. Either it points at its own heading or it carries a label, and
   the type says so rather than leaving it to a reviewer. Same shape as Modal. */
type PopoverLabel =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string }

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
   * removed from the document, and the browser's fallback is `<body>` — so the
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
   * Deliberately not a focus trap, which is what Modal has. A modal is modal —
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

  if (!open) return null

  const cls = [
    styles.panel,
    styles[align],
    styles[placement],
    width === 'auto' ? '' : styles[`w-${width}`],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={setPanel} role={role} className={cls} {...rest}>
      {children}
    </div>
  )
})
