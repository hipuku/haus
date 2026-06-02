import React from 'react'
import styles from './Toggle.module.css'

export type ToggleSize = 'sm' | 'md'

export interface ToggleProps {
  checked?:        boolean
  defaultChecked?: boolean
  onChange?:       (checked: boolean) => void
  label?:          string
  description?:    string
  size?:           ToggleSize
  disabled?:       boolean
  labelPosition?:  'left' | 'right'
  id?:             string
  name?:           string
  className?:      string
}

export function Toggle({
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
}: ToggleProps) {
  const inputId      = id ?? React.useId()
  const isControlled = checked !== undefined

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isOn = isControlled ? checked : internalChecked

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalChecked(e.target.checked)
    onChange?.(e.target.checked)
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
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      )}

      <input
        type="checkbox"
        role="switch"
        id={inputId}
        name={name}
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        aria-checked={isOn}
        className={styles.input}
        onChange={handleChange}
      />
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
    </label>
  )
}
