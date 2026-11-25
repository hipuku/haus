import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Wordmark } from '@/components/wordmark'
import { GitHubButton, SearchButton, ThemeButton } from '@/components/header-controls'
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
export function baseOptions({ home = false }: { home?: boolean } = {}): BaseLayoutProps {
  return {
    nav: {
      // The wordmark rather than the word, and it points at the overview. The
      // site used to have a landing page at `/` and an overview at `/docs`
      // saying much the same thing, so the brand and the first sidebar item
      // led to two different pages. The landing page is back and says
      // something else, so the wordmark goes to the front page again.
      title: home ? null : <Wordmark />,
      url: '/',
    },
    // The three header controls are haus IconButtons; see
    // components/header-controls.tsx for why they replace Fumadocs' own.
    searchToggle: { components: { lg: <SearchButton />, sm: <SearchButton /> } },
    themeSwitch: { component: <ThemeButton /> },
    links: [
      ...SECTIONS.map(section => ({ ...section, active: 'nested-url' as const, on: 'nav' as const })),
      // Storybook carries no `on`, so it stays in the docs sidebar as well as
      // the header. Dropping it to the header alone is what hid it from every
      // docs page on desktop before, where the docs layout draws no nav bar.
      //
      // Labelled "Storybook" rather than "Workshop": a link that leaves the
      // site should say where it goes, and a developer already knows what
      // Storybook is. The word stays in the prose, where it explains the job.
      { text: 'Storybook', url: storybookUrl, external: true },
      {
        type: 'custom',
        secondary: true,
        children: <GitHubButton href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} />,
      },
    ],
  }
}
