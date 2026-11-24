'use client'

import Link from 'next/link'
import { Button } from 'haus-components'
import { storybookUrl } from '@/lib/shared'
import styles from './get-started.module.css'

/*
 * The two ways in, on the overview.
 *
 * These were on a separate landing page at `/` that said much the same thing
 * as the overview at `/docs`, so the brand in the header and the first item in
 * the sidebar led to two different pages. There is one page now, and this is
 * the part of the landing worth keeping: a way to start reading and a way to
 * reach the components.
 */
export function GetStarted() {
  return (
    <div className={styles.actions}>
      <Button asChild variant="primary">
        <Link href="/docs/start">Start here</Link>
      </Button>
      <Button asChild variant="secondary">
        <a href={storybookUrl} rel="noreferrer" target="_blank">
          Open Storybook
        </a>
      </Button>
    </div>
  )
}
