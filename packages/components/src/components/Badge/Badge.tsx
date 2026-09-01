import React from 'react'
import type { Appearance, Tone } from '../../types'
import styles from './Badge.module.css'

/**
 * Badge carries one tone beyond the shared vocabulary: `primary`, the brand
 * itself, which is a look rather than a meaning and has no equivalent on Toast.
 * Kept because a brand-coloured badge is a real thing a consumer wants and
 * removing it would be a loss dressed as consistency.
 */
export type BadgeTone = Tone | 'primary'

/** @deprecated Renamed to `BadgeTone` in 1.0. `variant` meant semantics here and
 *  visual weight on Button; ruling A5 split the two. */
export type BadgeVariant = BadgeTone
export type BadgeAppearance = Appearance

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?:       BadgeTone
  appearance?: BadgeAppearance
  dot?:        boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone       = 'neutral',
    appearance = 'subtle',
    dot        = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const cls = [
    styles.badge,
    styles[tone],
    styles[appearance],
    className,
  ].filter(Boolean).join(' ')

  return (
    <span ref={ref} className={cls} {...rest}>
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  )
})
