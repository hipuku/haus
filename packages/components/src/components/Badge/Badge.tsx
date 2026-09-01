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

/** See `CardElement` for why this is a plain union rather than generic polymorphism. */
export type BadgeElement = 'span' | 'output' | 'dd' | 'li'

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  tone?:       BadgeTone
  appearance?: BadgeAppearance
  dot?:        boolean
  /** The element to render. A count in a definition list or a live result is a
   *  `<dd>` or an `<output>`, not a `<span>`. */
  as?:         BadgeElement
}

export const Badge = React.forwardRef<HTMLElement, BadgeProps>(function Badge(
  {
    tone       = 'neutral',
    appearance = 'subtle',
    dot        = false,
    as: Element = 'span',
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
    <Element ref={ref as React.Ref<never>} className={cls} {...rest}>
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </Element>
  )
})
