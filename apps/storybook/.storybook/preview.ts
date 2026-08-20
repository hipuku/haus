import type { Preview } from '@storybook/react'
import '@haus/tokens/primitives.css'
import '@haus/tokens/semantics.css'
import '@haus/tokens/motion.css'
// @haus/components now ships a compiled stylesheet; importing the package no
// longer pulls its CSS modules in as a side effect of consuming source.
import '@haus/components/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'oklch(97% 0.006 290)' },   /* damson-100 */
      ],
    },
    options: {
      storySort: {
        order: [
          'Tokens', ['Colours', 'Typography', 'Spacing', 'Elevation', 'Motion', 'Layout'],
        ],
      },
    },
  },
}

export default preview
