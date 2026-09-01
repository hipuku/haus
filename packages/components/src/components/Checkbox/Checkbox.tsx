import React from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /** `(checked)` rather than the change event, as Toggle also gives. */
  onChange?:       (checked: boolean) => void
  label?:          string
  hint?:           string
  error?:          string
  indeterminate?:  boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    indeterminate = false,
    onChange,
    label,
    hint,
    error,
    disabled,
    required,
    id,
    name,
    value,
    className,
    ...rest
  },
  ref,
) {
  const inputRef   = React.useRef<HTMLInputElement>(null)
  // The internal ref drives `indeterminate`, which has no attribute and can
  // only be set on the node. A caller's ref has to reach the same node, so
  // both are assigned rather than one replacing the other.
  const setInput = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )
  // useId must be called unconditionally: `id ?? React.useId()` skips the
  // hook whenever an id is passed, so a parent that renders this component
  // with and without one changes the hook count between renders.
  const generatedId = React.useId()
  const inputId    = id ?? generatedId
  const errorId    = error ? `${inputId}-error` : undefined
  const isControlled = checked !== undefined

  // Internal state for uncontrolled usage, driving the visual box class
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isChecked = isControlled ? checked : internalChecked

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalChecked(e.target.checked)
    onChange?.(e.target.checked)
  }

  const wrapperCls = [
    styles.wrapper,
    isChecked    ? styles.checked      : '',
    indeterminate ? styles.indeterminate : '',
    error        ? styles.error        : '',
    disabled     ? styles.disabled     : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div>
      <label className={wrapperCls} htmlFor={inputId}>
        <input
          ref={setInput}
          type="checkbox"
          id={inputId}
          name={name}
          value={value}
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={styles.input}
          onChange={handleChange}
          {...rest}
        />
        <span className={styles.box} aria-hidden>
          {indeterminate ? (
            <svg width="8" height="2" viewBox="0 0 8 2" fill="none" className={styles.icon}>
              <rect width="8" height="2" rx="1" fill="currentColor"/>
            </svg>
          ) : isChecked ? (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className={styles.icon}>
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : null}
        </span>

        {(label || hint) && (
          <span className={styles.content}>
            {label && (
              <span className={styles.label}>
                {label}
                {required && <span aria-hidden className={styles.required}>*</span>}
              </span>
            )}
            {hint && !error && <span className={styles.hint}>{hint}</span>}
          </span>
        )}
      </label>

      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  )
})
