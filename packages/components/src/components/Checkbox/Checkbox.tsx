import React from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /**
   * `(checked, event)`. The boolean first because it is what a caller almost
   * always wants; the event second because without it there was no way to read
   * `event.target.name`, which is how a form with many checkboxes tells them
   * apart. Toggle and RadioGroup hand back the same pair.
   */
  onChange?:       (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
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
  const hintId     = hint  ? `${inputId}-hint`  : undefined
  const errorId    = error ? `${inputId}-error` : undefined
  // Both, in reading order, as Input and Select already do. The hint used to
  // sit inside the <label>, which made it part of the accessible *name*: a
  // screen reader announced "Accept terms Read them first, checkbox" as one
  // string rather than a name and a description.
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const isControlled = checked !== undefined

  // Internal state for uncontrolled usage, driving the visual box class
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isChecked = isControlled ? checked : internalChecked

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalChecked(e.target.checked)
    onChange?.(e.target.checked, e)
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
          // aria-required rather than the native attribute, as Input, Select,
          // Textarea and RadioGroup all do. These components own their error
          // display — there is an `error` prop and a role="alert" message — and
          // the native attribute brings the browser's own validation bubble,
          // which would fight it. Checkbox was the one doing the opposite.
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
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

        {label && (
          <span className={styles.content}>
            <span className={styles.label}>
              {label}
              {required && <span aria-hidden className={styles.required}>*</span>}
            </span>
          </span>
        )}
      </label>

      {/* Outside the label on purpose: anything inside it is read as part of the
          name. Indented to line up under the label text rather than under the box. */}
      {hint && !error && (
        <span id={hintId} className={styles.hint}>{hint}</span>
      )}

      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  )
})
