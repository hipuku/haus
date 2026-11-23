import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ApiTable } from './api-table'
import { ModuleApi } from './module-api'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ApiTable,
    ModuleApi,
    ...components,
  } satisfies MDXComponents
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
