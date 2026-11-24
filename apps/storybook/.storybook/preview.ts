import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import type { Decorator, Preview } from '@storybook/react-vite'
import { createElement, useEffect, useState } from 'react'
import { hausDarkTheme, hausTheme } from './theme'
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
const setMode = (mode: unknown) => {
  document.documentElement.dataset.theme = mode === 'dark' ? 'dark' : 'light'
}

/**
 * Subtle, expressive or reduced, from the toolbar. Sets `data-haus-motion` on
 * the root, the switch a consumer uses (motion.css). Subtle is the default and
 * needs no attribute, so it removes it. Reduced here is the attribute, not the
 * operating system setting, so it can be reviewed without changing the OS.
 */
const setMotion = (motion: unknown) => {
  const root = document.documentElement
  if (motion === 'expressive' || motion === 'reduced') root.dataset.hausMotion = motion
  else delete root.dataset.hausMotion
}

const withMode: Decorator = (Story, context) => {
  setMode(context.globals.mode)
  setMotion(context.globals.motion)
  return Story()
}

/** The Mode global as the docs context holds it, before any change event. */
function initialMode(context: DocsContainerProps['context']): unknown {
  const store = (context as unknown as { store?: { userGlobals?: { get?: () => Record<string, unknown> } } }).store
  return store?.userGlobals?.get?.().mode
}

/**
 * Docs pages follow the Mode toolbar as well. A pure MDX page (the Getting
 * started pages) renders no story, so the decorator above never runs on it:
 * without this, the page kept whatever data-theme the last story left, or fell
 * back to the operating system's setting, and its haus-coloured text could land
 * on Storybook's white docs background in either mode. This sets haus's
 * data-theme and the matching docs theme from the same global.
 */
function ModeDocsContainer(props: DocsContainerProps) {
  const [mode, setModeState] = useState<unknown>(() => initialMode(props.context) ?? 'light')

  useEffect(() => {
    const onGlobals = ({ globals }: { globals: Record<string, unknown> }) => setModeState(globals.mode)
    props.context.channel.on('globalsUpdated', onGlobals)
    props.context.channel.on('setGlobals', onGlobals)
    return () => {
      props.context.channel.off('globalsUpdated', onGlobals)
      props.context.channel.off('setGlobals', onGlobals)
    }
  }, [props.context.channel])

  setMode(mode)
  return createElement(DocsContainer, { ...props, theme: mode === 'dark' ? hausDarkTheme : hausTheme })
}

const preview: Preview = {
  initialGlobals: { backgrounds: { value: 'surface' }, mode: 'light', motion: 'subtle' },
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
    motion: {
      description: 'Motion mode',
      toolbar: {
        title: 'Motion',
        icon: 'transfer',
        items: [
          { value: 'subtle', title: 'Subtle (default)' },
          { value: 'expressive', title: 'Expressive' },
          { value: 'reduced', title: 'Reduced' },
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
    docs: { theme: hausTheme, container: ModeDocsContainer },
  },
}

export default preview
