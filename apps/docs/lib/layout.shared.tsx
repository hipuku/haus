import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Wordmark } from '@/components/wordmark'
import { GitHubButton, SearchButton, SidebarControls, StorybookButton, ThemeButton } from '@/components/header-controls'
import { docsRoute, gitConfig, storybookUrl } from './shared'

/*
 * The five sections of the site, in the sidebar's order.
 *
 * `on: 'nav'` keeps them out of the docs sidebar, which already lists them and
 * their pages. They are in the header on the landing page, where there is no
 * sidebar to carry them, and the docs layout puts the same five across the top
 * as tabs instead (app/docs/layout.tsx).
 *
 * `active: 'nested-url'` so a section is marked while a reader is on any page
 * inside it, rather than only on its index.
 */
/* Each url is where that section's tab goes, which is the section's index page
   if it has one and its first page otherwise. The two have to agree: a label
   that leads somewhere different in the header than in the tab bar is two
   destinations wearing one name. */
const SECTIONS = [
  { text: 'Getting started', url: `${docsRoute}/start` },
  { text: 'Foundations', url: `${docsRoute}/foundations/colour` },
  { text: 'Components', url: `${docsRoute}/components/avatar` },
  { text: 'Packages', url: `${docsRoute}/packages/tokens` },
  { text: 'Tools', url: `${docsRoute}/tools/converter` },
]

/*
 * `home` drops the header's wordmark on the landing page, where the wordmark
 * is already the page's heading a few lines below it.
 */
const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`

export function baseOptions({ home = false }: { home?: boolean } = {}): BaseLayoutProps {
  return {
    nav: {
      // The wordmark rather than the word, and it points at the front page.
      // Not on the landing page, whose heading is the wordmark.
      title: home ? null : <Wordmark />,
      url: '/',
      // In the docs sidebar, the row after the wordmark: mode, search, collapse.
      ...(home ? {} : { children: <SidebarControls /> }),
    },
    // haus IconButtons in place of Fumadocs' own controls; see
    // components/header-controls.tsx. The docs sidebar's search is in its top
    // row, so its own full-width slot is left empty.
    searchToggle: {
      components: { lg: home ? <SearchButton /> : <></>, sm: <SearchButton /> },
    },
    // The docs sidebar draws mode in its top row and Storybook and GitHub in
    // its footer, so the switch and the icon links are the landing header's
    // alone. Without either, Fumadocs' bordered footer pill hides.
    themeSwitch: home ? { component: <ThemeButton /> } : { enabled: false },
    links: [
      ...SECTIONS.map(section => ({ ...section, active: 'nested-url' as const, on: 'nav' as const })),
      ...(home
        ? [
            // A labelled link in the landing page's mobile menu, where a reader
            // looks for it in a list; an icon in its header.
            { text: 'Storybook', url: storybookUrl, external: true, on: 'menu' as const },
            { type: 'custom' as const, secondary: true, children: <StorybookButton href={storybookUrl} /> },
            { type: 'custom' as const, secondary: true, children: <GitHubButton href={githubUrl} /> },
          ]
        : []),
    ],
  }
}

export { githubUrl }
