'use client'

import Link from 'next/link'
import { Button } from 'haus-components'
import { storybookUrl } from '@/lib/shared'
import { Wall } from './wall'
import styles from './landing.module.css'

/*
 * The landing page: the name, what the thing is, how to start, and the
 * components themselves.
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
 * `haus-tokens` on the registry until the rename ships.
 */
export function Landing() {
  return (
    <main className={styles.page}>
      <section className={`${styles.inner} ${styles.hero}`}>
        <h1 className={styles.title}>haus</h1>
        <p className={styles.lede}>
          The design system every hipuku app is built on. Components install into your own repository as source, through
          a <Link href="/docs/start/install">shadcn registry</Link>. The tokens underneath them are a package from npm.
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

      {/* No heading over it, and no band behind it. The paragraph above says
          what these are, and the panels are what separates them from the page.
          A tinted band would be a second ground competing with theirs. */}
      <section className={`${styles.inner} ${styles.showcase}`}>
        <Wall />
      </section>
    </main>
  )
}
