import type { Decorator, Preview } from '@storybook/react-vite'
import { hausTheme } from './theme'
// The barrel, in the order the four token files have to load. Storybook is a
// consumer like any other, so it takes the import a consumer is told to take.
import '@hipuku/tokens/index.css'
// haus-components now ships a compiled stylesheet; importing the package no
// longer pulls its CSS modules in as a side effect of consuming source.
import 'haus-components/styles.css'

/**
 * Light or dark, from the toolbar. Sets `data-theme` on the root, which is the
 * same switch a consumer uses (brand-dark.css), so a story shows what a product
 * shows. Light is the default so existing snapshots keep their baseline; the
 * a11y addon checks whichever mode is selected.
 */
const withMode: Decorator = (Story, context) => {
  document.documentElement.dataset.theme = context.globals.mode === 'dark' ? 'dark' : 'light'
  return Story()
}

const preview: Preview = {
  initialGlobals: { backgrounds: { value: 'surface' }, mode: 'light' },
  globalTypes: {
    mode: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withMode],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    /* The default surface is the default. Only damson-100 was offered, so every
       story rendered on the subtle surface, which is the one place a white card
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
        // Docs first as the front door, then the system: tokens, then the
        // components. The nested arrays pin the order inside a group; without
        // them the sidebar falls back to alphabetical, which buries the
        // Introduction behind Contributing.
        order: [
          'Getting started',
          ['Introduction', 'Installation', 'Composition'],
          'Tokens',
          ['Colours', 'Typography', 'Spacing', 'Elevation', 'Motion', 'Layout'],
          'Components',
        ],
      },
    },
    /* The addon was installed and never ran. Every story is checked now, and a
       violation is reported rather than being available to look for. */
    a11y: { test: 'error' },
    // Without an explicit theme the docs pages render in Storybook's default
    // light palette rather than in haus's own chrome.
    docs: { theme: hausTheme },
  },
}

export default preview
