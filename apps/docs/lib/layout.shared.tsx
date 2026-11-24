import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Wordmark } from '@/components/wordmark'
import { docsRoute, gitConfig, storybookUrl } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // The wordmark rather than the word, and it points at the overview. The
      // site used to have a landing page at `/` and an overview at `/docs`
      // saying much the same thing, so the brand and the first sidebar item
      // led to two different pages. There is one page now.
      title: <Wordmark />,
      url: docsRoute,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    // The three surfaces, named where a reader can reach them: this site
    // explains, Storybook is where the components are exercised, and the
    // repository is where they are built. One job each (plan 4.10).
    //
    // The link is labelled "Storybook" rather than "Workshop". The decision
    // that Storybook is the workshop describes its job, not its name, and a
    // link that leaves the site should say where it goes: a developer already
    // knows what Storybook is, and nobody arrives knowing what a workshop is
    // here. The word stays in the prose, where it explains the job.
    //
    // No `on: 'nav'` any more. That kept these in the header, which was right
    // while a separate landing page had a header; merging it into the overview
    // left the docs layout with no nav bar at all, and the link to Storybook
    // vanished from every page on the site. The sidebar is where it lives now.
    //
    // A "Documentation" entry is deliberately not here: it would point at
    // /docs, which is the Overview item directly above it.
    links: [{ text: 'Storybook', url: storybookUrl, external: true }],
  }
}
