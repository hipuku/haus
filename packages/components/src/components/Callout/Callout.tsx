import React from 'react'
import type { Tone } from '../../types'
import { ToneIcon } from '../../internal/toneIcons'
import styles from './Callout.module.css'

export type CalloutTone = Tone

/**
 * Whether the callout interrupts.
 *
 * This is the prop the component exists for. drift and vault both built a
 * Callout and each hardcoded a different answer: drift puts `role="alert"` on
 * every one, vault puts `role="note"` on every one. `alert` is an assertive
 * live region — a screen reader abandons what it is saying and reads it — so
 * drift's static "this audit ran against a cached crawl" notice announces
 * itself, unprompted, on every render. axe does not flag that, because nothing
 * in the markup is invalid; it is only wrong in context.
 *
 * · `off` — the notice was always on the page. `role="note"`.
 * · `polite` — it appeared in response to something, and can wait for a pause.
 *   `role="status"`. This is the right answer for most form and save feedback.
 * · `assertive` — it appeared and waiting would cost the reader something.
 *   `role="alert"`. Rare, and worth having to type.
 */
export type CalloutLive = 'off' | 'polite' | 'assertive'

const ROLE: Record<CalloutLive, 'note' | 'status' | 'alert'> = {
  off: 'note',
  polite: 'status',
  assertive: 'alert',
}

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CalloutTone
  live?: CalloutLive
  /**
   * Replaces the tone's glyph, or removes it with `false`.
   *
   * vault's version takes an override and uses it, so this is a measured need
   * rather than an anticipated one. Whatever is passed is decorative: the tone
   * is carried by colour and by the copy, never by the glyph alone.
   */
  icon?: React.ReactNode | false
}

/**
 * An inline notice attached to the thing it is about.
 *
 * Not a Toast. A toast is transient, floats, and is about an event; a callout
 * sits in the flow, stays, and is about the content next to it. Both products
 * that built one used it for form guidance and page-level caveats
 * (haus#28), and neither ever positioned it.
 *
 * Deliberately subtle-only. Toast carries `appearance` because it genuinely had
 * two designs; a solid callout has never been drawn in either product, and
 * inventing one to make the vocabulary symmetrical would be a colour nobody
 * asked for.
 */
export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { tone = 'info', live = 'off', icon, className, children, ...rest },
  ref,
) {
  const cls = [styles.callout, styles[tone], className].filter(Boolean).join(' ')

  return (
    <div ref={ref} role={ROLE[live]} className={cls} {...rest}>
      {icon === false ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon ?? <ToneIcon tone={tone} />}
        </span>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  )
})
