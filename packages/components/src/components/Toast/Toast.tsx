import React from 'react'
import styles from './Toast.module.css'

export type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

const ICONS: Record<ToastVariant, string> = {
  neutral: 'fa-solid fa-circle-info',
  info:    'fa-solid fa-circle-info',
  success: 'fa-solid fa-circle-check',
  warning: 'fa-solid fa-triangle-exclamation',
  error:   'fa-solid fa-circle-xmark',
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
      <i className={[ICONS[variant], styles.icon].join(' ')} aria-hidden="true" />

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
