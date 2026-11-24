import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Notice } from './notice'
import styles from './install.module.css'

/*
 * What installs this component today, read from `registry.json` rather than
 * typed into the page.
 *
 * Badge is in the registry; the rest arrive with the next release. A page that
 * printed an install command for all of them would be telling a reader to run
 * something that fails, which is the same false green the visual tests were
 * removed for: a page that says it works without checking.
 */
const registry = JSON.parse(readFileSync(path.resolve(process.cwd(), '../../registry.json'), 'utf8')) as {
  items: { name: string }[]
}

const served = new Set(registry.items.map(item => item.name))

export function Install({ name }: { name: string }) {
  const item = name.toLowerCase()

  if (!served.has(item)) {
    return (
      <Notice tone="info">
        Not in the registry yet. Badge is the one component the registry serves today; the rest go in together once the
        packages are published, so that a command on this page is a command that works.
      </Notice>
    )
  }

  return (
    <pre className={styles.command}>
      <code>npx shadcn add @hipuku/{item}</code>
    </pre>
  )
}
