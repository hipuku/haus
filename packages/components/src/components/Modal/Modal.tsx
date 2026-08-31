import React from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg'

interface ModalBaseProps {
  open:        boolean
  onClose:     () => void
  size?:       ModalSize
  footer?:     React.ReactNode
  className?:  string
  children?:   React.ReactNode
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

export function Modal({
  open,
  onClose,
  title,
  'aria-label': ariaLabel,
  size = 'md',
  footer,
  className,
  children,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
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
    dialogRef.current?.focus()
    return () => { prev?.focus() }
  }, [open])

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
    className,
  ].filter(Boolean).join(' ')

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={dialogCls}
        tabIndex={-1}
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
}
