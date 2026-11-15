import React from 'react'
import { childRefOf, mergeRefs } from '../../internal/asChild'
import { SubmitStandIn } from '../../internal/submitStandIn'
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
  variant?: ButtonVariant
  /** What it means. `error` is what `variant="danger"` used to say. */
  tone?: ButtonTone
  size?: ButtonSize
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
export type ButtonOwnProps = ButtonBaseProps & {
  asChild?: false
  loading?: boolean
  /** Renders as an anchor when provided */
  href?: string
  target?: string
}

export type ButtonAsChildProps = ButtonBaseProps & {
  asChild: true
  loading?: never
  href?: never
  target?: never
  children: React.ReactElement
}

/**
 * The two halves are exported by name because a union is hard to accept and
 * easy to produce, and a wrapper component has to accept one.
 *
 * `function Submit(p: ButtonProps) { return <Button {...p} /> }` does not
 * compile. The compiler cannot rule out the `asChild` branch, whose `children`
 * is a single `React.ReactElement`, so a wrapper that renders an icon beside a
 * label is rejected **even though it never passes `asChild` and could not**.
 *
 * core hit this on both of its wrappers and wrote
 * `Extract<ButtonProps, { asChild?: false }>` to get out. That is the right
 * meaning: a wrapper is a button, never a cloned child. It is also a type this
 * package should have shipped rather than every consumer rediscovering the same
 * `Extract`. `ButtonOwnProps` is that type with a name. haus#66.
 */
export type ButtonProps = ButtonOwnProps | ButtonAsChildProps

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = 'primary',
    tone = 'neutral',
    size = 'md',
    external = false,
    disabled,
    children,
    className,
    ...rest
  } = props
  // Read off the union rather than destructured above: the `asChild` half
  // types them as `never`, and a default in the pattern would widen it back.
  const asChild = props.asChild === true
  const loading = props.asChild === true ? false : (props.loading ?? false)
  const href = props.asChild === true ? undefined : props.href
  const target = props.asChild === true ? undefined : props.target
  // `rest` still holds the discriminant and the props read off the union, and
  // every one of them would land on the DOM as an unknown attribute.
  const {
    asChild: _asChild,
    loading: _loading,
    href: _href,
    target: _target,
    ...domProps
  } = rest as Record<string, unknown>

  const cls = [
    styles.button,
    styles[variant],
    tone !== 'neutral' ? styles[tone] : '',
    external ? styles.external : '',
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const isDisabled = disabled || loading

  const externalIcon = external ? (
    <span className={styles.externalIcon} aria-hidden="true">
      ↗
    </span>
  ) : null

  if (asChild) {
    const child = React.Children.only(children as React.ReactElement)
    const childProps = child.props as { className?: string }
    const childRef = childRefOf(child)
    // A disabled child is the caller's element, often a router's link, so its
    // href stays and no click handler is added: a function prop on a host
    // element throws in a Server Component (decision 0024). It leaves the tab
    // order, says it is disabled, loses every click handler, the caller's and
    // the child's own (cloneElement keeps any prop the override leaves out, so
    // each is set to undefined, which adds nothing), and the
    // [aria-disabled='true'] rule in the stylesheet stops the pointer.
    const { onClick, onClickCapture, ...childDomProps } = domProps
    return React.cloneElement(
      child,
      {
        // Button's classes first so the child's own className wins a
        // collision: the caller is closer to the problem than the system is.
        className: [cls, childProps.className].filter(Boolean).join(' '),
        ref: mergeRefs(ref as React.Ref<unknown>, childRef),
        ...childDomProps,
        ...((disabled
          ? { 'aria-disabled': true, tabIndex: -1, onClick: undefined, onClickCapture: undefined }
          : { ...(onClick ? { onClick } : {}), ...(onClickCapture ? { onClickCapture } : {}) }) as Record<
          string,
          unknown
        >),
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
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...(domProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        // Withheld as on the button below, so a disabled or loading link runs
        // none of the caller's click handlers either.
        onClick={isDisabled ? undefined : (domProps.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined)}
        onClickCapture={
          isDisabled ? undefined : (domProps.onClickCapture as React.MouseEventHandler<HTMLAnchorElement> | undefined)
        }
      >
        {loading && <Spinner size="text" announcedBy="the button's aria-busy state" />}
        {children}
        {externalIcon}
      </a>
    )
  }

  /* Loading blocks the button without the native attribute. A button that
     becomes disabled while focused drops focus to the document, and the
     keyboard user who just pressed Save loses their place. Instead it stops
     being a submit button, so neither a click nor Enter can send its form
     twice, and the caller's onClick and onClickCapture are withheld: the
     pointer rule cannot stop Enter or Space on a focused button, and a
     capture handler runs before onClick would. Nothing is attached that the
     caller did not pass, so a Server Component can still render it. The
     stylesheet's [aria-disabled='true'] rule stops the pointer. A button with
     no type submits, so unless the caller said otherwise a hidden disabled
     submit button stands in for it while it loads, and Enter in a one-field
     form submits nothing either (internal/submitStandIn). */
  const buttonProps = domProps as React.ButtonHTMLAttributes<HTMLButtonElement>
  const standIn = loading && (buttonProps.type ?? 'submit') === 'submit'
  const button = (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cls}
      disabled={disabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...buttonProps}
      {...(loading ? { type: 'button' as const } : {})}
      onClick={loading ? undefined : buttonProps.onClick}
      onClickCapture={loading ? undefined : buttonProps.onClickCapture}
    >
      {loading && <Spinner size="text" announcedBy="the button's aria-busy state" />}
      {children}
      {externalIcon}
    </button>
  )
  return standIn ? (
    <>
      {button}
      <SubmitStandIn form={buttonProps.form} />
    </>
  ) : (
    button
  )
})
