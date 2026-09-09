import React from 'react'
import type { Size } from '../../types'
import { Popover } from '../Popover'
import { useListbox } from './useListbox'
import styles from './Listbox.module.css'

export type ListboxSize = Size

export interface ListboxOption {
  /** Stable identity, and what `onChange` hands back. */
  value: string
  label: string
  /**
   * A second line under the label. This is the thing a native `<select>`
   * cannot show, and it is why both products replaced theirs: an `<option>` is
   * text and the operating system draws it.
   */
  hint?: string
  disabled?: boolean
}

interface ListboxBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: ListboxOption[]
  value: string
  onChange: (value: string) => void
  /** Shown when nothing is selected. */
  placeholder?: string
  size?: ListboxSize
  disabled?: boolean
  /**
   * Renders a hidden input so the control still submits inside a plain
   * `<form action>`. Omit it for a purely controlled use.
   */
  name?: string
  /** Lands on the trigger rather than the root. Ruling B5. */
  controlClassName?: string
  /**
   * Render the panel into `document.body`, for a Listbox inside something that
   * clips: a `Modal` body is `overflow-y: auto`, and an absolute panel is cut
   * off at its edge. Passed straight to `Popover`. haus#68.
   */
  portal?: boolean
  className?: string
}

/* A combobox's name cannot come from its own contents the way a button's can,
   and a wrapping <label> does not reach it either, because a button is not a
   labelable element. So one of these is required, exactly as Modal and Tabs
   require one. */
type ListboxLabel =
  | { label: string; 'aria-labelledby'?: never }
  | { label?: never; 'aria-labelledby': string }

export type ListboxProps = ListboxBaseProps & ListboxLabel

/**
 * A themed listbox: a trigger, and a panel of options that haus draws.
 *
 * Promoted on evidence, decision 0013. haus already ships `Select`, a native
 * `<select>`, and **no consumer imports it**: measured across core, drift,
 * vault and loom, every `Select` import resolves to a product-local component.
 * Meanwhile two products built this one and wrote down the same reason. core:
 * "a styled listbox standing in for `<select>`, whose native popup can't be
 * themed". vault: "a custom dropdown replacing native `<select>`".
 *
 * It does not replace `Select`. Decision 0011 is still right about what it is
 * right about: a native select is the better answer on touch, in a form that
 * must work without JavaScript, and for a list long enough that the operating
 * system's own popup beats anything drawn here. See decision 0020.
 *
 * Focus stays on the trigger the whole time and the highlighted row is
 * announced through `aria-activedescendant`, which is what lets the options be
 * plain `<li role="option">`: `role="option"` has to be a direct child of the
 * listbox, so anything focusable in between makes the structure invalid.
 *
 * Dismissal composes `Popover`, which already owns outside-click and Escape and
 * is deliberately not a focus trap. Trapping focus in a menu is what a modal
 * does, and this is not one.
 */
export const Listbox = React.forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox(
    {
      options,
      value,
      onChange,
      placeholder = 'Select…',
      size = 'md',
      disabled = false,
      name,
      className,
      controlClassName,
      portal = false,
      label,
      'aria-labelledby': labelledBy,
      ...rest
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const baseId = React.useId()

    // Popover takes exactly one of the two as a union, so it is passed as one
    // object rather than two maybe-undefined props.
    const panelLabel = (label !== undefined
      ? { 'aria-label': label }
      : { 'aria-labelledby': labelledBy as string })

    const labels = React.useMemo(() => options.map(o => o.label), [options])
    const selectedIndex = options.findIndex(o => o.value === value)
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

    const commit = React.useCallback(
      (index: number) => {
        const option = options[index]
        if (!option || option.disabled) return
        onChange(option.value)
        setOpen(false)
        triggerRef.current?.focus()
      },
      [options, onChange],
    )

    const listbox = useListbox({
      open,
      labels,
      selectedIndex,
      onSelect: commit,
      onOpenChange: setOpen,
      baseId,
    })

    return (
      <div
        ref={ref}
        className={[styles.listbox, className].filter(Boolean).join(' ')}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {name && <input type="hidden" name={name} value={value} />}
        <button
          ref={triggerRef}
          type="button"
          className={[styles.trigger, styles[size], controlClassName].filter(Boolean).join(' ')}
          disabled={disabled}
          // A combobox rather than a plain button: it is the role that carries
          // aria-activedescendant, without which the highlighted row is
          // announced to nobody.
          role="combobox"
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listbox.controls}
          aria-activedescendant={listbox.activeDescendant}
          onClick={() => setOpen(o => !o)}
          onKeyDown={listbox.onKeyDown}
        >
          <span className={selected ? styles.value : styles.placeholder}>
            {selected ? selected.label : placeholder}
          </span>
          <span className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')} aria-hidden="true">
            {'▾'}
          </span>
        </button>

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
          role="listbox"
          width="trigger"
          portal={portal}
          {...panelLabel}
          id={listbox.listId}
          className={styles.panel}
          data-size={size}
        >
          <ul className={styles.options} role="none">
            {options.map((o, i) => (
              <li
                key={o.value}
                id={listbox.optionId(i)}
                role="option"
                aria-selected={i === selectedIndex}
                aria-disabled={o.disabled || undefined}
                className={[
                  styles.option,
                  i === selectedIndex ? styles.selected : '',
                  i === listbox.activeIndex ? styles.active : '',
                ].filter(Boolean).join(' ')}
                // The trigger keeps focus, so a press here must not take it
                // away before the click lands.
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => listbox.setActiveIndex(i)}
                onClick={() => commit(i)}
              >
                <span className={styles.optionLabel}>{o.label}</span>
                {o.hint && <span className={styles.optionHint}>{o.hint}</span>}
              </li>
            ))}
          </ul>
        </Popover>
      </div>
    )
  },
)
