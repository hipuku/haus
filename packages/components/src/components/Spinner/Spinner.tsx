import React from 'react'
import styles from './Spinner.module.css'

/**
 * How large the spinner draws.
 *
 * `text` sizes to `1em`, so it matches whatever it sits beside rather than
 * picking a step. That is the case Button has: a spinner inside a label is a
 * glyph in a line of text, and a fixed size there is wrong at every size the
 * button is not.
 */
export type SpinnerSize = 'text' | 'sm' | 'md'

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: SpinnerSize
  /**
   * What a screen reader announces while this is on screen.
   *
   * Defaulted rather than required, because the failure this component exists
   * to stop is a spinner that announces nothing, and a required prop is one a
   * caller can satisfy with an empty string.
   */
  label?: string
  /**
   * Say that something else already announces the wait, and name it.
   *
   * Typed as the text that speaks instead of as a boolean, deliberately. Every
   * product that got this wrong got it wrong by silencing the spinner and
   * putting nothing in its place: drift renders `aria-hidden="true"` at both
   * its call sites, so a reader waiting on a crawl is told nothing is
   * happening. A boolean would make that the easy thing to write again.
   *
   * The legitimate case is real and vault has it: `<Spinner /> Extracting...`
   * announces twice, once for the spinner and once for the text. Passing the
   * text here silences the spinner and records what covers it.
   */
  announcedBy?: string
}

/**
 * A busy indicator.
 *
 * Promoted on evidence (haus#55, decision 0017). Built independently in all
 * three products and once inside haus's own Button, seven call sites, with four
 * separate `.spinner` rules across core and drift, and three different answers
 * to the only hard part: core renders a lucide SVG with no role, no label and no
 * `aria-hidden`; drift renders a span hidden outright; vault gets it right.
 *
 * The CSS is a keyframe and is not the point. The contract is whether the wait
 * is announced, and whether it is announced twice when the text beside it
 * already says so.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', announcedBy, className, ...rest },
  ref,
) {
  const silent = announcedBy !== undefined

  return (
    <span
      ref={ref}
      className={[styles.spinner, styles[size], className].filter(Boolean).join(' ')}
      // Silent means silent: no role and no label, or a reader meets an empty
      // live region and announces the pause rather than the reason.
      role={silent ? undefined : 'status'}
      aria-label={silent ? undefined : label}
      aria-hidden={silent || undefined}
      // Kept as an attribute rather than dropped, so the reason a spinner is
      // silent is readable in the DOM and assertable in a test. It is not an
      // ARIA attribute and is not read by anything; that is the point.
      data-announced-by={announcedBy}
      {...rest}
    />
  )
})
