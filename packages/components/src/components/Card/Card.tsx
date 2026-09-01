import React from 'react'
import styles from './Card.module.css'

export type CardVariant = 'default' | 'elevated' | 'outlined'

/**
 * The element a presentational component renders.
 *
 * Deliberately a plain `as` and not the generic-polymorphic kind that infers a
 * whole prop set from it. That pattern costs a page of conditional types, makes
 * every error message about the component unreadable, and buys type-safety for
 * props nobody passes to a Card. The two components that carry this are wrappers
 * around content: what a caller actually needs is for the element to be right in
 * the document outline, not for `href` to typecheck on an `<article>`.
 */
export type CardElement = 'div' | 'article' | 'section' | 'li' | 'aside'

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  padding?: boolean
  /**
   * The element to render. A card is often a list item or an article, and a
   * `<div>` in those places is a hole in the document outline that no styling
   * fixes.
   */
  as?: CardElement
}

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'default', padding = true, as: Element = 'div', className, children, ...rest },
  ref,
) {
  const cls = [
    styles.card,
    styles[variant],
    padding ? styles.padded : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    // The union of elements makes React's own ref type an intersection of all
    // of them, which nothing satisfies. HTMLElement is the honest type for a
    // component whose element the caller chooses.
    <Element ref={ref as React.Ref<never>} className={cls} {...rest}>
      {children}
    </Element>
  )
})
