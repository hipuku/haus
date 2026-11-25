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
  const section = params.slug?.[0]

  /*
   * Every page but a tool's carries the page actions.
   *
   * A tool page is a running app with a three-sentence lede. Its markdown is
   * that lede and a tag, so Copy Markdown would hand a reader the one part of
   * the page that is not the point, and the two buttons would sit above the
   * field as the first controls a reader meets. The llms routes still serve
   * the page, and lib/llms-markdown.ts writes the tag out as a line saying
   * where the tool runs.
   */
  const actions = section !== 'tools'

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className={actions ? 'mb-0' : undefined}>{page.data.description}</DocsDescription>
      {actions && (
        <div className="flex flex-row gap-2 items-center pb-6">
          <PageActions
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${encodeURI(page.path)}`}
            markdownUrl={markdownUrl}
          />
          {/* Component pages only: the prompt names a component, its install
              route and the rules it rests on, which a foundation page has no
              equivalent of. */}
          {section === 'components' && params.slug?.[1] && (
            <ComponentPrompt description={page.data.description} name={page.data.title} slug={params.slug[1]} />
          )}
        </div>
      )}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {/* Room between the page and the previous and next links after it. */}
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
