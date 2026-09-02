import type { Preview } from '@storybook/react-vite'
// The barrel, in the order the four token files have to load. Storybook is a
// consumer like any other, so it takes the import a consumer is told to take.
import 'haus-tokens/index.css'
// haus-components now ships a compiled stylesheet; importing the package no
// longer pulls its CSS modules in as a side effect of consuming source.
import 'haus-components/styles.css'

const preview: Preview = {
  initialGlobals: { backgrounds: { value: 'surface' } },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    /* The default surface is the default. Only damson-100 was offered, so every
       story rendered on the subtle surface — which is the one place a white card
       is invisible, and the surface most components are not on. */
    backgrounds: {
      options: {
        surface: { name: 'Surface (default)', value: 'var(--haus-color-surface-default)' },
        subtle: { name: 'Subtle', value: 'var(--haus-color-surface-subtle)' },
        sunken: { name: 'Sunken', value: 'var(--haus-color-surface-sunken)' },
        inverse: { name: 'Inverse', value: 'var(--haus-color-surface-inverse)' },
      },
    },
    options: {
      storySort: {
        order: [
          'Tokens', ['Colours', 'Typography', 'Spacing', 'Elevation', 'Motion', 'Layout'],
          'Components',
        ],
      },
    },
    /* The addon was installed and never ran. Every story is checked now, and a
       violation is reported rather than being available to look for. */
    a11y: { test: 'error' },
  },
}

export default preview
