import React from 'react'
import type { Size } from '../../types'
import styles from './Divider.module.css'

export type DividerOrientation = 'horizontal' | 'vertical'

/**
 * How much room the rule asks for around itself.
 *
 * `stack` in the token layer is "space a component asks for around itself", so
 * a divider is the one component where that role is the whole point: the space
 * either side of a rule is not decoration, it is what makes the rule read as a
 * break rather than as an underline.
 */
export type DividerSpacing = 'none' | Size

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLHRElement>, 'children'> {
  orientation?: DividerOrientation
  spacing?: DividerSpacing
  /**
   * A rule that is only a rule.
   *
   * A separator between two groups is structure, and a screen reader should
   * announce it. A line drawn because a panel looked crowded is not, and
   * announcing it is noise. Nothing in the markup distinguishes them, so the
   * caller says which this is; the default is the meaningful one, because a
   * separator wrongly announced is a smaller failure than a structural break
   * that is invisible.
   */
  decorative?: boolean
}

/**
 * A rule between things.
 *
 * Always an `<hr>`, including when vertical. The element carries `separator`
 * implicitly and `aria-orientation` is valid on it, so there is no reason to
 * reach for a `<div role="separator">` and every reason not to: an `<hr>` is
 * still a break in a document read with styles off.
 *
 * vault has one of these; core and drift each write `border-top` inline
 * (haus#32). The component is one element and its value is not the element —
 * it is that the width, the colour and the space around it stop being decided
 * three times.
 */
export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = 'horizontal', spacing = 'md', decorative = false, className, ...rest },
  ref,
) {
  const cls = [
    styles.divider,
    styles[orientation],
    spacing !== 'none' ? styles[`space-${spacing}`] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <hr
      ref={ref}
      className={cls}
      // A decorative rule is removed from the tree entirely rather than given
      // role="presentation": an <hr> with a presentation role is still an <hr>
      // to some older combinations, and aria-hidden is unambiguous.
      aria-hidden={decorative || undefined}
      role={decorative ? 'presentation' : undefined}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      {...rest}
    />
  )
})
