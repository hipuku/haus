import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions, githubUrl } from '@/lib/layout.shared'
import { SidebarFooter } from '@/components/header-controls'
import { storybookUrl } from '@/lib/shared'

/*
 * The five sections across the top, the pages of the one you are in down the
 * side.
 *
 * `tabMode: 'top'` draws the section switcher in the header. The tabs come from
 * the folders under `content/docs` that are marked `root` in their meta.json,
 * so a new section is a new tab with no list here to keep in step.
 *
 * This replaced components/sidebar-accordion.tsx, which clicked the sidebar's
 * folder triggers to keep one section open at a time. With roots the sidebar
 * holds one section's pages to begin with, so there is nothing left to hold
 * down and no fumadocs DOM to drive.
 */
export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      sidebar={{
        // GitHub and Storybook at the foot. The collapse control is a haus
        // IconButton in the top row.
        collapsible: false,
        footer: <SidebarFooter github={githubUrl} storybook={storybookUrl} />,
      }}
      tabMode="top"
      tree={source.getPageTree()}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  )
}
