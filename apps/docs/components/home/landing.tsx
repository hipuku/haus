'use client'

import Link from 'next/link'
import { Button, Callout, Card } from 'haus-components'
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
      <section className={styles.hero}>
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
              Open the workshop
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

      <section className={styles.section}>
        <h2 className={styles.heading}>What you install</h2>
        <p className={styles.body}>
          A copy of the component in your own repository, not a dependency you cannot reach into. Every one of these is
          the published component, rendered here.
        </p>
        <Wall />
        <Callout tone="info">
          Each component page lists its API, the command that installs it, and the reason it behaves the way it does.
        </Callout>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>What is underneath</h2>
        <div className={styles.cards}>
          <Card className={styles.card} variant="outlined">
            <h3 className={styles.cardTitle}>Tokens</h3>
            <p className={styles.body}>
              Roles rather than hex codes: a surface, an ink, a border, each with a light and a dark value, and a brand
              map a product can swap. Contrast is a test, not a hope.
            </p>
            <Link className={styles.cardLink} href="/docs/packages/tokens">
              @hipuku/tokens
            </Link>
          </Card>
          <Card className={styles.card} variant="outlined">
            <h3 className={styles.cardTitle}>Motion</h3>
            <p className={styles.body}>
              Ten roles, three modes and a cap on every duration, so an interface moves to one vocabulary and answers a
              reduced-motion setting by construction.
            </p>
            <Link className={styles.cardLink} href="/docs/packages/motion">
              @hipuku/motion
            </Link>
          </Card>
          <Card className={styles.card} variant="outlined">
            <h3 className={styles.cardTitle}>Tools</h3>
            <p className={styles.body}>
              The token converter runs on this site, on the same package a consumer installs, and so do the colour
              tools.
            </p>
            <Link className={styles.cardLink} href="/docs/tools/converter">
              Converter
            </Link>
          </Card>
        </div>
      </section>
    </main>
  )
}
