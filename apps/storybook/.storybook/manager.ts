// Both moved into the core `storybook` package in 9: @storybook/manager-api and
// @storybook/theming no longer exist as installable packages.
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// haus brand applied to the Storybook chrome. The wordmark and logo are served
// from /brand/* via staticDirs in main.ts; plum is aronia (the brand primitive).
const theme = create({
  base: 'light',
  brandTitle: 'haus',
  brandUrl: 'https://haus.hipuku.dev',
  brandImage: '/brand/wordmark.svg',
  brandTarget: '_self',
  colorPrimary: '#623A8F',
  colorSecondary: '#623A8F',
})

addons.setConfig({ theme })
