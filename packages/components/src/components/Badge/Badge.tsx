import React from 'react'
import styles from './Badge.module.css'

export type BadgeVariant    = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error'
export type BadgeAppearance = 'subtle'  | 'solid'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:    BadgeVariant
  appearance?: BadgeAppearance
  dot?:        boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant    = 'neutral',
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
    styles[variant],
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
