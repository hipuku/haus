import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'

/* The landing page carries the site's nav rather than two buttons and nothing
   else: a reader who wants the docs, the search or the mode switch has them in
   the same place as on every other page. */
export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions({ home: true })}>{children}</HomeLayout>
}
