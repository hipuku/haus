// manager-api moved into the core `storybook` package in 9: @storybook/manager-api
// no longer exists as an installable package.
import { addons } from 'storybook/manager-api'
import { hausDarkTheme, hausTheme } from './theme'

/**
 * haus brand applied to the Storybook chrome, shared with the docs pages through
 * preview.ts so the two never drift.
 *
 * The chrome follows the operating system rather than the Mode toolbar, because
 * the toolbar says which mode the component is being reviewed in, not which one
 * the reviewer's machine is in. The two brand SVGs carry the same query, so the
 * wordmark is the primary role of whichever chrome it is sitting on; with a
 * light-only chrome it would have gone light plum on white. Read once at load:
 * a machine that changes mode mid-session needs a reload.
 */
const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

addons.setConfig({ theme: prefersDark ? hausDarkTheme : hausTheme })
