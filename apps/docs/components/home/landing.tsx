'use client'

import Link from 'next/link'
import { Button, Card } from 'haus-components'
import { Wall } from './wall'
import { storybookUrl } from '@/lib/shared'
import styles from './landing.module.css'

/*
 * The landing page is drawn with the library it is for. Everything below the
 * first sentence is a published component in a real state, reading the tokens a
 * consumer gets: a screenshot goes stale and a description is always generous,
 * and neither is a thing a reader can tab through.
 *
 * A client component, because `haus-components` is a client library (hooks, a
 * portal, a focus trap) and the page that renders it has to be one too. The
 * route itself stays a server component so it can carry the page's metadata.
 */
export function Landing() {
  return (
    <main className={styles.page}>
      <section className={styles.inner + ' ' + styles.hero}>
        <p className={styles.eyebrow}>Design system</p>
        <h1 className={styles.title}>haus</h1>
        <p className={styles.lede}>
          The design system every hipuku app is built on. Components arrive as source in your own repository, with the
          tokens, the motion and the contrast behind them.
        </p>
        <div className={styles.actions}>
          <Button asChild variant="primary">
            <Link href="/docs">Read the docs</Link>
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
          Once <code>@hipuku</code> is pointed at the registry in your <code>components.json</code>.{' '}
          <Link href="/docs">Set up</Link> is two lines.
        </p>
      </section>

      <section className={styles.section + ' ' + styles.sectionSubtle}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>What you install</h2>
          <p className={styles.body}>
            A copy of the component in your own repository, not a dependency you cannot reach into. Every one of these
            is the published component, rendered here: tab through them, or switch the page to dark and watch them
            follow.
          </p>
          <Wall />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>What is underneath</h2>
          <p className={styles.body}>Three packages a component rests on, each publishable and usable on its own.</p>
          <div className={styles.cards}>
            <Card asChild variant="elevated">
              <Link aria-label="Tokens" href="/docs/packages/tokens">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Tokens</span>
                  <span className={styles.cardBody}>
                    Roles rather than hex codes: a surface, an ink, a border, each with a light and a dark value, and a
                    brand map a product can swap. Contrast is a test, not a hope.
                  </span>
                  <span className={styles.cardLink}>@hipuku/tokens</span>
                </span>
              </Link>
            </Card>
            <Card asChild variant="elevated">
              <Link aria-label="Motion" href="/docs/packages/motion">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Motion</span>
                  <span className={styles.cardBody}>
                    Ten roles, three modes and a cap on every duration, so an interface moves to one vocabulary and
                    answers a reduced-motion setting by construction.
                  </span>
                  <span className={styles.cardLink}>@hipuku/motion</span>
                </span>
              </Link>
            </Card>
            <Card asChild variant="elevated">
              <Link aria-label="Tools" href="/docs/tools/converter">
                <span className={styles.cardInner}>
                  <span className={styles.cardTitle}>Tools</span>
                  <span className={styles.cardBody}>
                    The token converter runs on this site, on the same package a consumer installs, and so do the colour
                    tools.
                  </span>
                  <span className={styles.cardLink}>Converter</span>
                </span>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
