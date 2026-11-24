'use client'

import Link from 'next/link'
import { Button, Card } from 'haus-components'
import { Swatches } from '@/components/foundations/specimens'
import { gitConfig, storybookUrl } from '@/lib/shared'
import { Wall } from './wall'
import styles from './landing.module.css'

/*
 * The landing page, drawn with the library it is for.
 *
 * Everything below the first paragraph is a published component in a real
 * state, reading the tokens a consumer gets. A reader can tab through it and
 * switch the mode on it, which a screenshot does not allow.
 *
 * It is a page rather than the overview because the two are read by different
 * people. The overview explains the system to someone who has decided to read
 * about it; this page is read by someone deciding whether to. The two said the
 * same thing once and were merged for it, and the fix for that is one of them
 * saying something else.
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

/* Each decision links to the page that shows the values it produces. */
const DECISIONS = [
  {
    title: 'Colour roles',
    href: '/docs/foundations/colour',
    body: 'A component names the surface it sits on and the ink it writes in, never a colour. The same component is correct in a light app, a dark one, and in another brand.',
  },
  {
    title: 'One mapping for both modes',
    href: '/docs/foundations/theming',
    body: 'Each role carries a value per mode, resolved from the theme on the document or the reader’s system setting. There is one mapping rather than a light set and a dark set.',
  },
  {
    title: 'Tokens as their own package',
    href: '/docs/packages/tokens',
    body: 'The tokens are published on npm, separately from the components. A product can take the foundations without taking the components.',
  },
]

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
        <pre className={styles.install}>
          <code>npx shadcn add @hipuku/badge</code>
        </pre>
        <p className={styles.installNote}>
          Badge is the one component the registry serves today. The rest go in together when the packages are published.
        </p>
      </section>

      <section className={`${styles.section} ${styles.sectionSubtle}`}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>What you install</h2>
          <p className={styles.body}>
            Each of these is the published component, rendered on this page. Tab through them, or switch the mode in the
            header.
          </p>
          <Wall />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Decisions</h2>
          <p className={styles.body}>Three choices the rest of the system follows from.</p>
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
          <h2 className={styles.heading}>Contrast</h2>
          <p className={styles.body}>
            Each ratio is computed from the value this page is rendering, in the mode you are reading it in, against the
            surface the text sits on. <code>contrast.test.ts</code> in the token package holds every pair in the system
            against WCAG AA.
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
            This site explains the system. Storybook is where the components are exercised. The repository is where they
            are built.
          </p>
          <div className={styles.cards}>
            <Card asChild variant="elevated">
              <Link aria-label="Documentation" href="/docs">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Documentation</span>
                  <span className={styles.cardBody}>
                    What each component takes, and the foundations underneath it, with the values read from the page you
                    are on.
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
                    Every component in every state, with its controls exposed, for changing a prop to see what it does.
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
                    The source, the contrast tests, and the decision record behind each of these.
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
