import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Notice } from './notice'
import styles from './package-meta.module.css'

/*
 * A package's name and version, read from its package.json at build time.
 *
 * Every one of these pages used to open by restating them in a sentence, and
 * the tokens page still said `haus-tokens` 5.2.0 after the package had been
 * renamed to `@hipuku/tokens`. A version in prose is a version that goes stale
 * the next time anyone runs `npm version`, and this site has one rule about
 * that: the page reads the value, it does not repeat it.
 */
const read = (dir: string) =>
  JSON.parse(readFileSync(path.resolve(process.cwd(), '../../packages', dir, 'package.json'), 'utf8')) as {
    name: string
    version: string
    description?: string
  }

export function PackageMeta({
  dir,
  publishedAs,
}: {
  dir: string
  /**
   * The name npm serves this package under today, when that is not the name in
   * its package.json. Four of the six are on npm under their old `haus-` names
   * while the repository has already been renamed to `@hipuku`, so a page that
   * printed only the new name was telling a reader to install something that
   * returns a 404.
   */
  publishedAs?: string
}) {
  const pkg = read(dir)
  const repo = `https://github.com/hipuku/haus/tree/main/packages/${dir}`

  return (
    <div className={styles.meta}>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Package</dt>
          <dd>{pkg.name}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Version</dt>
          <dd>{pkg.version}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Source</dt>
          <dd>
            <a href={repo} rel="noreferrer" target="_blank">
              packages/{dir}
            </a>
          </dd>
        </div>
      </dl>
      {publishedAs ? (
        <Notice tone="warning">
          On npm as <code>{publishedAs}</code> today, not yet as <code>{pkg.name}</code>. Install the name below; it
          takes the new one at the next release, and this page changes with it.
        </Notice>
      ) : (
        <Notice tone="info">
          Not on npm yet. The six packages are published together, so that the install command on this page is one that
          works the day it appears.
        </Notice>
      )}
    </div>
  )
}
