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
  /** `(value)` rather than the change event: a group has no single control. */
  onChange?:   (value: string) => void
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

  function handleChange(next: string) {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
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
        {options.map(opt => {
          const isChecked = selected === opt.value

          const itemCls = [
            styles.radio,
            isChecked  ? styles.checked  : '',
            error      ? styles.error    : '',
            opt.disabled ? styles.disabled : '',
          ].filter(Boolean).join(' ')

          const inputId = `${groupId}-${opt.value}`

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
                onChange={() => handleChange(opt.value)}
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
