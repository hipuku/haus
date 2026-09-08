import React from 'react'
import type { Tone } from '../../types'
import { Spinner } from '../Spinner'
import styles from './IconButton.module.css'

/**
 * Weight, matching Button's. `text` is absent: it is an underlined word, and
 * there is no word here.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost'

export type IconButtonTone = Tone

/**
 * Two sizes, and both are measured rather than chosen.
 *
 * `md` is 28px, `--haus-control-height-sm`, which is what **both** products
 * already draw their default icon button at: core's `.iconbtn` and vault's
 * `.icon-btn` agree to the pixel, and it is already a haus rung.
 *
 * `sm` is 24px, `--haus-control-height-xs`, added with this component. The
 * products do not agree below `md`: core's smaller step is 22px and vault has
 * 24px and 20px. Two products with three different answers is not evidence for
 * any of them, so haus takes the one that is also a rule. **24px is the WCAG
 * 2.5.8 AA minimum target size**, so core's 22px and vault's 20px are both
 * under the floor and neither should be ported up into the system.
 */
export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * The icon. Required, and the only child: an icon button with a label is a
   * Button, and passing one here would silently produce a square control with
   * text overflowing it.
   */
  icon: React.ReactNode
  /**
   * What it does, for anyone who cannot see the icon. Required, because the
   * accessible name cannot come from the content the way Button's does: an SVG
   * contributes nothing, so without this the control announces as "button" and
   * nothing else. Both products got this right per-site and neither had
   * anything enforcing it.
   */
  label: string
  variant?: IconButtonVariant
  tone?:    IconButtonTone
  size?:    IconButtonSize
  loading?: boolean
}

/**
 * A control that is an icon and nothing else.
 *
 * Promoted on evidence, decision 0013, and the evidence had to be found by
 * behaviour rather than by name: `PORTFOLIO.md` 13.5 recorded core as having
 * none because core's is a CSS class, `.iconbtn`, and not a component file, so
 * a filename search could not see it. Measured properly, core has 7 sites and
 * vault has a full `.icon-btn` set, and **both independently grew a size axis
 * and a tone axis**, which is the same pair Button already carries.
 *
 * Button cannot cover it: Button is a labelled control with inset padding and a
 * 36px minimum, and an icon passed as its only child gives the wrong box and
 * the wrong target size.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      variant = 'secondary',
      tone    = 'neutral',
      size    = 'md',
      loading = false,
      disabled,
      className,
      ...rest
    },
    ref,
  ) {
    const cls = [
      styles.iconButton,
      styles[variant],
      tone !== 'neutral' ? styles[tone] : '',
      styles[size],
      className,
    ].filter(Boolean).join(' ')

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type="button"
        className={cls}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        // The name comes from here, never from the icon.
        aria-label={label}
        {...rest}
      >
        {loading
          ? <Spinner size="text" announcedBy="the button's aria-busy state" />
          : <span className={styles.glyph} aria-hidden="true">{icon}</span>}
      </button>
    )
  },
)
