import React from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'text'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  /** Renders as an anchor when provided */
  href?:     string
  target?:   string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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

    if (href) {
      return (
        <a
          href={href}
          target={target}
          className={cls}
          aria-disabled={disabled || loading}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {loading && <span className={styles.spinner} aria-hidden />}
          {children}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...rest}
      >
        {loading && <span className={styles.spinner} aria-hidden />}
        {children}
      </button>
    )
  }
)
