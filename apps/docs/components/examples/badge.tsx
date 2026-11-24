'use client'

import { composeStories } from '@storybook/react'
import * as stories from '../../../storybook/stories/components/Badge.stories'

// The page renders the stories Storybook and the tests use, so the three show
// the same thing.
export const { Tone: BadgeTones, Appearance: BadgeAppearances } = composeStories(stories)
