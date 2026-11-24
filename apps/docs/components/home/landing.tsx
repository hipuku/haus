'use client'

import Link from 'next/link'
import { Button, Card } from 'haus-components'
import { Swatches } from '@/components/foundations/specimens'
import { gitConfig, storybookUrl } from '@/lib/shared'
import { Wall } from './wall'
import styles from './landing.module.css'

/*
 * The landing page is drawn with the library it is for. Everything below the
 * first sentence is a published component in a real state, reading the tokens a
 * consumer gets: a screenshot goes stale and a description is always generous,
 * and neither is a thing a reader can tab through.
 *
 * It is a page rather than the overview because the two have different jobs.
 * The overview explains the system to someone who has decided to read about
 * it; this page is read by someone deciding whether to, and the thing that
 * decides it is the components themselves, above the fold, live. The two said
 * the same thing once and were merged for it; the fix for that is one of them
 * saying something else, not one page doing both.
 *
 * A client component, because `haus-components` is a client library (hooks, a
 * portal, a focus trap) and the page that renders it has to be one too. The
 * route itself stays a server component so it can carry the page's metadata.
 *
 * No version numbers on the page. They would have to come from the packages'
 * own manifests, which carry the next release's name and number rather than
 * what npm serves today: the token package is `@hipuku/tokens` 5.2.0 here and
 * `haus-tokens` on the registry until the rename ships. A number nobody can
 * install is the same false green as a command that fails.
 */

/* The decisions a reader can check on this site, each on the page that shows
   the evidence for it rather than the page that asserts it. */
const DECISIONS = [
  {
    title: 'Roles, not values',
    href: '/docs/foundations/colour',
    body: 'A component never names a colour. It names the surface it sits on and the ink it writes in, so one component is correct in a light app, a dark one, and in another product’s brand without a line of it changing.',
  },
  {
    title: 'One mapping, both modes',
    href: '/docs/foundations/theming',
    body: 'Every role answers to the theme on the document and to the reader’s system setting, so a dark mode is the same mapping read again rather than a second set of values that can drift out of step with the first.',
  },
  {
    title: 'The tokens ship on their own',
    href: '/docs/packages/tokens',
    body: 'Tokens are a package on npm, not a file inside a component library. A product can take the foundations without taking the components, which is what makes this a system rather than a folder of components.',
  },
]

export function Landing() {
  return (
    <main className={styles.page}>
      <section className={`${styles.inner} ${styles.hero}`}>
        <p className={styles.eyebrow}>Design system</p>
        <h1 className={styles.title}>A design system that arrives as source in your own repository.</h1>
        <p className={styles.lede}>
          haus ships components through a <Link href="/docs/start/install">shadcn registry</Link> and its design tokens
          as a package on npm. A component you install is a copy you own: restyle it freely, and take behaviour fixes
          back when they land.
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
        <pre className={styles.install}>
          <code>npx shadcn add @hipuku/badge</code>
        </pre>
        <p className={styles.installNote}>
          Badge is the one component the registry serves today. The rest go in together once the packages are published,
          so that a command on this page is a command that works.
        </p>
      </section>

      <section className={`${styles.section} ${styles.sectionSubtle}`}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>What you install</h2>
          <p className={styles.body}>
            A copy of the component in your own repository, not a dependency you cannot reach into. Every one of these
            is the published component, rendered on this page: tab through them, or switch the mode in the header and
            watch them follow.
          </p>
          <Wall />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Three decisions</h2>
          <p className={styles.body}>
            The system is these three, and each has a page on this site showing the values rather than describing them.
          </p>
          <ol className={styles.decisions}>
            {DECISIONS.map((decision, index) => (
              <li className={styles.decision} key={decision.href}>
                <span className={styles.decisionNumber}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.decisionTitle}>
                  <Link href={decision.href}>{decision.title}</Link>
                </h3>
                <p className={styles.decisionBody}>{decision.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSubtle}`}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Measured, not asserted</h2>
          <p className={styles.body}>
            Contrast is a test rather than a hope. Each ratio below is computed from the value this page is rendering,
            in the mode you are reading it in, against the surface the text sits on.
          </p>
          <div className={styles.specimen}>
            <Swatches
              roles={[
                '--haus-color-ink-primary',
                '--haus-color-ink-secondary',
                '--haus-color-ink-tertiary',
                '--haus-color-ink-link',
              ]}
            />
          </div>
          <p className={styles.bodyNote}>
            <Link href="/docs/foundations/colour">Every role, both modes</Link>
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Three surfaces</h2>
          <p className={styles.body}>
            One job each. This site explains the system, Storybook is where the components are exercised, and the
            repository is where they are built.
          </p>
          <div className={styles.cards}>
            <Card asChild variant="elevated">
              <Link aria-label="Documentation" href="/docs">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Documentation</span>
                  <span className={styles.cardBody}>
                    What each component is for, what it takes, and the foundations underneath it, with every value read
                    from the page you are on.
                  </span>
                  <span className={styles.cardLink}>Read the overview</span>
                </span>
              </Link>
            </Card>
            <Card asChild variant="elevated">
              <a aria-label="Storybook" href={storybookUrl} rel="noreferrer" target="_blank">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Storybook</span>
                  <span className={styles.cardBody}>
                    Every component in every state, with its controls exposed: the workshop, where a prop is changed to
                    see what it does.
                  </span>
                  <span className={styles.cardLink}>haus.hipuku.dev</span>
                </span>
              </a>
            </Card>
            <Card asChild variant="elevated">
              <a
                aria-label="Repository"
                href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Repository</span>
                  <span className={styles.cardBody}>
                    The source, the contrast tests, and the decision record that says why each of these is the way it
                    is.
                  </span>
                  <span className={styles.cardLink}>
                    {gitConfig.user}/{gitConfig.repo}
                  </span>
                </span>
              </a>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
