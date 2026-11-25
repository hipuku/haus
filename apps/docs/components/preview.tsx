import type { ReactNode } from 'react'
import { storybookUrl } from '@/lib/shared'
import { StorybookButton } from './header-controls'
import styles from './preview.module.css'

/**
 * The frame an example is shown in.
 *
 * A component dropped straight onto the page is indistinguishable from the page
 * furniture around it, which is how Badge's four variants read as a stray line
 * of text. A frame says "this is the thing you are installing": its own surface,
 * the system's border and radius, and a link to the same story in the workshop.
 *
 * It does not carry a light and dark switch of its own. haus's dark map applies
 * at the root (`brand-dark.css`), so a subtree cannot be put in the other mode,
 * and a switch that did nothing would be worse than none: the page's own toggle
 * moves the whole page, examples included.
 */
export function Preview({
  children,
  story,
  of,
  layout = 'row',
}: {
  children: ReactNode
  /** The story's export name, for the link to the workshop. */
  story?: string
  /** The component the story belongs to, as Storybook titles it. */
  of?: string
  layout?: 'row' | 'column' | 'start'
}) {
  // Storybook's own id scheme: the title, lowercased and hyphenated, then the
  // story's export name in the same shape.
  const slug = (text: string) =>
    text
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase()
  const workshop = story && of ? `${storybookUrl}/?path=/story/components-${slug(of)}--${slug(story)}` : undefined

  return (
    <figure className={styles.preview}>
      <div className={styles.stage} data-layout={layout} data-of={of} data-story={story}>
        {children}
      </div>
      {/* The story in the workshop, as the header's Storybook control: a
          ghost IconButton, floating at the frame's top right. The section's
          heading already names the example, so there is no caption. */}
      {workshop && (
        <span className={`${styles.workshop} not-prose`}>
          <StorybookButton href={workshop} />
        </span>
      )}
    </figure>
  )
}
