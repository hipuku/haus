import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName, docsRoute, gitConfig, storybookUrl } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    // The three surfaces, named where a reader can reach them: this site
    // explains, the workshop is where the components are exercised, and the
    // repository is where they are built. One job each (plan 4.10).
    links: [
      { text: 'Docs', url: docsRoute },
      { text: 'Workshop', url: storybookUrl, external: true },
    ],
  }
}
