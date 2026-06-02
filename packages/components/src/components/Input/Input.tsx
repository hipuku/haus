import React from 'react'
import styles from './Input.module.css'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?:        string
  hint?:         string
  error?:        string
  prefix?:       React.ReactNode
  suffix?:       React.ReactNode
  required?:     boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, hint, error, prefix, suffix, required, disabled, className, id, ...rest },
    ref
  ) {
    const inputId   = id ?? React.useId()
    const hintId    = hint  ? `${inputId}-hint`  : undefined
    const errorId   = error ? `${inputId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    const wrapCls = [
      styles.inputWrap,
      error    ? styles.error    : '',
      disabled ? styles.disabled : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden>*</span>}
          </label>
        )}

        <div className={wrapCls}>
          {prefix && <span className={styles.adornment}>{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={styles.input}
            {...rest}
          />
          {suffix && <span className={styles.adornment}>{suffix}</span>}
        </div>

        {hint  && !error && <span id={hintId}  className={styles.hint}>{hint}</span>}
        {error && <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>}
      </div>
    )
  }
)
