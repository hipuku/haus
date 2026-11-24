import Link from 'next/link'
import { source } from '@/lib/source'
import styles from './page-index.module.css'

/*
 * Every page in a section, with its description, read from the page tree.
 *
 * The overview used to carry a hand-written list of the components it links
 * to. It had one entry, Badge, while the site had twenty-three component
 * pages: a list maintained by remembering to maintain it, on a site whose
 * whole argument is that nothing here is maintained by remembering.
 */
export function PageIndex({ section }: { section: string }) {
  const prefix = `/docs/${section}/`
  const pages = source
    .getPages()
    .filter(page => page.url.startsWith(prefix))
    .sort((a, b) => a.data.title.localeCompare(b.data.title))

  return (
    <div className={styles.index}>
      {pages.map(page => (
        <Link className={styles.entry} key={page.url} href={page.url}>
          <span className={styles.title}>{page.data.title}</span>
          {page.data.description && <span className={styles.what}>{page.data.description}</span>}
        </Link>
      ))}
    </div>
  )
}
