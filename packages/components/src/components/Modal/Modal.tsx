import React from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open:        boolean
  onClose:     () => void
  title?:      string
  size?:       ModalSize
  footer?:     React.ReactNode
  className?:  string
  children?:   React.ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  className,
  children,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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
        aria-modal
        aria-label={title}
        className={dialogCls}
        tabIndex={-1}
      >
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
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
