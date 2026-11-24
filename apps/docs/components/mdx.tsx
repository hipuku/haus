import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ApiTable } from './api-table'
import { ComponentExamples } from './examples/component-examples'
import { SignInForm, ToneRow } from './examples/composition'
import { Install } from './install'
import { ModuleApi } from './module-api'
import { Notice } from './notice'
import { PackageMeta } from './package-meta'
import { PageIndex } from './page-index'
import { MotionRoles } from './foundations/motion'
import { Ramp, SpaceLadder, SurfaceSamples, Swatches, TypeRole } from './foundations/specimens'
import { Preview } from './preview'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ApiTable,
    ComponentExamples,
    SignInForm,
    ToneRow,
    Install,
    ModuleApi,
    Notice,
    PackageMeta,
    PageIndex,
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
