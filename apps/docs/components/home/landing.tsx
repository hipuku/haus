'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from 'haus-components'
import { storybookUrl } from '@/lib/shared'
import { Wall } from './wall'
import styles from './landing.module.css'

/*
 * The landing page: the wordmark, what the thing is in two sentences, how to
 * start, and the components in use.
 *
 * Nothing below that. It carried three more sections (the three decisions, a
 * contrast specimen, cards for the site, Storybook and the repository) and each
 * was a claim the docs already make on the page that evidences it. A reader on
 * this page has one question, and the showcase answers it: these are the
 * published components, in real states, reading the tokens a consumer gets.
 * They can be tabbed through and the mode can be switched on them, which a
 * screenshot does not allow.
 *
 * No install command either. It was `npx shadcn add @hipuku/badge` under a line
 * explaining that badge is the only one the registry serves, which is a caveat
 * with a release date on it. The command belongs on each component's own page,
 * where `components/install.tsx` prints it from registry.json and refuses to
 * print one that would fail. Here it would be an example that is either stale
 * or arbitrary.
 *
 * It is a page rather than the overview because the two are read by different
 * people. The overview explains the system to someone who has decided to read
 * about it; this page is read by someone deciding whether to.
 *
 * A client component, because `haus-components` is a client library (hooks, a
 * portal, a focus trap) and the page that renders it has to be one too. The
 * route itself stays a server component so it can carry the page's metadata.
 *
 * No version numbers on the page. They would have to come from the packages'
 * own manifests, which carry the next release's name and number rather than
 * what npm serves today: the token package is `@hipuku/tokens` 5.2.0 here and
 * `@hipuku/tokens` on the registry, since the rename shipped with 6.0.0.
 */
export function Landing({ wordmark }: { wordmark: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={`${styles.inner} ${styles.hero}`}>
        {/* The wordmark is the name, so it is the heading. Its own label is
            hidden here: the h1 carries the name once, as text. */}
        <h1 className={styles.title}>
          <span className={styles.visuallyHidden}>haus</span>
          <span aria-hidden="true">{wordmark}</span>
        </h1>
        <p className={styles.lede}>
          Design tokens and 23 React components. The components install into your repository as source through a{' '}
          <Link href="/docs/start/install">shadcn registry</Link>; the tokens install from npm as{' '}
          <code>@hipuku/tokens</code>. Light and dark, four cascade layers, CSS modules.
        </p>
        <div className={styles.actions}>
          <Button asChild variant="primary">
            <Link href="/docs/start/install">Get started</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={storybookUrl} rel="noreferrer" target="_blank">
              Open Storybook
            </a>
          </Button>
        </div>
      </section>

      {/* The components in use. No heading over it: the paragraph above says
          what they are, and each tile names its own. */}
      <section className={`${styles.inner} ${styles.showcase}`}>
        <Wall />
      </section>
    </main>
  )
}
