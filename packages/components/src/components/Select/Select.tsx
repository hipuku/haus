import React from 'react'
import { Popover } from '../Popover'
import { useListbox } from './useListbox'
import styles from './Select.module.css'

export interface SelectOption {
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

interface SelectBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  /** Shown when nothing is selected. */
  placeholder?: string
  disabled?: boolean
  /**
   * Renders a hidden input so the control still submits inside a plain
   * `<form action>`. Omit it for a purely controlled use.
   */
  name?: string
  /** Lands on the trigger rather than the root. Ruling B5. */
  controlClassName?: string
  /**
   * A line under the control that describes it, read out with it. Stays when
   * there is an `error`, which sits above it. Same as Input's.
   */
  hint?: string
  /**
   * What is wrong with the current choice. Marks the trigger `aria-invalid`,
   * rings it in the error colour, and is announced when it appears.
   */
  error?: string
  /**
   * Render the panel into `document.body`, for a Select inside something that
   * clips: a `Modal` body is `overflow-y: auto`, and an absolute panel is cut
   * off at its edge. Passed straight to `Popover`. haus#68.
   */
  portal?: boolean
  className?: string
}

/* The trigger's contents are the selected option, so a name taken from them
   would be the current value rather than what the control is for, and it would
   change every time the value did. A button is a labelable element and a
   <label> does reach it, which is why `label` renders one with `htmlFor`; what
   it cannot do is supply a name that stays still. So one of these is required,
   exactly as Modal and Tabs require one. */
type SelectLabel = { label: string; 'aria-labelledby'?: never } | { label?: never; 'aria-labelledby': string }

export type SelectProps = SelectBaseProps & SelectLabel

/**
 * Select: a trigger, and a panel of options that haus draws.
 *
 * This is haus's Select. It was `Listbox` until decision 0025, where the native
 * `<select>` it now replaces was retired: measured across core, drift and vault,
 * nothing imported the native one, while two products built this themed control
 * and wrote down the same reason. core: "a styled listbox standing in
 * for `<select>`, whose native popup can't be themed". vault: "a custom dropdown
 * replacing native `<select>`". An option carries a `hint`, a second line an
 * `<option>` cannot hold, and that is the thing both of them needed.
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
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    options,
    value,
    onChange,
    placeholder = 'Select…',
    disabled = false,
    name,
    className,
    controlClassName,
    portal = false,
    hint,
    error,
    label,
    'aria-labelledby': labelledBy,
    'aria-describedby': callerDescribedBy,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const baseId = React.useId()

  // Popover takes exactly one of the two as a union, so it is passed as one
  // object rather than two maybe-undefined props.
  const panelLabel = label !== undefined ? { 'aria-label': label } : { 'aria-labelledby': labelledBy as string }

  // The caller's description first, then the component's own, the order Input
  // reads them in. Every id here is on the trigger, the element announced.
  // The error sits above the hint and the hint stays, as Input's (4.5, Select
  // finding 10), so both describe the trigger, the error first.
  const hintId = hint ? `${baseId}-hint` : undefined
  const errorId = error ? `${baseId}-error` : undefined
  const describedBy = [callerDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined
  // A visible label, as Input's, so a Select in a form is labelled like the
  // fields beside it (finding 1). The trigger is named by it through
  // aria-labelledby; `<label htmlFor>` also moves focus to the trigger on click.
  const labelId = `${baseId}-label`
  const triggerId = `${baseId}-trigger`

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

  /* One highlight that travels between rows (plan 4.1, the indicator role):
     a spring in expressive, an instant swap in subtle and reduced. It is
     measured from the active option, whose offsetParent is the panel. The
     first placement after opening is not animated, so it does not fly in from
     the top. */
  const [indicator, setIndicator] = React.useState<{ top: number; height: number; placed: boolean } | null>(null)

  const listbox = useListbox({
    open,
    labels,
    selectedIndex,
    onSelect: commit,
    onOpenChange: setOpen,
    baseId,
  })

  const { activeIndex, optionId } = listbox
  React.useLayoutEffect(() => {
    if (!open || activeIndex < 0) {
      setIndicator(null)
      return
    }
    const node = document.getElementById(optionId(activeIndex))
    if (!node) return
    const top = node.offsetTop
    const height = node.offsetHeight
    setIndicator(prev =>
      prev && prev.top === top && prev.height === height ? prev : { top, height, placed: prev !== null },
    )
  }, [open, activeIndex, optionId])

  return (
    <div
      ref={ref}
      className={[styles.listbox, className].filter(Boolean).join(' ')}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      {name && <input type="hidden" name={name} value={value} />}
      {label !== undefined && (
        <label id={labelId} htmlFor={triggerId} className={styles.label}>
          {label}
        </label>
      )}
      {/* The panel is placed against this box, so it opens under the trigger
          rather than under a hint or an error below it. */}
      <div className={styles.control}>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className={[styles.trigger, error ? styles.error : '', controlClassName].filter(Boolean).join(' ')}
          disabled={disabled}
          // A combobox rather than a plain button: it is the role that carries
          // aria-activedescendant, without which the highlighted row is
          // announced to nobody.
          role="combobox"
          aria-labelledby={label !== undefined ? labelId : labelledBy}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
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
          <svg
            className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
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
        >
          {indicator && (
            <span
              className={styles.indicator}
              data-placed={indicator.placed || undefined}
              style={{ transform: `translateY(${indicator.top}px)`, blockSize: indicator.height }}
              aria-hidden="true"
            />
          )}
          <ul className={styles.options} role="none">
            {options.map((o, i) => (
              // Keys go to the trigger, which keeps focus and moves the active option
              // through aria-activedescendant (useListbox), so an option takes no key
              // events of its own. Its click is the pointer's way to choose.
              // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events
              <li
                key={o.value}
                id={listbox.optionId(i)}
                role="option"
                aria-selected={i === selectedIndex}
                aria-disabled={o.disabled || undefined}
                // Its place in the list, for expressive's stagger (finding 13).
                style={{ '--haus-option-index': Math.min(i, 4) } as React.CSSProperties}
                className={[
                  styles.option,
                  i === selectedIndex ? styles.selected : '',
                  i === listbox.activeIndex ? styles.active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                // The trigger keeps focus, so a press here must not take it
                // away before the click lands.
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => listbox.setActiveIndex(i)}
                onClick={() => commit(i)}
              >
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{o.label}</span>
                  {o.hint && <span className={styles.optionHint}>{o.hint}</span>}
                </span>
                {/* The selected row carries a check, not only a heavier
                    weight (finding 7). aria-selected is what is announced. */}
                {i === selectedIndex && (
                  <svg
                    className={styles.check}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m3.5 8.5 3 3 6-7" pathLength={1} />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </Popover>
      </div>

      {errorId && (
        <div className={styles.errorSlot}>
          <span id={errorId} className={styles.errorMessage} role="alert">
            <svg className={styles.errorIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.9" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </span>
        </div>
      )}
      {hintId && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  )
})
