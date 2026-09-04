import React from 'react'
import styles from './Tooltip.module.css'

/** Which side of the trigger the bubble sits on. */
export type TooltipPlacement = 'top' | 'bottom'

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content'> {
  /**
   * The text. A string rather than a node, and that is a constraint on purpose:
   * a tooltip that can hold a link or a button is a Popover, and the moment it
   * holds one the WCAG 1.4.13 contract below stops being satisfiable.
   */
  content: string
  placement?: TooltipPlacement
  /**
   * Milliseconds to wait before showing on hover. Never applied to focus — a
   * keyboard user has already committed to the element, and a delay there is
   * just a description that arrives late.
   *
   * Zero by default. A delay is a judgement about a particular density of UI,
   * and a design system guessing 400ms for everybody is a number every consumer
   * ends up overriding.
   */
  delay?: number
  /** The element the tooltip describes. Exactly one, and it must be able to
   *  take focus: a tooltip on a `<span>` is invisible to every user who is not
   *  using a mouse. */
  children: React.ReactElement
}

/**
 * A short description attached to a control.
 *
 * One product has one (vault, `role="tooltip"` × 1). It is the least-used of
 * the six promotions and the easiest to get wrong, which is the whole reason it
 * belongs in the system rather than in a product: the rules below are
 * re-derived per implementation and three of them are silently absent in most
 * hand-rolled tooltips.
 *
 * **WCAG 1.4.13, Content on Hover or Focus**, all three parts:
 *
 * · *Dismissible* — Escape hides it without moving focus, so it cannot obscure
 *   content the user is trying to read.
 * · *Hoverable* — the pointer can travel from the trigger into the bubble
 *   without it vanishing, which is what makes the text selectable.
 * · *Persistent* — it stays until the pointer leaves, focus leaves, or Escape.
 *   No timeout.
 *
 * And the part that is not WCAG but is the most common bug: it appears on
 * **focus** as well as hover. A tooltip that only answers the mouse is not a
 * tooltip, it is a hover effect.
 *
 * **A tooltip is not a Popover.** If it takes focus, holds a link or a button,
 * or runs to more than a line, it is a Popover — and the content here is typed
 * `string` so that stays true rather than being a convention. The other half of
 * the rule: a tooltip must never be the only place a piece of information
 * lives, because touch users have no hover and may never see it.
 */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { content, placement = 'top', delay = 0, className, children, ...rest },
  ref,
) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const clear = () => {
    if (timer.current !== undefined) clearTimeout(timer.current)
    timer.current = undefined
  }
  React.useEffect(() => clear, [])

  const show = (immediate: boolean) => {
    clear()
    if (immediate || delay === 0) setOpen(true)
    else timer.current = setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    clear()
    setOpen(false)
  }

  /* Escape hides it and leaves focus where it is. Listening on the document
     rather than on the trigger because the pointer case has no focused element
     to receive the key at all — a tooltip opened by hover and dismissed by
     Escape is the exact scenario 1.4.13 was written for. */
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      hide()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  })

  /* The one place this package reaches for cloneElement.
   *
   * aria-describedby has to land on the interactive element itself — on a
   * wrapper it describes nothing — and the trigger is the caller's element.
   * Card's note rejects the *generic-polymorphic* `as` pattern, which costs a
   * page of conditional types for props nobody passes; adding one attribute to
   * one child is a different thing. The alternative is asking every caller to
   * pass an id and wire it, which is the step people forget, and forgetting it
   * makes the tooltip invisible to the readers who need it most. */
  const described = React.cloneElement(children, {
    'aria-describedby': [
      (children.props as Record<string, string | undefined>)['aria-describedby'],
      open ? id : undefined,
    ].filter(Boolean).join(' ') || undefined,
  } as Partial<unknown> as never)

  return (
    <span
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
      onPointerEnter={() => show(false)}
      onPointerLeave={hide}
      /* Focus and blur bubble from the trigger inside. No delay on focus. */
      onFocusCapture={() => show(true)}
      onBlurCapture={hide}
      {...rest}
    >
      {described}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={[styles.bubble, styles[placement]].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  )
})
