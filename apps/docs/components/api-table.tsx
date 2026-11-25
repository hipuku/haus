import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import styles from './api-table.module.css'

const generator = createGenerator()

const componentsSrc = path.resolve(process.cwd(), '../../packages/components/src')

/** Every key of the attribute set, less the ones the component redefines. */
const keys = (attributes: string, kept?: string) =>
  kept ? `Exclude<keyof ${attributes}, ${kept}>` : `keyof ${attributes}`

export type ApiTableProps = {
  file: string
  name: string
  element?: string
  /**
   * The attribute set to leave out, when the component extends more than
   * `HTMLAttributes`. A button also has `disabled`, `form` and `formAction`
   * from `ButtonHTMLAttributes`, and listing those as the component's API
   * buries the four props that are.
   */
  attributes?: string
  /**
   * Attributes that stay in the table, comma separated, beyond the ones the
   * component's source redefines, which are found without being listed.
   */
  keep?: string
}

/**
 * The attributes a component defines for itself, which stay in the table
 * although they share a name with an HTML attribute. Two ways to do that, and
 * both dropped the prop without a word when the table left the whole attribute
 * set out:
 *
 * - taken out and redefined, `Omit<React.HTMLAttributes<HTMLDivElement>,
 *   'onChange'>`: Select's required `onChange`, Tooltip's `content`
 * - narrowed in place, `title: string` over the attribute's `title?: string`:
 *   EmptyState's required `title`
 *
 * So the keys named in an `Omit` of an attribute set, and every key declared
 * in an interface or object type in the file. A key that is not in the props
 * type adds no row, so over-collecting costs nothing.
 */
function redefined(file: string) {
  const source = readFileSync(path.join(componentsSrc, file), 'utf8')
  const omitted = [...source.matchAll(/Omit<\s*React\.\w*Attributes<\w+>\s*,([^>]+)>/g)].flatMap(([, keys]) =>
    [...keys.matchAll(/'([^']+)'/g)].map(([, key]) => key),
  )
  const declared = [...source.matchAll(/(?:interface\s+\w+[^{]*|=\s*)\{([^{}]*)\}/g)].flatMap(([, body]) =>
    [...body.matchAll(/^\s*(?:readonly\s+)?'?([\w-]+)'?\??:/gm)].map(([, key]) => key),
  )
  return [...omitted, ...declared]
}

/**
 * What the table is generated from. Shared with the markdown the llms routes
 * serve, so the page and the text an agent reads list the same props.
 */
export function apiTableSource({ file, name, element = 'HTMLElement', attributes, keep }: ApiTableProps) {
  const kept = [...new Set([...(keep?.split(',').map(attribute => attribute.trim()) ?? []), ...redefined(file)])]
    .map(attribute => `'${attribute}'`)
    .join(' | ')
  return {
    generator,
    basePath: componentsSrc,
    props: {
      path: file,
      name: 'Api',
      type: `Omit<${name}, ${keys(attributes ?? `React.HTMLAttributes<${element}>`, kept)}>`,
    },
  }
}

/**
 * The props a component adds, generated from its source. The element's own
 * HTML attributes are left out because they are standard and would bury the
 * few props that are the component's API.
 *
 * `file` is relative to packages/components/src. The generator appends the
 * `Omit` below to that file's own source, so it resolves `React` and the
 * props type the way the component does: the file must import React as
 * `React`, which every component in the package does.
 */
export function ApiTable(props: ApiTableProps) {
  const { generator, basePath, props: table } = apiTableSource(props)
  return (
    <div className={styles.api}>
      <AutoTypeTable generator={generator} options={{ basePath }} {...table} />
    </div>
  )
}
