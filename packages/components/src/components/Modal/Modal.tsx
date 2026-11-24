import React from 'react'
import { createPortal } from 'react-dom'
import type { Size } from '../../types'
import { IconButton } from '../IconButton'
import { PortalHostContext, usePortalHostValue } from '../../internal/portalHost'
import styles from './Modal.module.css'

export type ModalSize = Size | 'xl'

interface ModalBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'aria-label' | 'onClick'> {
  open: boolean
  onClose: () => void
  size?: ModalSize
  footer?: React.ReactNode
  /**
   * Where focus goes when the dialog opens. Defaults to the dialog itself, which
   * is safe and says nothing: a screen reader announces the dialog and the user
   * tabs from the top. Point it at the primary action when there is an obvious
   * one, or at the first field on a form.
   */
  initialFocus?: React.RefObject<HTMLElement | null>
  /**
   * Whether clicking the backdrop closes the dialog. On by default, and worth
   * turning off for anything destructive or anything holding unsaved input:
   * a misplaced click should not discard work, and there was no way to say so.
   */
  dismissOnBackdrop?: boolean
  /** Lands on the dialog rather than the backdrop, where `className` used to.
   *  Ruling B5 put `className` on the root, here the backdrop, and this is the
   *  named second target it asks for. */
  dialogClassName?: string
  /**
   * Where the dialog sits. `center` is a modal; `start` and `end` anchor it
   * to that edge, full height, which is what `Drawer` is. Logical, so `end`
   * is the right edge in a left-to-right page and the left in a right-to-left
   * one.
   */
  placement?: ModalPlacement
}

export type ModalPlacement = 'center' | 'start' | 'end'

/* A dialog with no accessible name is a dialog a screen reader announces as
   nothing. Either the visible heading names it, or an aria-label does, and the
   type says so rather than leaving it to a reviewer to notice. */
type ModalLabel = { title: string; 'aria-label'?: never } | { title?: undefined; 'aria-label': string }

export type ModalProps = ModalBaseProps & ModalLabel

/* Everything Tab can reach. tabindex="-1" is excluded deliberately: it is how an
   element says it is programmatically focusable but not in the tab order, which
   is what the dialog itself uses. */
