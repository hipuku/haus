import React from 'react'
import styles from './Radio.module.css'

export interface RadioOption {
  value:     string
  label:     string
  hint?:     string
  disabled?: boolean
}

export interface RadioGroupProps {
  name:        string
  value?:      string
  defaultValue?: string
  onChange?:   (value: string) => void
  options:     RadioOption[]
  label?:      string
  error?:      string
  required?:   boolean
  orientation?: 'vertical' | 'horizontal'
  className?:  string
}

export function RadioGroup({
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
}: RadioGroupProps) {
  const groupId = React.useId()
  const errorId = error ? `${groupId}-error` : undefined

  const optionsCls = [
    styles.options,
    orientation === 'horizontal' ? styles.horizontal : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={errorId}
      aria-required={required}
      aria-invalid={!!error}
      className={[styles.group, className].filter(Boolean).join(' ')}
    >
      {label && (
        <span id={`${groupId}-label`} className={styles.groupLabel}>
          {label}
          {required && <span className={styles.required} aria-hidden>*</span>}
        </span>
      )}

      <div className={optionsCls}>
        {options.map(opt => {
          const isChecked = value !== undefined
            ? value === opt.value
            : defaultValue === opt.value

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
                checked={value !== undefined ? isChecked : undefined}
                defaultChecked={value === undefined ? opt.value === defaultValue : undefined}
                disabled={opt.disabled}
                className={styles.input}
                onChange={() => onChange?.(opt.value)}
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
}
