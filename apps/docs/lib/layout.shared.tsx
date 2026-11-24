import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName, docsRoute, gitConfig, storybookUrl } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
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
    links: [
      // `on: 'nav'` keeps them in the header only. Fumadocs repeats a link in
      // the sidebar by default, so a docs page showed "Docs" and "Workshop"
      // twice, once two centimetres above the other.
      { text: 'Docs', url: docsRoute, on: 'nav' },
      { text: 'Storybook', url: storybookUrl, external: true, on: 'nav' },
    ],
  }
}
