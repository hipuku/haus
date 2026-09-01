import React from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string
  hint?:     string
  error?:    string
  required?: boolean
  /** Lands on the field itself rather than the root, for the cases where the
   *  control needs styling and the block around it does not. Ruling B5 put
   *  `className` on the root of every component; this is the named second
   *  target that rule asks for rather than redirecting the one everyone
   *  expects. */
  controlClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, required, disabled, className, controlClassName, id, ...rest },
    ref
  ) {
    // Called unconditionally. See Checkbox for why.
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const hintId     = hint  ? `${textareaId}-hint`  : undefined
    const errorId    = error ? `${textareaId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    const textareaCls = [
      styles.textarea,
      error ? styles.error : '',
      controlClassName,
    ].filter(Boolean).join(' ')

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={textareaCls}
          {...rest}
        />

        {hint  && !error && <span id={hintId}  className={styles.hint}>{hint}</span>}
        {error && <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>}
      </div>
    )
  }
)
