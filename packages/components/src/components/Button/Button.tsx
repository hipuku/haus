import React from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'text' | 'external'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  /** Renders as an anchor when provided */
  href?:     string
  target?:   string
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant  = 'primary',
      size     = 'md',
      loading  = false,
      disabled,
      href,
      target,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const cls = [
      styles.button,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ')

    const isDisabled = disabled || loading

    const externalIcon = variant === 'external'
      ? <span className={styles.externalIcon} aria-hidden="true">↗</span>
      : null

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
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {loading && <span className={styles.spinner} aria-hidden />}
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
        {...rest}
      >
        {loading && <span className={styles.spinner} aria-hidden />}
        {children}
        {externalIcon}
      </button>
    )
  }
)
