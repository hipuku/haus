import React from 'react'
import type { Size } from '../../types'
import styles from './Toggle.module.css'

/**
 * Two of the three, because two are what it has designs for. Same reasoning as
 * Button's tone: narrowing the shared union is honest, and adding an `lg` that
 * renders at `md` to satisfy a type is not.
 */
export type ToggleSize = Extract<Size, 'sm' | 'md'>

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /** `(checked, event)`, matching Checkbox and RadioGroup. See Checkbox for why
   *  the event is there. */
  onChange?:       (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
  label?:          string
  description?:    string
  size?:           ToggleSize
  labelPosition?:  'left' | 'right'
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  {
    checked,
    defaultChecked = false,
    onChange,
    label,
    description,
    size = 'md',
    disabled,
    labelPosition = 'left',
    id,
    name,
    className,
    ...rest
  },
  ref,
) {
  // Called unconditionally. See Checkbox for why.
  const generatedId  = React.useId()
  const inputId      = id ?? generatedId
  const labelId       = label ? `${inputId}-label` : undefined
  const descriptionId = description ? `${inputId}-description` : undefined
  const isControlled = checked !== undefined

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isOn = isControlled ? checked : internalChecked

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalChecked(e.target.checked)
    onChange?.(e.target.checked, e)
  }

  const wrapperCls = [
    styles.wrapper,
    isOn           ? styles.on        : '',
    size === 'sm'  ? styles.sm        : '',
    disabled       ? styles.disabled  : '',
    labelPosition === 'right' ? styles.labelRight : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <label className={wrapperCls} htmlFor={inputId}>
      {(label || description) && (
        <span className={styles.content}>
          {label && <span id={labelId} className={styles.label}>{label}</span>}
          {description && (
            <span id={descriptionId} className={styles.description}>{description}</span>
          )}
        </span>
      )}

      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={inputId}
        name={name}
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        aria-checked={isOn}
        // The whole label element wraps both the label and the description, so
        // its text was the accessible name and the description was read as part
        // of it. Naming the label span explicitly scopes the name to the label,
        // and leaves the description to be a description.
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className={styles.input}
        onChange={handleChange}
        {...rest}
      />
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
    </label>
  )
})