const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(',')

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    'aria-label': ariaLabel,
    size = 'md',
    placement = 'center',
    footer,
    initialFocus,
    dismissOnBackdrop = true,
    className,
    dialogClassName,
    children,
    ...rest
  },
  ref,
) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  /**
   * Whether the press that is about to become a click started on the backdrop.
   *
   * A `click` event's target is the nearest common ancestor of its `pointerdown`
   * and its `pointerup`, so a press that begins inside the dialog and ends on
   * the backdrop dispatches a click whose target *is* the backdrop. Guarding
   * only the click therefore closes the dialog when someone selects text to the
   * edge of it and releases outside, which in a dialog holding unsaved work
   * discards it. haus#56, found by migrating core, whose own modal shell
   * carried this latch and haus did not.
   *
   * `pointerdown` rather than `mousedown` so pen and touch are covered without
   * relying on emulated mouse events.
   */
  const pressedBackdrop = React.useRef(false)
  /**
   * And whether the release that ends it was on the backdrop too.
   *
   * The latch above is not enough on its own, and the click target does not
   * close the gap. Press the backdrop and release just inside the dialog: the
   * click's target is the nearest common ancestor, which is the backdrop, so
   * `e.target === e.currentTarget` is true and the latch is already true, and
   * the dialog closed on a release that happened inside it. The mirror of
   * haus#56, which guarded only the other direction. Both endpoints are now
   * read where the click gave an answer for neither.
   */
  const releasedBackdrop = React.useRef(false)
  // The dialog is the node a caller wants: className already lands there, and
  // the focus trap needs the same element, so both refs are assigned rather
  // than one replacing the other.
  /* The dialog is also the host for anything a descendant portals, so the
     focus trap above keeps covering content that has left the dialog's DOM
     subtree for a Popover's sake. Held in state by `usePortalHostValue` rather
     than read off the ref, so a Popover rendering in the same commit sees it. */
  const [portalHost, setPortalHostElement] = usePortalHostValue()
  const setDialog = React.useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node
      setPortalHostElement(node)
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref, setPortalHostElement],
  )
  const titleId = React.useId()

  /* Escape closes, and Tab cycles within the dialog.
   *
   * aria-modal="true" tells assistive technology that the rest of the page is
   * inert. Nothing in the DOM enforces that on its own, so without the Tab
   * handling below the attribute is a claim the component does not keep: focus
   * walks straight out into the page behind. The focusin listener is the other
   * half, catching focus moved by anything other than Tab.
   *
   * An axe run cannot see either problem, which is why the assertion belongs in
   * the suite as a keyboard test rather than in the accessibility check. */
  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const root = dialogRef.current
      if (!root) return

      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !active || !root.contains(active) || active === root

      if (e.shiftKey ? active === first || outside : active === last || outside) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }

    const onFocusIn = (e: FocusEvent) => {
      const root = dialogRef.current
      if (root && !root.contains(e.target as Node)) root.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open, onClose])

  // Focus the dialog on open, restore on close
  React.useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    // The caller's target if it has one and it is actually in the document;
    // otherwise the dialog. A ref that has not attached yet would silently
    // focus nothing, which is worse than focusing the container.
    const target = initialFocus?.current
    if (target && target.isConnected) target.focus()
    else dialogRef.current?.focus()
    return () => {
      prev?.focus()
    }
  }, [open, initialFocus])

  /* Prevent body scroll when open, without moving the page. Hiding the
     overflow removes a visible scrollbar, and the page behind shifted sideways
     by its width (4.5, Modal finding 7). The gutter is reserved only when there
     was a scrollbar to lose: on a page with none, reserving one would shift it
     the other way. */
  React.useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const hadScrollbar = window.innerWidth > root.clientWidth
    const prev = document.body.style.overflow
    const prevGutter = root.style.scrollbarGutter
    if (hadScrollbar) root.style.scrollbarGutter = 'stable'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      root.style.scrollbarGutter = prevGutter
    }
  }, [open])

  /* Kept in the document while the exit runs, as Popover's, so the dialog
     leaves on dialog-exit rather than vanishing in a frame (finding 1). The
     backdrop's animation ends last in every mode, so it is the one listened
     for. Inert while closing; unmounted at once when nothing animates. */
  const [closing, setClosing] = React.useState(false)
  const wasOpen = React.useRef(open)
  const backdropRef = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (wasOpen.current && !open) setClosing(true)
    if (open) setClosing(false)
    wasOpen.current = open
  }, [open])
  React.useLayoutEffect(() => {
    if (!closing) return
    const node = backdropRef.current
    const style = node ? getComputedStyle(node) : null
    const animated =
      !!style &&
      style.animationName !== '' &&
      style.animationName !== 'none' &&
      parseFloat(style.animationDuration || '0') > 0
    if (!animated) setClosing(false)
  }, [closing])

  if (!open && !closing) return null

  const dialogCls = [styles.dialog, styles[size], dialogClassName].filter(Boolean).join(' ')

  return createPortal(
    // The backdrop's click is the pointer's way to dismiss. The keyboard's is
    // Escape, handled on the document above, so the backdrop takes no key events
    // and no role: it is not a control, and a screen reader should not find it.
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions
    <div
      ref={backdropRef}
      className={[styles.backdrop, className].filter(Boolean).join(' ')}
      data-placement={placement === 'center' ? undefined : placement}
      data-state={open ? 'open' : 'closed'}
      inert={!open || undefined}
      onAnimationEnd={e => {
        if (!open && e.target === e.currentTarget) setClosing(false)
      }}
      onPointerDown={
        dismissOnBackdrop
          ? e => {
              pressedBackdrop.current = e.target === e.currentTarget
              // A fresh press clears the previous release, so a press that
              // never completes cannot lend its answer to the next one.
              releasedBackdrop.current = false
            }
          : undefined
      }
      onPointerUp={
        dismissOnBackdrop
          ? e => {
              releasedBackdrop.current = e.target === e.currentTarget
            }
          : undefined
      }
      onClick={
        dismissOnBackdrop
          ? e => {
              // Both ends of the press have to be on the backdrop, read from
              // the press and the release themselves. The click's own target is
              // still checked: it rules out a click synthesised on a descendant
              // with no pointer sequence behind it, such as one from a keypress
              // on a control inside the dialog.
              const both = pressedBackdrop.current && releasedBackdrop.current && e.target === e.currentTarget
              // Reset first: a press that produces no qualifying click must not
              // leave a true behind for the next one.
              pressedBackdrop.current = false
              releasedBackdrop.current = false
              if (both) onClose()
            }
          : undefined
      }
    >
      <div
        ref={setDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={dialogCls}
        tabIndex={-1}
        {...rest}
      >
        {title && (
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {/* haus's own IconButton (finding 6), so the close is a 28px target
                with the outline focus and the press motion every icon action
                has. "Close": the dialog's name gives the context. */}
            <IconButton
              label="Close"
              variant="ghost"
              size="md"
              className={styles.close}
              onClick={onClose}
              icon={
                <svg viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        )}

        <div className={styles.body}>
          <PortalHostContext.Provider value={portalHost}>{children}</PortalHostContext.Provider>
        </div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
})
