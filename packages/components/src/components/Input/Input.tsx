import React from 'react'
import styles from './Input.module.css'

/* `size` is omitted rather than shadowed. The native attribute counts characters
   or rows, which is not what `size` means anywhere else in this system, and a
   prop that means one thing here and another everywhere else is worse than an
   absent one. There is no replacement yet: `sm` and `lg` text controls are a
   design that does not exist. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?:        string
  hint?:         string
  error?:        string
  prefix?:       React.ReactNode
  suffix?:       React.ReactNode
  required?:     boolean
  /** Lands on the field itself rather than the root, for the cases where the
   *  control needs styling and the block around it does not. Ruling B5 put
   *  `className` on the root of every component; this is the named second
   *  target that rule asks for rather than redirecting the one everyone
   *  expects. */
  controlClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, hint, error, prefix, suffix, required, disabled, className, controlClassName, id, ...rest },
    ref
  ) {
    // Called unconditionally. See Checkbox for why.
    const generatedId = React.useId()
    const inputId   = id ?? generatedId
    const hintId    = hint  ? `${inputId}-hint`  : undefined
    const errorId   = error ? `${inputId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    const wrapCls = [
      styles.inputWrap,
      error    ? styles.error    : '',
      disabled ? styles.disabled : '',
      controlClassName,
    ].filter(Boolean).join(' ')

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
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
