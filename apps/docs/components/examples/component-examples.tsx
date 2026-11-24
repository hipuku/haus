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

  // A module namespace object is sorted alphabetically, not written in source
  // order, so the page sets its own: the playground, then the vocabulary a
  // reader chooses from, then the states, then the content edge cases, then
  // whatever else the component has.
  const chosen = (only ?? order(Object.keys(stories).filter(key => key !== 'default'))).filter(
    story => !skip.includes(story) && story !== 'Motion' && (only ? true : !BEHAVIOUR.test(story)),
  )

  return (
    <>
      {chosen.map(story => {
        const Story = composed[story as keyof typeof composed] as
          (React.ComponentType & { parameters?: Record<string, unknown>; storyName?: string }) | undefined
        if (!Story) return null
        return (
          <section key={story}>
            <h3>{title(story, Story)}</h3>
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

const ORDER = ['Playground', 'Variant', 'Appearance', 'Tone', 'Size', 'Placement', 'Align', 'States', 'Content']

function order(stories: readonly string[]): string[] {
  const rank = (story: string) => {
    const at = ORDER.indexOf(story)
    return at === -1 ? ORDER.length : at
  }
  return [...stories].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

/**
 * A heading rather than an export name: `ToneByAppearance` is "Tone by
 * appearance" and `AsALink` is "As a link". A story that sets its own `name`
 * keeps it, because that name was written to be read.
 */
function title(story: string, Story: { storyName?: string }): string {
  if (Story.storyName && Story.storyName !== story) return Story.storyName
  const words = story.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
  return words.charAt(0) + words.slice(1).toLowerCase()
}

function description(Story: { parameters?: Record<string, unknown> }): string | undefined {
  const docs = Story.parameters?.docs as { description?: { story?: string } } | undefined
  return docs?.description?.story
}
