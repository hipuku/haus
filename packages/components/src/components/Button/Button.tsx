import React from 'react'
import type { Size, Tone } from '../../types'
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
 * Button implements two of the five tones, because two are what it has designs
 * for. Narrowing the shared union is the honest move; inventing an info,
 * success and warning button to satisfy a type would be design by type error.
 */
export type ButtonTone = Extract<Tone, 'neutral' | 'error'>

export type ButtonSize = Size

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  /** What it means. `error` is what `variant="danger"` used to say. */
  tone?:     ButtonTone
  size?:     ButtonSize
  /** Opens elsewhere: appends the glyph and, with `href`, is the honest signal
   *  that the destination leaves this app. Behaviour, so not a variant. */
  external?: boolean
  loading?:  boolean
  /** Renders as an anchor when provided */
  href?:     string
  target?:   string
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant  = 'primary',
      tone     = 'neutral',
      size     = 'md',
      external = false,
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
      tone !== 'neutral' ? styles[tone] : '',
      external ? styles.external : '',
      styles[size],
      className,
    ].filter(Boolean).join(' ')

    const isDisabled = disabled || loading

    const externalIcon = external
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
