import React from 'react'
import { childRefOf, mergeRefs } from '../../internal/asChild'
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

interface CardBaseProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  padding?: boolean
}

export type CardOwnProps = CardBaseProps & {
  asChild?: false
  /**
   * The element to render. A card is often a list item or an article, and a
   * `<div>` in those places is a hole in the document outline that no styling
   * fixes.
   */
  as?: CardElement
}

export type CardAsChildProps = CardBaseProps & {
  asChild: true
  as?: never
  children: React.ReactElement
}

/**
 * `as` and `asChild` are both here, and they are not the same tool twice.
 *
 * Decision 0022: a component owns its box and never its element. `as` covers
 * the cases it was built for, where the right element is a plain intrinsic one
 * and the reason is the document outline: `article`, `li`, `section`, `aside`.
 * A closed union is enough there, and the comment above on `CardElement` is
 * still the argument against making it generic.
 *
 * **`asChild` covers what `as` cannot reach**: a clickable card that is a router
 * link. `as="a"` would render haus's anchor, and the whole point is that Next's
 * `Link` is the thing that must render. Widening `CardElement` to every element
 * name would not help either, because the element is not the caller's problem;
 * the *component* is.
 *
 * They are mutually exclusive, because the child supplies the element and `as`
 * names one. Decision 0023 is why the halves are exported.
 */
export type CardProps = CardOwnProps | CardAsChildProps

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(props, ref) {
  const { variant = 'default', padding = true, className, children, ...rest } = props

  // Read off the union rather than destructured above: the `asChild` half types
  // `as` as `never`, and a default in the pattern would widen it back.
  const asChild = props.asChild === true
  const Element = props.asChild === true ? 'div' : props.as ?? 'div'

  // `rest` still holds the discriminant and the prop read off the union, and
  // both would land on the DOM as unknown attributes.
  const { asChild: _asChild, as: _as, ...domProps } = rest as Record<string, unknown>

  const cls = [
    styles.card,
    styles[variant],
    padding ? styles.padded : '',
    className,
  ].filter(Boolean).join(' ')

  if (asChild) {
    const child = React.Children.only(props.children as React.ReactElement)
    const childProps = child.props as { className?: string; children?: React.ReactNode }
    return React.cloneElement(
      child,
      {
        // Card's classes first so the child's own className wins a collision:
        // the caller is closer to the problem than the system is.
        className: [cls, childProps.className].filter(Boolean).join(' '),
        ref: mergeRefs(ref as React.Ref<unknown>, childRefOf(child)),
        ...domProps,
      } as Partial<unknown> & React.Attributes,
      // The child keeps its own children. A Card is a wrapper around content
      // and the content is the caller's, which is the opposite of IconButton,
      // where the component supplies the only child it has.
      childProps.children,
    )
  }

  return (
    // The union of elements makes React's own ref type an intersection of all
    // of them, which nothing satisfies. HTMLElement is the honest type for a
    // component whose element the caller chooses.
    <Element ref={ref as React.Ref<never>} className={cls} {...domProps}>
      {children}
    </Element>
  )
})
