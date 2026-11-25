import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Notice } from './notice'
import styles from './install.module.css'

/*
 * What installs this component today, read from `registry.json` rather than
 * typed into the page.
 *
 * A page prints the command only for an item the registry serves. A page that
 * printed one regardless would be telling a reader to run something that
 * fails, which is the same false green the visual tests were removed for: a
 * page that says it works without checking.
 */
const registry = JSON.parse(readFileSync(path.resolve(process.cwd(), '../../registry.json'), 'utf8')) as {
  items: { name: string }[]
}

export const served = new Set(registry.items.map(item => item.name))

// Item names are kebab case, so `RadioGroup` is `radio-group`. Lowercasing
// alone gave `radiogroup`, which matches nothing.
export const registryName = (name: string) => name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase()

export function Install({ name }: { name: string }) {
  const item = registryName(name)

  if (!served.has(item)) {
    return (
      <Notice tone="info">
        Not in the registry yet, so there is no command to run. Copy it from the haus repository instead.
      </Notice>
    )
  }

  return (
    <pre className={styles.command}>
      <code>npx shadcn add @hipuku/{item}</code>
    </pre>
  )
}
