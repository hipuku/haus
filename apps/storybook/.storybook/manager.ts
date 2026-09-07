// manager-api moved into the core `storybook` package in 9: @storybook/manager-api
// no longer exists as an installable package.
import { addons } from 'storybook/manager-api'
import { hausTheme } from './theme'

// haus brand applied to the Storybook chrome, shared with the docs pages through
// preview.ts so the two never drift.
addons.setConfig({ theme: hausTheme })
