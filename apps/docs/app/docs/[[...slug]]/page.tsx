import { source } from '@/lib/source'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { PageActions } from '@/components/page-actions'
import { PageEnd } from '@/components/page-end'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/components/mdx'
import type { Metadata } from 'next'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { gitConfig } from '@/lib/shared'
import { ComponentPrompt } from '@/components/component-prompt'

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body
  const markdownUrl = `${page.url}.md`

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <PageActions
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${encodeURI(page.path)}`}
          markdownUrl={markdownUrl}
        />
        {/* Component pages only: the prompt names a component, its install
            route and the rules it rests on, which a foundation page has no
            equivalent of. */}
        {params.slug?.[0] === 'components' && params.slug[1] && (
          <ComponentPrompt description={page.data.description} name={page.data.title} slug={params.slug[1]} />
        )}
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {/* Room, and a rule, between the page and the previous and next links
            Fumadocs draws after it. */}
        <PageEnd />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
