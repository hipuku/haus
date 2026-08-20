import React from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?:    string
  hint?:     string
  error?:    string
  options?:  SelectOption[]
  required?: boolean
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, hint, error, options, required, placeholder, disabled, className, id, children, ...rest },
    ref
  ) {
    // Called unconditionally — see Checkbox for why.
    const generatedId = React.useId()
    const selectId  = id ?? generatedId
    const hintId    = hint  ? `${selectId}-hint`  : undefined
    const errorId   = error ? `${selectId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    const selectCls = [
      styles.select,
      error ? styles.error : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden>*</span>}
          </label>
        )}

        <div className={styles.selectWrap}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={selectCls}
            {...rest}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options
              ? options.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span className={styles.chevron} aria-hidden>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {hint  && !error && <span id={hintId}  className={styles.hint}>{hint}</span>}
        {error && <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>}
      </div>
    )
  }
)
