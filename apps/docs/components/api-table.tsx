import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import path from 'node:path'
import styles from './api-table.module.css'

const generator = createGenerator()

const componentsSrc = path.resolve(process.cwd(), '../../packages/components/src')

/** Every key of the attribute set, less the ones the component redefines. */
const keys = (attributes: string, kept?: string) =>
  kept ? `Exclude<keyof ${attributes}, ${kept}>` : `keyof ${attributes}`

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
export function ApiTable({
  file,
  name,
  element = 'HTMLElement',
  attributes,
  keep,
}: {
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
   * Attributes the component redefines, comma separated, which stay in the
   * table. Checkbox and Toggle take an `onChange` of their own shape,
   * `(checked, event)`, and omitting the whole attribute set took the one prop
   * a caller most needs to see with it.
   */
  keep?: string
}) {
  const kept = keep
    ?.split(',')
    .map(attribute => `'${attribute.trim()}'`)
    .join(' | ')
  return (
    <div className={styles.api}>
      <AutoTypeTable
        generator={generator}
        options={{ basePath: componentsSrc }}
        path={file}
        name="Api"
        type={`Omit<${name}, ${keys(attributes ?? `React.HTMLAttributes<${element}>`, kept)}>`}
      />
    </div>
  )
}
