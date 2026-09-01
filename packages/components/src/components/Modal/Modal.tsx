import React from 'react'
import { createPortal } from 'react-dom'
import type { Size } from '../../types'
import styles from './Modal.module.css'

export type ModalSize = Size

interface ModalBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'aria-label' | 'onClick'> {
  open:        boolean
  onClose:     () => void
  size?:       ModalSize
  footer?:     React.ReactNode
  /**
   * Where focus goes when the dialog opens. Defaults to the dialog itself, which
   * is safe and says nothing: a screen reader announces the dialog and the user
   * tabs from the top. Point it at the primary action when there is an obvious
   * one, or at the first field on a form.
   */
  initialFocus?: React.RefObject<HTMLElement | null>
  /**
   * Whether clicking the backdrop closes the dialog. On by default, and worth
   * turning off for anything destructive or anything holding unsaved input —
   * a misplaced click should not discard work, and there was no way to say so.
   */
  dismissOnBackdrop?: boolean
  /** Lands on the dialog rather than the backdrop, where `className` used to.
   *  Ruling B5 put `className` on the root — here the backdrop — and this is the
   *  named second target it asks for. */
  dialogClassName?: string
}

/* A dialog with no accessible name is a dialog a screen reader announces as
   nothing. Either the visible heading names it, or an aria-label does, and the
   type says so rather than leaving it to a reviewer to notice. */
type ModalLabel =
  | { title:  string;    'aria-label'?: never  }
  | { title?: undefined; 'aria-label':  string }

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
  // The dialog is the node a caller wants: className already lands there, and
  // the focus trap needs the same element, so both refs are assigned rather
  // than one replacing the other.
  const setDialog = React.useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
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
    return () => { prev?.focus() }
  }, [open, initialFocus])

  // Prevent body scroll when open
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const dialogCls = [
    styles.dialog,
    styles[size],
    dialogClassName,
  ].filter(Boolean).join(' ')

  return createPortal(
    <div
      className={[styles.backdrop, className].filter(Boolean).join(' ')}
      onClick={
        dismissOnBackdrop
          ? e => { if (e.target === e.currentTarget) onClose() }
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
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
})
