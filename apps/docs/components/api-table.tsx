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
 * The attributes a component's source takes out of an HTML attribute set,
 * `Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>`, so it can define
 * its own. Each is part of the component's API, and leaving the whole
 * attribute set out of the table dropped Select's required `onChange`, Modal's
 * `title` and Tooltip's `content` without a word. A key that is removed and
 * not redefined is not in the props type, so keeping it adds no row.
 */
function redefined(file: string) {
  const source = readFileSync(path.join(componentsSrc, file), 'utf8')
  return [...source.matchAll(/Omit<\s*React\.\w*Attributes<\w+>\s*,([^>]+)>/g)].flatMap(([, keys]) =>
    [...keys.matchAll(/'([^']+)'/g)].map(([, key]) => key),
  )
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
