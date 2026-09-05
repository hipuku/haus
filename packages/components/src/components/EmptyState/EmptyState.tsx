import React from 'react'
import styles from './EmptyState.module.css'

/**
 * The heading level the title renders at.
 *
 * vault's version renders its title as a `<p>`, so a screen-reader user
 * navigating by heading skips straight past the only thing that says why the
 * region is empty. It looks like a heading and is not one.
 *
 * A level rather than a fixed element, because the right one depends entirely
 * on what the empty state is nested inside, and a component cannot know. `3` is
 * the default because an empty state almost always sits inside a page with an
 * `h1` and a section with an `h2`: right often enough to be useful, and named
 * so the times it is wrong are one prop away.
 */
export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6

/**
 * Whether the empty state announces itself when it appears.
 *
 * Narrower than Callout's on purpose: `off` and `polite`, no `assertive`.
 * Nothing about a region having no content is worth abandoning what a screen
 * reader is already saying, and offering the option would mean somebody
 * eventually takes it.
 */
export type EmptyStateLive = 'off' | 'polite'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Why the region is empty, in a few words.
   *
   * Required, and it is the whole component. An empty region with no
   * explanation is indistinguishable from one that has not loaded, and the
   * writing is the part a design system can actually standardise: what a
   * never-had-anything state says, and how a filtered-to-nothing state says
   * something different.
   */
  title: string
  description?: string
  /** The thing that fills the void. Omit it where nothing the reader can do
   *  would: a filtered-to-nothing state wants "clear the filter", and a
   *  permissions one wants no button at all. */
  action?: React.ReactNode
  /** An illustration or glyph. Decorative: the title carries the meaning. */
  icon?: React.ReactNode
  headingLevel?: EmptyStateHeadingLevel
  live?: EmptyStateLive
}

/**
 * The block that stands in for content that is not there.
 *
 * Twenty-five references across core, drift and vault and no component
 * anywhere (haus#30). It is the least glamorous gap in the system and close to
 * the most frequently hit: every list, every filter and every search result
 * needs one.
 *
 * It belongs in a design system because an empty state is mostly a *writing*
 * decision, and a shared component is where the writing rules live. vault
 * proves the point in the wrong direction: it renders three different
 * situations through one component with no way to tell them apart:
 *
 *   "Add your first colour"            nothing yet, and here is how to start
 *   "No colours match this filter"     plenty here, your filter is too narrow
 *   "Couldn't open your library"       we could not look
 *
 * The third is not an empty state at all. It reads as *there is nothing here*
 * when the truth is *this failed*, and it is announced to nobody. That is what
 * `live` is for, and why `description` and `action` are both optional: the
 * three cases differ in what they say and what they offer, not in their shape.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { title, description, action, icon, headingLevel = 3, live = 'off', className, children, ...rest },
    ref,
  ) {
    const Heading = `h${headingLevel}` as 'h2'
    const cls = [styles.empty, className].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={cls}
        role={live === 'polite' ? 'status' : undefined}
        {...rest}
      >
        {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
        {children}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    )
  },
)
