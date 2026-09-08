import React from 'react'
import type { Size, Tone } from '../../types'
import { Spinner } from '../Spinner'
import styles from './Button.module.css'

/**
 * Visual weight, and nothing else. Ruling A5.
 *
 * `danger` left this union because it was a meaning rather than a weight, and
 * it is `tone="error"` now — the same word Badge and Toast already used.
 * `external` left because it was behaviour plus a glyph rather than a look.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text'

/**
 * All five tones. The narrowing this replaced was written on the
 * premise that the other three had no design, and the premise was wrong:
 * `semantics.css` already carried the full six-role set for info, success and
 * warning — including the `solid` roles that exist precisely because those two
 * 500s fail with white ink — and Badge already spent every one of them. The
 * design was specified; only Button had not adopted it.
 */
export type ButtonTone = Tone

export type ButtonSize = Size

interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  /** What it means. `error` is what `variant="danger"` used to say. */
  tone?:     ButtonTone
  size?:     ButtonSize
  /** Opens elsewhere: appends the glyph and, with `href`, is the honest signal
   *  that the destination leaves this app. Behaviour, so not a variant. */
  external?: boolean
}

/**
 * The two ways Button can render, kept apart by the type so the combinations
 * that have no meaning cannot be written.
 *
 * `asChild` renders the single child element with Button's own class merged in,
 * rather than rendering a `<button>` or an `<a>`. It exists because a router's
 * link is a component, not an element: Next's `Link`, React Router's `Link` and
 * TanStack's all need to be the thing that renders, and `href` cannot reach
 * them. haus#57 was filed when core's five navigation buttons could not move
 * without losing client-side navigation and prefetch.
 *
 * Deliberately `asChild` and not a polymorphic `as`. Card's `as` is a union of
 * intrinsic element names and says why: the generic-polymorphic kind "costs a
 * page of conditional types, makes every error message about the component
 * unreadable". Cloning one child needs none of that and takes components as
 * well as elements.
 *
 * `loading` is absent from the `asChild` half, so `<Button asChild loading>` is
 * a compile error rather than a silent nothing. A spinner would be a second
 * child, which `asChild` has nowhere to put, and the state it announces is a
 * form submitting: a link has no such state, and `aria-busy` on an anchor
 * describes a wait that will never end. `href` and `target` are absent for the
 * same reason: the child carries its own destination.
 */
export type ButtonProps =
  | (ButtonBaseProps & {
      asChild?: false
      loading?: boolean
      /** Renders as an anchor when provided */
      href?:    string
      target?:  string
    })
  | (ButtonBaseProps & {
      asChild:  true
      loading?: never
      href?:    never
      target?:  never
      children: React.ReactElement
    })

/**
 * Applies a node to however many refs were aimed at it.
 *
 * `asChild` has two: the one the caller put on `<Button>` and the one they put
 * on the child. Cloning with only Button's silently discards the child's, which
 * is what the ref test caught. Neither is more entitled than the other, so both
 * are called.
 *
 * React 19 passes `ref` as an ordinary prop and React 18 keeps it on the
 * element, and this package's peer range allows both, so the child's ref is
 * read from whichever place holds it.
 */
function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> | undefined {
  const real = refs.filter(Boolean)
  /* Nothing to merge means no ref at all, not a callback that does nothing.
     A ref is illegal in a Server Component, and `asChild` is the one path that
     could attach one without being asked: core renders `<Button asChild>` from
     two server pages, where neither Button nor the child has a ref, and an
     unconditional callback made both throw "Refs cannot be used in Server
     Components". haus#71. */
  if (real.length === 0) return undefined
  return (node) => {
    for (const ref of real) {
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    props,
    ref
  ) {
    const {
      variant  = 'primary',
      tone     = 'neutral',
      size     = 'md',
      external = false,
      disabled,
      children,
      className,
      ...rest
    } = props
    // Read off the union rather than destructured above: the `asChild` half
    // types them as `never`, and a default in the pattern would widen it back.
    const asChild = props.asChild === true
    const loading = props.asChild === true ? false : props.loading ?? false
    const href    = props.asChild === true ? undefined : props.href
    const target  = props.asChild === true ? undefined : props.target
    // `rest` still holds the discriminant and the props read off the union, and
    // every one of them would land on the DOM as an unknown attribute.
    const {
      asChild: _asChild,
      loading: _loading,
      href:    _href,
      target:  _target,
      ...domProps
    } = rest as Record<string, unknown>

    const cls = [
      styles.button,
      styles[variant],
      tone !== 'neutral' ? styles[tone] : '',
      external ? styles.external : '',
      styles[size],
      className,
    ].filter(Boolean).join(' ')

    const isDisabled = disabled || loading

    const externalIcon = external
      ? <span className={styles.externalIcon} aria-hidden="true">↗</span>
      : null

    if (asChild) {
      const child = React.Children.only(children as React.ReactElement)
      const childProps = child.props as { className?: string; ref?: React.Ref<unknown> }
      // React 19 puts the child's ref in props; React 18 keeps it on the
      // element. The peer range allows both, so look in both.
      const childRef =
        childProps.ref ?? (child as unknown as { ref?: React.Ref<unknown> }).ref
      return React.cloneElement(
        child,
        {
          // Button's classes first so the child's own className wins a
          // collision: the caller is closer to the problem than the system is.
          className: [cls, childProps.className].filter(Boolean).join(' '),
          ref: mergeRefs(ref as React.Ref<unknown>, childRef),
          ...domProps,
        } as Partial<unknown> & React.Attributes,
        // The child keeps its own children, and the glyph is appended after
        // them, which is where the other two branches put it too.
        ...(external
          ? [(child.props as { children?: React.ReactNode }).children, externalIcon]
          : [(child.props as { children?: React.ReactNode }).children]),
      )
    }

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          // An anchor has no disabled state, and aria-disabled alone announces
          // one without creating it: the link stayed focusable and still
          // navigated. Dropping href is what actually disables it — the element
          // is then neither focusable nor activatable — so role and tabIndex
          // put back the two things href was carrying.
          href={isDisabled ? undefined : href}
          role={isDisabled ? 'link' : undefined}
          tabIndex={isDisabled ? -1 : undefined}
          target={isDisabled ? undefined : target}
          rel={!isDisabled && target === '_blank' ? 'noopener noreferrer' : undefined}
          className={cls}
          aria-disabled={isDisabled}
          aria-busy={loading || undefined}
          {...(domProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {loading && <Spinner size="text" announcedBy="the button's aria-busy state" />}
          {children}
          {externalIcon}
        </a>
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        {...(domProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {loading && <Spinner size="text" announcedBy="the button's aria-busy state" />}
        {children}
        {externalIcon}
      </button>
    )
  }
)
