import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'

/* The landing page had no navigation at all: a reader who did not want the two
   buttons had no way into the docs, the search or the mode switch. */
export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>
}
