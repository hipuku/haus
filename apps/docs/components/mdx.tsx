import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ApiTable } from './api-table'
import { ComponentExamples } from './examples/component-examples'
import { Install } from './install'
import { ModuleApi } from './module-api'
import { MotionRoles } from './foundations/motion'
import { Ramp, SpaceLadder, SurfaceSamples, Swatches, TypeRole } from './foundations/specimens'
import { Preview } from './preview'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ApiTable,
    ComponentExamples,
    Install,
    ModuleApi,
    MotionRoles,
    Preview,
    Ramp,
    SpaceLadder,
    SurfaceSamples,
    Swatches,
    TypeRole,
    ...components,
  } satisfies MDXComponents
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
