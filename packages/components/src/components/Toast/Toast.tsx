import React from 'react'
import styles from './Toast.module.css'

export type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

/* Drawn here rather than named as icon-font classes. The package declares
   haus-tokens and the two React peers and nothing else, so a consumer without
   Font Awesome loaded used to get an empty element where the severity
   indicator belongs, with no error to say why. These are the same stroke
   idiom as the dismiss button below: currentColor, 1.5 units, round caps, so
   the .icon colour rules keep working unchanged. */
const ICONS: Record<ToastVariant, React.ReactNode> = {
  neutral: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.9v.1" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.9v.1" />
    </>
  ),
  success: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.4 8.2l1.9 1.9 3.3-3.9" />
    </>
  ),
  warning: (
    <>
      <path d="M8 1.9L15 14.1H1L8 1.9Z" />
      <path d="M8 6.2v3.4" />
      <path d="M8 11.7v.1" />
    </>
  ),
  error: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M6 6l4 4M10 6l-4 4" />
    </>
  ),
}

export interface ToastProps {
  variant?:     ToastVariant
  title:        string
  description?: string
  action?:      React.ReactNode
  onClose?:     () => void
  className?:   string
}

export function Toast({
  variant     = 'neutral',
  title,
  description,
  action,
  onClose,
  className,
}: ToastProps) {
  const cls = [
    styles.toast,
    styles[variant],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} role="status" aria-live="polite" aria-atomic>
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[variant]}
      </svg>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {action && <div className={styles.action}>{action}</div>}
        </div>
        {description && <span className={styles.description}>{description}</span>}
      </div>

      {onClose && (
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}
