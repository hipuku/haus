import React from 'react'
import styles from './Avatar.module.css'

export type AvatarSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline'

export interface AvatarProps {
  src?:    string
  alt?:    string
  name?:   string
  size?:   AvatarSize
  status?: AvatarStatus
  className?: string
}

const PALETTE: Array<[string, string]> = [
  ['var(--color-primary-subtle)',  'var(--color-primary-on-subtle)'],
  ['var(--color-info-subtle)',     'var(--color-info-on-subtle)'],
  ['var(--color-success-subtle)',  'var(--color-success-on-subtle)'],
  ['var(--color-warning-subtle)',  'var(--color-warning-on-subtle)'],
  ['var(--color-error-subtle)',    'var(--color-error-on-subtle)'],
]

function nameHash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0
  }
  return h % PALETTE.length
}

function initials(name: string): string {
  // `''` and `'   '` both split to [''], so indexing [0][0] gave undefined and
  // .toUpperCase() threw — an avatar for a user whose name had not loaded yet
  // took the page down rather than rendering a blank circle.
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ src, alt, name, size = 'md', status, className }: AvatarProps) {
  const [bg, fg] = name ? PALETTE[nameHash(name)] : PALETTE[0]

  const wrapperCls = [styles.wrapper, styles[size], className].filter(Boolean).join(' ')
  const statusLabel = status ? `, ${status}` : ''

  return (
    <div className={wrapperCls}>
      <div
        className={styles.avatar}
        style={!src ? { '--avatar-bg': bg, '--avatar-fg': fg } as React.CSSProperties : undefined}
        role="img"
        aria-label={alt ?? (name ? `${name}${statusLabel}` : 'Avatar')}
      >
        {src ? (
          <img src={src} alt="" className={styles.image} />
        ) : name ? (
          <span aria-hidden>{initials(name)}</span>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" width="60%" height="60%">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        )}
      </div>
      {status && (
        <span
          className={[styles.status, styles[status]].join(' ')}
          aria-hidden
        />
      )}
    </div>
  )
}
