import React from 'react'
import styles from './Radio.module.css'

export interface RadioOption {
  value:     string
  label:     string
  hint?:     string
  disabled?: boolean
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** `(value, event)`, matching Checkbox and Toggle. The value first because a
   *  group has no single control and the value is the whole point; the event
   *  second so `event.target.name` is reachable. */
  onChange?:   (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  name:        string
  value?:      string
  defaultValue?: string
  options:     RadioOption[]
  label?:      string
  error?:      string
  required?:   boolean
  orientation?: 'vertical' | 'horizontal'
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    name,
    value,
    defaultValue,
    onChange,
    options,
    label,
    error,
    required,
    orientation = 'vertical',
    className,
    ...rest
  },
  ref,
) {
  const groupId = React.useId()
  const errorId = error ? `${groupId}-error` : undefined

  // Internal state for uncontrolled usage, as Checkbox and Toggle already do.
  // Without it `isChecked` was derived from `value ?? defaultValue` and never
  // moved: the native input flipped, because the browser owns that, while the
  // drawn dot stayed on whatever `defaultValue` was. The visible control and
  // the real one disagreed for the whole life of the component.
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const selected = isControlled ? value : internalValue

  function handleChange(next: string, event: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(next)
    onChange?.(next, event)
  }

  const optionsCls = [
    styles.options,
    orientation === 'horizontal' ? styles.horizontal : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={errorId}
      aria-required={required}
      aria-invalid={!!error}
      className={[styles.group, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {label && (
        <span id={`${groupId}-label`} className={styles.groupLabel}>
          {label}
          {required && <span className={styles.required} aria-hidden>*</span>}
        </span>
      )}

      <div className={optionsCls}>
        {options.map((opt, i) => {
          const isChecked = selected === opt.value

          const itemCls = [
            styles.radio,
            isChecked  ? styles.checked  : '',
            error      ? styles.error    : '',
            opt.disabled ? styles.disabled : '',
          ].filter(Boolean).join(' ')

          // Indexed rather than derived from the value. A value is caller data:
          // "extra large" or "50%" or "a/b" all produce an id that htmlFor still
          // matches but that no querySelector or CSS selector can address, and
          // two values differing only in whitespace collide outright.
          const inputId = `${groupId}-option-${i}`

          return (
            <label key={opt.value} className={itemCls} htmlFor={inputId}>
              <input
                type="radio"
                id={inputId}
                name={name}
                value={opt.value}
                checked={isChecked}
                disabled={opt.disabled}
                className={styles.input}
                onChange={e => handleChange(opt.value, e)}
              />
              <span className={styles.circle} aria-hidden />
              <span className={styles.radioContent}>
                <span className={styles.radioLabel}>{opt.label}</span>
                {opt.hint && <span className={styles.radioHint}>{opt.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>

      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>
      )}
    </div>
  )
})
