import React from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

/* `size` is omitted rather than shadowed. The native attribute counts characters
   or rows, which is not what `size` means anywhere else in this system, and a
   prop that means one thing here and another everywhere else is worse than an
   absent one. There is no replacement yet: `sm` and `lg` text controls are a
   design that does not exist. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?:    string
  hint?:     string
  error?:    string
  options?:  SelectOption[]
  required?: boolean
  /** Lands on the field itself rather than the root, for the cases where the
   *  control needs styling and the block around it does not. Ruling B5 put
   *  `className` on the root of every component; this is the named second
   *  target that rule asks for rather than redirecting the one everyone
   *  expects. */
  controlClassName?: string
  placeholder?: string
}

/**
 * A native `<select>` in haus's clothing.
 *
 * The closed control is fully themed: `appearance: none`, then this system's own
 * border, radius, chevron and focus ring. **The open list is not, and cannot be.**
 * The popup is drawn by the operating system and no CSS reaches inside it, so it
 * will look like the platform rather than like haus.
 *
 * That is the trade rather than an omission, and it is the reason this is still a
 * `<select>`: the platform gives back free keyboard handling, a wheel picker on
 * iOS, and assistive-technology behaviour that a custom listbox has to reimplement
 * and keep correct. See `docs/decisions/0011-select-is-a-native-select.md`.
 *
 * If you need the list itself styled, this is the wrong component and haus does
 * not yet ship the right one.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, hint, error, options, required, placeholder, disabled, className, controlClassName, id, children, ...rest },
    ref
  ) {
    // Called unconditionally. See Checkbox for why.
    const generatedId = React.useId()
    const selectId  = id ?? generatedId
    const hintId    = hint  ? `${selectId}-hint`  : undefined
    const errorId   = error ? `${selectId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    const selectCls = [
      styles.select,
      error ? styles.error : '',
      controlClassName,
    ].filter(Boolean).join(' ')

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
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
