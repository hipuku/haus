'use client'

import { composeStories } from '@storybook/react'
import { Preview } from '../preview'
import { STORIES, type ComponentName } from './stories'

/*
 * A component's examples, taken from its stories.
 *
 * The page does not write its own examples. It renders the stories Storybook
 * shows and the screenshot tests compare, with each story's own description, so
 * the three surfaces cannot drift apart and a story added to the workshop
 * appears here without anyone remembering to add it.
 *
 * Two kinds of story are left out by default. `Motion` is a contract: it exists
 * so the tests can assert durations against the role tokens, and on a page it
 * is a box that moves with no explanation. The ones ending in a behaviour claim
 * ("OneTabStop", "EscapeReturnsFocus") are assertions with play functions; the
 * claim belongs in the prose, and the proof is the test.
 */
const BEHAVIOUR = /^(?:.*(?:ReturnsFocus|MovesThe|OneTabStop|Interrupts|Stays|SubmitsIn|Silent|Outside)).*$/

export function ComponentExamples({
  name,
  only,
  skip = [],
}: {
  name: ComponentName
  /** Show these stories, in this order, instead of all of them. */
  only?: readonly string[]
  skip?: readonly string[]
}) {
  const stories = STORIES[name]
  const composed = composeStories(stories as Parameters<typeof composeStories>[0])

  const chosen = (only ?? Object.keys(composed)).filter(
    story => !skip.includes(story) && story !== 'Motion' && (only ? true : !BEHAVIOUR.test(story)),
  )

  return (
    <>
      {chosen.map(story => {
        const Story = composed[story as keyof typeof composed] as
          (React.ComponentType & { parameters?: Record<string, unknown> }) | undefined
        if (!Story) return null
        return (
          <section key={story}>
            <h3>{title(story)}</h3>
            {description(Story) && <p>{description(Story)}</p>}
            <Preview of={name} story={story}>
              <Story />
            </Preview>
          </section>
        )
      })}
    </>
  )
}

/** `ToneByAppearance` reads as a heading, not as an export name. */
function title(story: string): string {
  const words = story.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return words.charAt(0) + words.slice(1).toLowerCase()
}

function description(Story: { parameters?: Record<string, unknown> }): string | undefined {
  const docs = Story.parameters?.docs as { description?: { story?: string } } | undefined
  return docs?.description?.story
}
